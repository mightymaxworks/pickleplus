/**
 * Tournament routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register tournament routes with the Express application
 * @param app Express application
 */
export function registerTournamentRoutes(app: express.Express): void {
  console.log("[API] Registering Tournament API routes");
  
  // Sample tournament route
  app.get('/api/tournaments', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Tournament data' });
  });
}