/**
 * PKL-278651-TOURN-0001-BRCKT
 * Register Tournament Bracket Routes
 */

import express from 'express';
import tournamentBracketRoutes from './tournament-bracket-routes';
import { isAuthenticated, isAdmin } from '../auth';

/**
 * Register tournament bracket routes to the Express app
 */
export function registerTournamentBracketRoutes(app: express.Express): void {
  console.log("[API] Registering tournament bracket routes...");
  
  // Apply authentication middleware to all tournament bracket routes
  app.use('/api', isAuthenticated, tournamentBracketRoutes);
  
  console.log("[API] Tournament bracket routes registered successfully");
}