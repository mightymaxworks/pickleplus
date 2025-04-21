/**
 * Admin routes for the application
 */
import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';

/**
 * Register admin routes with the Express application
 * @param app Express application
 */
export function registerAdminRoutes(app: express.Express): void {
  console.log("[API] Registering Admin API routes");
  
  // Sample admin route
  app.get('/api/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.status(200).json({ message: 'Admin dashboard data' });
  });
}