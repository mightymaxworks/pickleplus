/**
 * Match routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register match routes with the Express application
 * @param app Express application
 */
export function registerMatchRoutes(app: express.Express): void {
  console.log("[API] Registering Match API routes");
  
  // Sample match route
  app.get('/api/matches', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Match data' });
  });
}