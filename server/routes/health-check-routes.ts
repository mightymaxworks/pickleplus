/**
 * PKL-278651-HEALTH-0002-PROD
 * Health Check Routes
 * 
 * This module registers health check endpoints for monitoring
 * application health in production.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import express, { Router } from 'express';
import { healthCheck, dbStatusCheck, memoryCheck } from '../health-checks';

const router = Router();

/**
 * GET /api/health
 * Basic application health check
 */
router.get('/', healthCheck);

/**
 * GET /api/health/db
 * Database connection health check
 */
router.get('/db', dbStatusCheck);

/**
 * GET /api/health/memory
 * Memory usage health check
 */
router.get('/memory', memoryCheck);

/**
 * Register the health check routes with the Express application
 * @param app Express application
 */
export function registerHealthCheckRoutes(app: express.Express): void {
  app.use('/api/health', router);
  
  // Additional standalone endpoints for backward compatibility
  app.get('/api/db-status', dbStatusCheck);
  app.get('/api/memory', memoryCheck);
  
  console.log('Health check routes registered');
}