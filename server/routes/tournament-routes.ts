/**
 * Tournament routes for the application
 * PKL-278651-TOURN-SYSTEM - Tournament Management System
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import tournamentApiRoutes from '../api/tournaments';

/**
 * Register tournament routes with the Express application
 * @param app Express application
 */
export function registerTournamentRoutes(app: express.Express): void {
  console.log("[API] Registering Tournament API routes");
  
  // Mount comprehensive tournament management system routes
  app.use('/api/tournaments', tournamentApiRoutes);
  
  console.log("[API] Tournament API routes registered successfully");
}