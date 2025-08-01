import { Router } from 'express';

const router = Router();

// Wise Business API Configuration (Self-Service)
const WISE_API_BASE = 'https://api.transferwise.com';

const WISE_BUSINESS_TOKEN = process.env.WISE_API_TOKEN;

// Business API helper
async function callWiseAPI(endpoint: string, method: string = 'GET', data?: any) {
  if (!WISE_BUSINESS_TOKEN) {
    throw new Error('WISE_API_TOKEN required. Set up Wise Business account and generate API token.');
  }
  
  const url = `${WISE_API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${WISE_BUSINESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Pickle+ Coaching Platform'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = { raw: responseData };
    }

    if (!response.ok) {
      throw new Error(`Wise API error: ${response.status} - ${JSON.stringify(parsedData)}`);
    }

    return parsedData;
  } catch (error) {
    console.error('[WISE Business API] Error:', error);
    throw error;
  }
}

// Business API Routes

// Get profiles
router.get('/business/profiles', async (req, res) => {
  try {
    const profiles = await callWiseAPI('/v1/profiles');
    res.json({
      success: true,
      profiles: profiles,
      integration_type: 'wise_business_api',
      setup_instructions: 'Create Wise Business account → Settings → API Tokens'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api',
      solution: 'Set WISE_API_TOKEN environment variable'
    });
  }
});

// Create quote for coach payout
router.post('/business/quotes', async (req, res) => {
  try {
    const { sourceCurrency, targetCurrency, sourceAmount } = req.body;
    
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found. Complete Wise business account setup.');
    }

    const quote = await callWiseAPI('/v2/quotes', 'POST', {
      profileId: businessProfile.id,
      sourceCurrency,
      targetCurrency,
      sourceAmount,
      payOut: 'BANK_TRANSFER'
    });
    
    res.json({
      success: true,
      quote: {
        id: quote.id,
        sourceCurrency: quote.sourceCurrency,
        targetCurrency: quote.targetCurrency,
        sourceAmount: quote.sourceAmount,
        targetAmount: quote.targetAmount,
        rate: quote.rate,
        fee: quote.fee
      },
      integration_type: 'wise_business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Coach payout workflow
router.post('/business/coach-payout', async (req, res) => {
  try {
    const { coachId, amount, currency, coachBankDetails, sessionReference } = req.body;

    console.log(`[Coach Payout] Processing $${amount} ${currency} payout for coach ${coachId}`);

    // Get business profile
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    // Create quote
    const quote = await callWiseAPI('/v2/quotes', 'POST', {
      profileId: businessProfile.id,
      sourceCurrency: 'USD',
      targetCurrency: currency,
      sourceAmount: amount,
      payOut: 'BANK_TRANSFER'
    });

    res.json({
      success: true,
      payout_simulation: {
        coachId: coachId,
        amount: quote.sourceAmount,
        targetAmount: quote.targetAmount,
        currency: currency,
        rate: quote.rate,
        fee: quote.fee,
        reference: sessionReference,
        status: 'quote_created'
      },
      integration_type: 'wise_business_api',
      next_steps: [
        'Create recipient account with coach bank details',
        'Create transfer using quote ID',
        'Fund transfer from business balance',
        'Monitor transfer status'
      ],
      requirements: [
        'WISE_BUSINESS_API_TOKEN must be configured',
        'Wise business account must be verified',
        'Sufficient balance for transfer amount + fees'
      ]
    });

  } catch (error) {
    console.error('[Coach Payout] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Get balances
router.get('/business/balances', async (req, res) => {
  try {
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    const balances = await callWiseAPI(`/v4/profiles/${businessProfile.id}/balances`);
    
    res.json({
      success: true,
      balances: balances.map((balance: any) => ({
        currency: balance.currency,
        amount: balance.amount?.value || 0,
        available: (balance.amount?.value || 0) - (balance.reservedAmount?.value || 0)
      })),
      integration_type: 'wise_business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Get account balance
router.get('/business/balance', async (req, res) => {
  try {
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    const balances = await callWiseAPI(`/v1/borderless-accounts?profileId=${businessProfile.id}`);
    
    res.json({
      success: true,
      balances: balances,
      integration_type: 'wise_business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Create recipient for receiving money
router.post('/business/recipients', async (req, res) => {
  try {
    const { currency, accountDetails } = req.body;
    
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    const recipient = await callWiseAPI('/v1/accounts', 'POST', {
      profileId: businessProfile.id,
      accountHolderName: 'Pickle+ Demo Recipient',
      currency: currency,
      type: 'email',
      details: {
        email: accountDetails.email || 'demo@pickleplus.com'
      }
    });
    
    res.json({
      success: true,
      recipient: recipient,
      integration_type: 'wise_business_api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Simulate incoming payment (sandbox only)
router.post('/business/simulate-incoming', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Note: This is a simulation endpoint - only works in sandbox
    // In production, you would monitor actual incoming transfers via webhooks
    
    res.json({
      success: true,
      simulation: {
        message: 'Incoming payment simulation',
        amount: amount,
        currency: currency,
        status: 'incoming_payment_waiting',
        note: 'In production, monitor actual transfers via webhooks',
        webhook_setup_required: true
      },
      integration_type: 'wise_business_api_simulation'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

// Get transaction history (for monitoring received payments)
router.get('/business/transactions', async (req, res) => {
  try {
    const profiles = await callWiseAPI('/v1/profiles');
    const businessProfile = profiles.find((p: any) => p.type === 'business') || profiles[0];
    
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    // For demo purposes, create mock account ID
    // In production, you would get this from /v1/borderless-accounts endpoint
    const account = { id: `demo_account_${businessProfile.id}` };
    
    // For demo purposes, we'll return a simulated transaction history
    // In production, you would use webhooks to track real incoming payments
    const mockTransactions = {
      transactions: [
        {
          type: 'DEPOSIT',
          date: new Date().toISOString(),
          amount: {
            value: 500.00,
            currency: 'USD'
          },
          totalFees: {
            value: 0.00,
            currency: 'USD'
          },
          details: {
            type: 'BANK_TRANSFER',
            description: 'Incoming payment from coaching session'
          }
        },
        {
          type: 'CONVERSION',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          amount: {
            value: -300.00,
            currency: 'USD'
          },
          totalFees: {
            value: 2.50,
            currency: 'USD'
          },
          details: {
            type: 'CURRENCY_EXCHANGE',
            description: 'USD to EUR conversion'
          }
        }
      ],
      accountId: account.id,
      note: 'Demo transactions - In production, set up webhooks to monitor real transfers'
    };
    
    res.json({
      success: true,
      transactions: mockTransactions,
      profile_id: businessProfile.id,
      account_id: account.id,
      integration_type: 'wise_business_api_demo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      integration_type: 'wise_business_api'
    });
  }
});

export default router;