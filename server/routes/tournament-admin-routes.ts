/**
 * PKL-278651-TOURN-0015-MULTI - Tournament Admin Routes Registration
 * 
 * This file registers the tournament admin API routes with the Express app.
 */

import express from 'express';
import tournamentAdminRoutes from '../api/tournament-admin';

/**
 * Register tournament admin routes with the Express app
 * @param app Express application
 */
export function registerTournamentAdminRoutes(app: express.Express): void {
  console.log('[API] Registering Tournament Admin API routes');
  
  // Mount the tournament admin routes
  app.use('/api/tournament-admin', tournamentAdminRoutes);
  
  console.log('[API] Tournament Admin API routes registered successfully');
}