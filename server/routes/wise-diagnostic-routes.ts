import { Router } from 'express';

const router = Router();

// Helper function to determine token format
function getTokenFormat(token: string): string {
  if (token.startsWith('test_') || token.startsWith('live_')) {
    return 'standard';
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return 'uuid';
  } else if (token.length === 32 && /^[a-f0-9]+$/i.test(token)) {
    return 'hex';
  } else {
    return 'unknown';
  }
}

// Simple test endpoint to verify WISE token works at all
router.get('/simple-test', async (req, res) => {
  const token = process.env.WISE_API_TOKEN;
  
  if (!token) {
    return res.json({ success: false, error: 'No WISE token configured' });
  }

  try {
    // Try the most basic WISE endpoint - profiles
    const response = await fetch('https://api.sandbox.transferwise.tech/v1/profiles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result: any = {
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      result.data = await response.json();
    } else {
      result.error = await response.text();
    }

    res.json(result);

  } catch (error: any) {
    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Comprehensive WISE API diagnostic tool
router.get('/diagnose', async (req, res) => {
  const token = process.env.WISE_API_TOKEN;
  
  if (!token) {
    return res.json({
      success: false,
      error: 'WISE_API_TOKEN not configured'
    });
  }

  const results: any = {
    tokenInfo: {
      format: getTokenFormat(token),
      prefix: token.substring(0, 10) + '...',
      length: token.length
    },
    endpoints: {},
    summary: {
      workingEndpoints: [],
      failedEndpoints: [],
      recommendations: []
    }
  };

  // Define all possible WISE API endpoints and configurations to test
  const testConfigurations = [
    {
      name: 'Standard Sandbox API',
      baseUrl: 'https://api.sandbox.transferwise.tech',
      endpoints: ['/v1/profiles', '/v1/quotes'],
      auth: `Bearer ${token}`
    },
    {
      name: 'Business API v3',
      baseUrl: 'https://api.sandbox.transferwise.tech',
      endpoints: ['/v3/profiles'],
      auth: `Bearer ${token}`
    },
    {
      name: 'Token Auth',
      baseUrl: 'https://api.sandbox.transferwise.tech',
      endpoints: ['/v1/profiles'],
      auth: `Token ${token}`
    }
  ];

  // Test each configuration
  for (const config of testConfigurations) {
    results.endpoints[config.name] = {};
    
    for (const endpoint of config.endpoints) {
      try {
        const headers: any = {
          'Content-Type': 'application/json',
          'Authorization': config.auth
        };

        console.log(`Testing ${config.name} - ${endpoint}`);
        
        const response = await fetch(`${config.baseUrl}${endpoint}`, {
          method: 'GET',
          headers
        });

        const result: any = {
          status: response.status,
          statusText: response.statusText,
          success: response.ok
        };

        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
            results.summary.workingEndpoints.push(`${config.name}: ${endpoint}`);
          } catch (e) {
            result.note = 'Success but no JSON response';
          }
        } else {
          try {
            const errorText = await response.text();
            result.error = errorText;
          } catch (e) {
            result.error = 'Could not read error response';
          }
          results.summary.failedEndpoints.push(`${config.name}: ${endpoint} (${response.status})`);
        }

        results.endpoints[config.name][endpoint] = result;

      } catch (error: any) {
        results.endpoints[config.name][endpoint] = {
          status: 'ERROR',
          error: error.message,
          success: false
        };
        results.summary.failedEndpoints.push(`${config.name}: ${endpoint} (Network Error)`);
      }
    }
  }

  // Generate recommendations based on results
  if (results.summary.workingEndpoints.length > 0) {
    results.summary.recommendations.push('✅ Found working endpoints! See details below.');
    results.summary.recommendations.push('The WISE integration can be configured to use the working endpoints.');
  } else {
    results.summary.recommendations.push('❌ No working endpoints found.');
    results.summary.recommendations.push('Your token may be for a different WISE service (webhooks, notifications, etc.)');
    results.summary.recommendations.push('Contact WISE support to request payment processing API access.');
  }

  // Token-specific recommendations
  if (results.tokenInfo.format === 'uuid') {
    results.summary.recommendations.push('UUID tokens are typically for Business API or Partner API.');
    results.summary.recommendations.push('Check if you need to request "Platform API" access instead.');
  }

  res.json({
    success: true,
    results,
    timestamp: new Date().toISOString()
  });
});

export default router;