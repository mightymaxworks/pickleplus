/**
 * Community routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register community routes with the Express application
 * @param app Express application
 */
export function registerCommunityRoutes(app: express.Express): void {
  console.log("[API] Registering Community API routes");
  
  // Sample community route
  app.get('/api/communities', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Community data' });
  });
}