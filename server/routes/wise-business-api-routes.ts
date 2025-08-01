import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Wise Business API Configuration (Self-Service Approach)
const WISE_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.wise.com' 
  : 'https://api.sandbox.transferwise.tech';

const WISE_BUSINESS_TOKEN = process.env.WISE_BUSINESS_API_TOKEN;

// Business API authentication headers
function getWiseHeaders() {
  if (!WISE_BUSINESS_TOKEN) {
    throw new Error('WISE_BUSINESS_API_TOKEN required. Set up Wise Business account and generate API token.');
  }
  
  return {
    'Authorization': `Bearer ${WISE_BUSINESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Pickle+ Coaching Platform'
  };
}

// Validation schemas for Business API
const createQuoteSchema = z.object({
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  sourceAmount: z.number().positive().optional(),
  targetAmount: z.number().positive().optional(),
  payoutMethod: z.enum(['bank_transfer', 'swift', 'iban']).default('bank_transfer')
});

const createRecipientSchema = z.object({
  currency: z.string().length(3),
  type: z.enum(['individual', 'business']),
  profile: z.object({
    type: z.enum(['personal', 'business']),
  }),
  accountHolderName: z.string(),
  details: z.record(z.any()) // Bank account details vary by country
});

const createTransferSchema = z.object({
  targetAccount: z.string(), // recipient ID
  quoteUuid: z.string(),
  customerTransactionId: z.string(),
  details: z.object({
    reference: z.string(),
    transferPurpose: z.enum(['coach_payment', 'certification_fee', 'platform_payout']).default('coach_payment')
  })
});

// Helper function for Wise Business API calls
async function callWiseBusinessAPI(endpoint: string, method: string = 'GET', data?: any) {
  const url = `${WISE_API_BASE}${endpoint}`;
  
  console.log(`[WISE Business API] ${method} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: getWiseHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = { raw: responseData };
    }

    console.log(`[WISE Business API] Response: ${response.status}`, parsedData);

    if (!response.ok) {
      throw new Error(`Wise API error: ${response.status} - ${JSON.stringify(parsedData)}`);
    }

    return parsedData;
  } catch (error) {
    console.error(`[WISE Business API] Error:`, error);
    throw error;
  }
}

// Business API Routes

// Get account profiles (required for transfers)
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await callWiseBusinessAPI('/v1/profiles');
    res.json({
      success: true,
      profiles: profiles,
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Ensure WISE_BUSINESS_API_TOKEN is set with a valid Business API token'
    });
  }
});

// Create quote for coach payout
router.post('/quotes', async (req, res) => {
  try {
    const validation = createQuoteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote parameters',
        details: validation.error.issues
      });
    }

    const { sourceCurrency, targetCurrency, sourceAmount, targetAmount } = validation.data;
    
    // Get first available profile (business account)
    const profiles = await callWiseBusinessAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found. Complete Wise business account setup.');
    }

    const quoteData = {
      profileId: businessProfile.id,
      sourceCurrency,
      targetCurrency,
      payOut: 'BANK_TRANSFER',
      ...(sourceAmount && { sourceAmount }),
      ...(targetAmount && { targetAmount })
    };

    const quote = await callWiseBusinessAPI('/v2/quotes', 'POST', quoteData);
    
    res.json({
      success: true,
      quote: {
        id: quote.id,
        sourceCurrency: quote.sourceCurrency,
        targetCurrency: quote.targetCurrency,
        sourceAmount: quote.sourceAmount,
        targetAmount: quote.targetAmount,
        rate: quote.rate,
        fee: quote.fee,
        payOut: quote.payOut,
        expiresAt: quote.expiresAt
      },
      integration_type: 'business_api',
      profile_used: businessProfile.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Create recipient (coach bank account)
router.post('/recipients', async (req, res) => {
  try {
    const validation = createRecipientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient parameters',
        details: validation.error.issues
      });
    }

    const recipientData = validation.data;
    const recipient = await callWiseBusinessAPI('/v1/accounts', 'POST', recipientData);
    
    res.json({
      success: true,
      recipient: {
        id: recipient.id,
        currency: recipient.currency,
        accountHolderName: recipient.accountHolderName,
        type: recipient.type,
        details: recipient.details
      },
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Create transfer (process coach payout)
router.post('/transfers', async (req, res) => {
  try {
    const validation = createTransferSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transfer parameters',
        details: validation.error.issues
      });
    }

    const transferData = validation.data;
    const transfer = await callWiseBusinessAPI('/v1/transfers', 'POST', transferData);
    
    res.json({
      success: true,
      transfer: {
        id: transfer.id,
        user: transfer.user,
        targetAccount: transfer.targetAccount,
        sourceAccount: transfer.sourceAccount,
        quote: transfer.quote,
        status: transfer.status,
        reference: transfer.reference,
        rate: transfer.rate,
        created: transfer.created
      },
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Fund transfer (complete payment)
router.post('/transfers/:transferId/fund', async (req, res) => {
  try {
    const { transferId } = req.params;
    const { type = 'BALANCE' } = req.body; // BALANCE or BANK_TRANSFER
    
    const fundingData = { type };
    const funding = await callWiseBusinessAPI(`/v3/transfers/${transferId}/payments`, 'POST', fundingData);
    
    res.json({
      success: true,
      funding: {
        type: funding.type,
        status: funding.status,
        transferId: transferId
      },
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Get transfer status
router.get('/transfers/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    const transfer = await callWiseBusinessAPI(`/v1/transfers/${transferId}`);
    
    res.json({
      success: true,
      transfer: {
        id: transfer.id,
        status: transfer.status,
        sourceAmount: transfer.sourceAmount,
        targetAmount: transfer.targetAmount,
        rate: transfer.rate,
        created: transfer.created,
        business: transfer.business,
        details: transfer.details
      },
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Get account balances
router.get('/balances', async (req, res) => {
  try {
    const profiles = await callWiseBusinessAPI('/v1/profiles');
    const businessProfile = profiles.find(p => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    const balances = await callWiseBusinessAPI(`/v4/profiles/${businessProfile.id}/balances`);
    
    res.json({
      success: true,
      balances: balances.map(balance => ({
        id: balance.id,
        currency: balance.currency,
        amount: balance.amount,
        reservedAmount: balance.reservedAmount,
        availableAmount: balance.amount.value - balance.reservedAmount.value
      })),
      profile: businessProfile.id,
      integration_type: 'business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api'
    });
  }
});

// Complete coach payout workflow
router.post('/coach-payout', async (req, res) => {
  try {
    const {
      coachId,
      amount,
      currency,
      coachBankDetails,
      sessionReference
    } = req.body;

    console.log(`[Coach Payout] Processing $${amount} ${currency} payout for coach ${coachId}`);

    // Step 1: Create quote
    const profiles = await callWiseBusinessAPI('/v1/profiles');
    const businessProfile = profiles.find(p => p.type === 'business') || profiles[0];
    
    const quote = await callWiseBusinessAPI('/v2/quotes', 'POST', {
      profileId: businessProfile.id,
      sourceCurrency: 'USD', // Platform currency
      targetCurrency: currency,
      sourceAmount: amount,
      payOut: 'BANK_TRANSFER'
    });

    // Step 2: Create/find recipient
    let recipient;
    try {
      recipient = await callWiseBusinessAPI('/v1/accounts', 'POST', {
        currency: currency,
        type: 'individual',
        profile: { type: 'personal' },
        accountHolderName: coachBankDetails.accountHolderName,
        details: coachBankDetails.details
      });
    } catch (error) {
      // If recipient already exists, handle gracefully
      console.log('[Coach Payout] Recipient creation failed, may already exist:', error.message);
      throw new Error('Unable to create recipient account. Please verify bank details.');
    }

    // Step 3: Create transfer
    const transfer = await callWiseBusinessAPI('/v1/transfers', 'POST', {
      targetAccount: recipient.id,
      quoteUuid: quote.id,
      customerTransactionId: `coach-${coachId}-${Date.now()}`,
      details: {
        reference: sessionReference || `Coach payment - Session`,
        transferPurpose: 'coach_payment'
      }
    });

    // Step 4: Fund transfer (from balance)
    const funding = await callWiseBusinessAPI(`/v3/transfers/${transfer.id}/payments`, 'POST', {
      type: 'BALANCE'
    });

    res.json({
      success: true,
      payout: {
        transferId: transfer.id,
        coachId: coachId,
        amount: quote.sourceAmount,
        targetAmount: quote.targetAmount,
        currency: currency,
        rate: quote.rate,
        fee: quote.fee,
        status: transfer.status,
        reference: sessionReference,
        created: transfer.created
      },
      integration_type: 'business_api',
      next_steps: [
        'Monitor transfer status via webhook or polling',
        'Update coach payment record in database',
        'Send confirmation to coach'
      ]
    });

  } catch (error) {
    console.error('[Coach Payout] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      integration_type: 'business_api',
      troubleshooting: [
        'Verify WISE_BUSINESS_API_TOKEN is valid',
        'Ensure Wise business account has sufficient balance',
        'Check coach bank details are correct for target currency',
        'Verify business profile is approved for transfers'
      ]
    });
  }
});

export default router;