/**
 * PKL-278651-TOURN-0002-ADMIN
 * Register Tournament Bracket Routes with Admin Authorization
 * 
 * Updates the tournament bracket routes to require admin privileges
 */

import express from 'express';
import tournamentBracketRoutes from './tournament-bracket-routes';
import { isAuthenticated, isAdmin } from '../auth';

/**
 * Register tournament bracket routes to the Express app
 * All tournament management features require admin access
 */
export function registerTournamentBracketRoutes(app: express.Express): void {
  console.log("[API] Registering tournament bracket routes with admin authorization...");
  
  // Apply authentication and admin middleware to all tournament bracket routes
  app.use('/api', isAuthenticated, isAdmin, tournamentBracketRoutes);
  
  console.log("[API] Tournament bracket routes registered successfully");
}