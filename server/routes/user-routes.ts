/**
 * User routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register user routes with the Express application
 * @param app Express application
 */
export function registerUserRoutes(app: express.Express): void {
  console.log("[API] Registering User API routes");
  
  // Sample user route
  app.get('/api/users/profile', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'User profile data' });
  });
}