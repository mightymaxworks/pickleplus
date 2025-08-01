import { Router } from 'express';

const router = Router();

// Wise Business API Configuration (Self-Service)
const WISE_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.wise.com' 
  : 'https://api.sandbox.transferwise.tech';

const WISE_BUSINESS_TOKEN = process.env.WISE_BUSINESS_API_TOKEN;

// Business API helper
async function callWiseAPI(endpoint: string, method: string = 'GET', data?: any) {
  if (!WISE_BUSINESS_TOKEN) {
    throw new Error('WISE_BUSINESS_API_TOKEN required. Set up Wise Business account and generate API token.');
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
      solution: 'Set WISE_BUSINESS_API_TOKEN environment variable'
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

export default router;