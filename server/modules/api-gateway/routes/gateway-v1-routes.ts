/**
 * PKL-278651-API-0001-GATEWAY
 * Gateway V1 Routes
 * 
 * Main gateway routes that expose Pickle+ functionality to external applications.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from '../middleware/api-key-auth';
import { apiRateLimiter } from '../middleware/rate-limiter';

const router = Router();

// Apply API key authentication and rate limiting to all gateway routes
router.use(apiKeyAuth());
router.use(apiRateLimiter());

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

// Rankings endpoints
router.get('/rankings', async (req: Request, res: Response) => {
  try {
    // Check required scope
    if (!req.apiKey || !req.apiKey.scopes.includes('ranking:read')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Requires ranking:read scope'
      });
    }
    
    // Handle filter parameters
    const tier = req.query.tier;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Internal API call would go here
    // For now, return a placeholder response
    res.json({
      api_version: 'v1',
      data: {
        message: 'This endpoint will return ranking data',
        filters: {
          tier,
          limit
        },
        items: []
      }
    });
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
    request_id: req.id // Assuming request ID middleware is used
  });
});

export default router;