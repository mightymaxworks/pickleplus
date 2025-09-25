/**
 * PKL-278651-API-0001-GATEWAY
 * Gateway V1 Routes
 * 
 * Main gateway routes that expose Pickle+ functionality to external applications.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from '../middleware/api-key-auth';
import { apiRateLimiter } from '../middleware/rate-limiter';
import { algorithmProtection, sanitizeAlgorithmData } from '../middleware/algorithm-protection';
import { getScopeDetails, requiresApproval } from '../config/api-scopes';

const router = Router();

// Apply comprehensive protection to all gateway routes
router.use(apiKeyAuth());
router.use(apiRateLimiter());
router.use(algorithmProtection({
  enableSuspiciousPatternDetection: true,
  enableDataObfuscation: true,
  enableUsageAuditing: true,
  maxBulkRequestSize: 50
}));

// Middleware to add API gateway version headers
router.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Pickle-Version', '1.0');
  next();
});

// User endpoints
router.get('/users/profile', async (req: Request, res: Response) => {
  try {
    // Proxy to internal API with limited/filtered fields
    const userId = req.query.user_id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        error: 'bad_request',
        error_description: 'User ID is required'
      });
    }
    
    // Forward to internal API with appropriate scopes
    if (!req.apiKey || !req.apiKey.scopes.includes('user:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires user:read scope'
      });
    }
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return user profile data'
      }
    });
  } catch (error) {
    console.error('Error in gateway user profile endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// Match endpoints
router.get('/matches', async (req: Request, res: Response) => {
  try {
    // Check required scope
    if (!req.apiKey || !req.apiKey.scopes.includes('match:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires match:read scope'
      });
    }
    
    // Handle pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return match data with pagination',
        page,
        limit,
        total: 0,
        items: []
      }
    });
  } catch (error) {
    console.error('Error in gateway matches endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// Tournament endpoints
router.get('/tournaments', async (req: Request, res: Response) => {
  try {
    // Check required scope
    if (!req.apiKey || !req.apiKey.scopes.includes('tournament:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires tournament:read scope'
      });
    }
    
    // Handle filter parameters
    const status = req.query.status;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return tournament data',
        filters: {
          status,
          startDate,
          endDate
        },
        items: []
      }
    });
  } catch (error) {
    console.error('Error in gateway tournaments endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// Rankings endpoints - IP PROTECTED
router.get('/rankings', async (req: Request, res: Response) => {
  try {
    // Multi-tier scope validation for algorithm protection
    const hasBasicRead = req.apiKey?.scopes.includes('ranking:read');
    const hasAdvancedRead = req.apiKey?.scopes.includes('ranking:advanced');
    const hasAlgorithmAccess = req.apiKey?.scopes.includes('ranking:algorithm'); // Restricted scope
    
    if (!hasBasicRead) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires ranking:read scope'
      });
    }
    
    // Handle filter parameters with rate limiting for bulk extraction protection
    const tier = req.query.tier;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 to prevent bulk extraction
    const page = parseInt(req.query.page as string) || 1;
    
    // Algorithm Protection Logic
    let responseData: any = {
      api_version: 'v1',
      data: {
        // PROTECTED: Only final rankings, no algorithm details
        rankings: [],
        pagination: {
          page,
          limit,
          total: 0
        },
        // Basic tier: Only show final positions
        metadata: hasBasicRead ? {
          tier,
          last_updated: new Date().toISOString(),
          data_freshness: "live" // Don't reveal calculation frequency
        } : undefined
      }
    };
    
    // Advanced tier: Additional context but still no algorithm exposure
    if (hasAdvancedRead) {
      responseData.data.trends = {
        // Show movement trends but not the calculation factors
        direction: "stable", // up/down/stable only
        volatility: "low", // high/medium/low only
        period_compared: "7_days" // Don't reveal decay periods
      };
      
      responseData.data.insights = {
        competitive_density: "high", // Abstract measure, not raw numbers
        tier_distribution: "balanced" // General description only
      };
    }
    
    // RESTRICTED: Algorithm access (only for approved partners)
    if (hasAlgorithmAccess) {
      // Even with algorithm access, limit exposure
      responseData.data.algorithm_metadata = {
        version: "v2.1", // Version only, not implementation details
        last_recalibration: "2025-01-15T00:00:00Z",
        factors_considered: 7, // Count only, not what factors
        confidence_score: 0.95 // Result quality, not methodology
      };
      
      // Log high-privilege access for monitoring
      console.log(`[SECURITY] Algorithm access used by API key: ${(req as any).apiKey?.keyPrefix} for rankings`);
    }
    
    // Add data obfuscation timestamp to prevent reverse engineering
    responseData.data.response_generated = new Date().toISOString();
    
    res.json(responseData);
  } catch (error) {
    console.error('Error in gateway rankings endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// CourtIQ Performance endpoints
router.get('/courtiq/performance', async (req: Request, res: Response) => {
  try {
    // Check required scope
    if (!req.apiKey || !req.apiKey.scopes.includes('courtiq:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires courtiq:read scope'
      });
    }
    
    const userId = req.query.user_id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        error: 'bad_request',
        error_description: 'User ID is required'
      });
    }
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return CourtIQ performance data',
        userId
      }
    });
  } catch (error) {
    console.error('Error in gateway CourtIQ performance endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// Multi-dimensional rankings position endpoint
router.get('/multi-rankings/position', async (req: Request, res: Response) => {
  try {
    // Check required scope
    if (!req.apiKey || !req.apiKey.scopes.includes('ranking:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires ranking:read scope'
      });
    }
    
    const userId = req.query.user_id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        error: 'bad_request',
        error_description: 'User ID is required'
      });
    }
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return multi-dimensional rankings position',
        userId
      }
    });
  } catch (error) {
    console.error('Error in gateway multi-rankings position endpoint:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred processing your request'
    });
  }
});

// Error handler for all gateway routes
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway API error:', err);
  
  // Return standardized error response
  res.status(err.status || 500).json({
    error: err.code || 'server_error',
    error_description: err.message || 'An unexpected error occurred',
    request_id: (req as any).id // Assuming request ID middleware is used
  });
});

export default router;