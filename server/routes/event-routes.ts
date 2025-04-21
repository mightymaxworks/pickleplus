/**
 * Event routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register event routes with the Express application
 * @param app Express application
 */
export function registerEventRoutes(app: express.Express): void {
  console.log("[API] Registering Event API routes");
  
  // Sample event route
  app.get('/api/events', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Event data' });
  });
}