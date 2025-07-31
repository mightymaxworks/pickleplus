import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Wise API Configuration
const WISE_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.transferwise.com'
  : 'https://api.sandbox.transferwise.tech';

// Validation schemas
const createPaymentQuoteSchema = z.object({
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  sourceAmount: z.number().positive(),
  paymentType: z.enum(['coach_session', 'pcp_certification', 'subscription'])
});

const processPaymentSchema = z.object({
  quoteId: z.string(),
  recipientId: z.string(),
  customerTransactionId: z.string(),
  paymentMethod: z.object({
    type: z.enum(['card', 'bank_transfer']),
    details: z.record(z.any())
  })
});

// Helper function to make Wise API calls
async function callWiseAPI(endpoint: string, method: string = 'GET', data?: any) {
  const url = `${WISE_API_BASE}${endpoint}`;
  const token = process.env.WISE_API_TOKEN;
  
  console.log('WISE API Debug:', {
    url,
    method,
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : 'missing',
    environment: process.env.NODE_ENV || 'development'
  });
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });
  
  console.log('WISE API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('WISE API Error Body:', errorBody);
    throw new Error(`Wise API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  
  return response.json();
}

// Verify Wise webhook signature
function verifyWiseSignature(payload: string, signature: string): boolean {
  if (!process.env.WISE_WEBHOOK_SECRET) {
    console.warn('WISE_WEBHOOK_SECRET not configured, skipping signature verification');
    return true;
  }
  
  try {
    const hmac = crypto.createHmac('sha256', process.env.WISE_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

// Routes

// Create payment quote
router.post('/quote', async (req, res) => {
  try {
    const validatedData = createPaymentQuoteSchema.parse(req.body);
    
    const quote = await callWiseAPI('/v1/quotes', 'POST', {
      sourceCurrency: validatedData.sourceCurrency,
      targetCurrency: validatedData.targetCurrency,
      sourceAmount: validatedData.sourceAmount,
      profile: process.env.WISE_BUSINESS_PROFILE_ID
    });
    
    // Store quote in database for tracking
    // await storage.createPaymentQuote({ ...validatedData, wiseQuoteId: quote.id });
    
    res.json({
      success: true,
      quote: {
        id: quote.id,
        rate: quote.rate,
        fee: quote.fee,
        totalCost: quote.sourceAmount,
        deliveryEstimate: quote.deliveryEstimate
      }
    });
    
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Quote creation failed' 
    });
  }
});

// Create recipient account
router.post('/recipient', async (req, res) => {
  try {
    const { currency, accountHolderName, accountDetails } = req.body;
    
    const recipient = await callWiseAPI('/v1/accounts', 'POST', {
      currency,
      type: 'email', // For coach payments via email
      profile: process.env.WISE_BUSINESS_PROFILE_ID,
      accountHolderName,
      details: accountDetails
    });
    
    res.json({
      success: true,
      recipient: {
        id: recipient.id,
        currency: recipient.currency,
        accountHolderName: recipient.accountHolderName
      }
    });
    
  } catch (error) {
    console.error('Recipient creation error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Recipient creation failed' 
    });
  }
});

// Process payment
router.post('/process', async (req, res) => {
  try {
    const validatedData = processPaymentSchema.parse(req.body);
    
    // Create transfer
    const transfer = await callWiseAPI('/v1/transfers', 'POST', {
      targetAccount: validatedData.recipientId,
      quote: validatedData.quoteId,
      customerTransactionId: validatedData.customerTransactionId,
      details: {
        reference: `Pickle+ ${validatedData.customerTransactionId}`
      }
    });
    
    // Fund the transfer
    const funding = await callWiseAPI(`/v1/transfers/${transfer.id}/payments`, 'POST', {
      type: validatedData.paymentMethod.type.toUpperCase(),
      ...validatedData.paymentMethod.details
    });
    
    // Store payment record
    // await storage.createPayment({
    //   wiseTransferId: transfer.id,
    //   userId: req.user?.id,
    //   amount: transfer.sourceAmount,
    //   currency: transfer.sourceCurrency,
    //   status: 'processing',
    //   paymentType: 'coach_session'
    // });
    
    res.json({
      success: true,
      payment: {
        transferId: transfer.id,
        status: transfer.status,
        amount: transfer.sourceAmount,
        currency: transfer.sourceCurrency,
        reference: transfer.reference
      }
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Payment processing failed' 
    });
  }
});

// Get payment status
router.get('/status/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    
    const transfer = await callWiseAPI(`/v1/transfers/${transferId}`);
    
    res.json({
      success: true,
      status: {
        id: transfer.id,
        status: transfer.status,
        created: transfer.created,
        rate: transfer.rate,
        sourceAmount: transfer.sourceAmount,
        targetAmount: transfer.targetAmount
      }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Status check failed' 
    });
  }
});

// Webhook handler for payment notifications
router.post('/webhook', async (req, res) => {
  try {
    console.log('Wise webhook received:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    const signature = req.headers['x-wise-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    // Skip signature verification if no secret is configured (development mode)
    if (process.env.WISE_WEBHOOK_SECRET && signature && !verifyWiseSignature(payload, signature)) {
      console.error('Webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = req.body;
    
    switch (event.event_type) {
      case 'transfer.completed':
        // Update payment status to completed
        console.log('Payment completed:', event.data.resource.id);
        // await storage.updatePaymentStatus(event.data.resource.id, 'completed');
        break;
        
      case 'transfer.failed':
        // Handle payment failure
        console.log('Payment failed:', event.data.resource.id);
        // await storage.updatePaymentStatus(event.data.resource.id, 'failed');
        break;
        
      case 'transfer.cancelled':
        // Handle payment cancellation
        console.log('Payment cancelled:', event.data.resource.id);
        // await storage.updatePaymentStatus(event.data.resource.id, 'cancelled');
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event_type);
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Coach payout batch processing
router.post('/coach-payout', async (req, res) => {
  try {
    const { coachId, amount, currency, period } = req.body;
    
    // Get coach payout details
    // const coach = await storage.getCoachProfile(coachId);
    
    // Create payout transfer
    const payout = await callWiseAPI('/v1/transfers', 'POST', {
      targetAccount: `coach_${coachId}_account`, // Pre-registered coach account
      quote: await createPayoutQuote(amount, currency),
      customerTransactionId: `payout_${coachId}_${Date.now()}`,
      details: {
        reference: `Pickle+ Coach Payout - ${period}`
      }
    });
    
    res.json({
      success: true,
      payout: {
        transferId: payout.id,
        amount: payout.sourceAmount,
        status: payout.status
      }
    });
    
  } catch (error) {
    console.error('Coach payout error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Payout failed' 
    });
  }
});

// Helper function for coach payout quotes
async function createPayoutQuote(amount: number, currency: string) {
  const quote = await callWiseAPI('/v1/quotes', 'POST', {
    sourceCurrency: currency,
    targetCurrency: currency,
    sourceAmount: amount,
    profile: process.env.WISE_BUSINESS_PROFILE_ID
  });
  return quote.id;
}

// Test endpoint for webhook connectivity
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Wise payment routes are working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    hasToken: !!process.env.WISE_API_TOKEN,
    hasProfileId: !!process.env.WISE_BUSINESS_PROFILE_ID,
    hasSecret: !!process.env.WISE_WEBHOOK_SECRET,
    tokenPrefix: process.env.WISE_API_TOKEN ? process.env.WISE_API_TOKEN.substring(0, 10) + '...' : 'missing',
    profileId: process.env.WISE_BUSINESS_PROFILE_ID || 'missing',
    apiBase: WISE_API_BASE,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;