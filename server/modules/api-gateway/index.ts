/**
 * PKL-278651-API-0001-GATEWAY
 * API Gateway Module Entry Point
 * 
 * Main entry point for API Gateway module, exposing routes and middleware.
 */

import express from 'express';
import cors from 'cors';
import apiGatewayRouter from './routes';
import { apiKeyAuth } from './middleware/api-key-auth';
import { apiRateLimiter } from './middleware/rate-limiter';

/**
 * Initialize the API Gateway module
 * @param app Express application instance
 */
export function initApiGateway(app: express.Express): void {
  console.log('[API] Initializing API Gateway and Developer Portal (PKL-278651-API-0001-GATEWAY)');
  
  // Configure CORS for API endpoints
  const apiCorsOptions = {
    origin: '*', // In production, this should be more restrictive
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 3600 // Cache preflight request for 1 hour
  };
  
  // Apply API-specific middleware
  app.use('/api/v1', cors(apiCorsOptions));
  
  // Register all API Gateway routes
  app.use('/', apiGatewayRouter);
  
  console.log('[API] API Gateway and Developer Portal initialized successfully');
}

// Expose middleware for use in other modules
export { apiKeyAuth, apiRateLimiter };