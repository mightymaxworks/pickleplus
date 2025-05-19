/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament Routes Registration
 * 
 * This file registers the enhanced tournament API routes with the Express app.
 */

import express from 'express';
import enhancedTournamentRouter from '../api/enhanced-tournament';

/**
 * Register enhanced tournament routes with the Express app
 * @param app Express application
 */
export function registerEnhancedTournamentRoutes(app: express.Express): void {
  console.log('[API] Registering Enhanced Tournament API routes');
  app.use('/api/enhanced-tournaments', enhancedTournamentRouter);
  console.log('[API] Enhanced Tournament API routes registered successfully');
}