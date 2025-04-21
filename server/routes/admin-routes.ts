/**
 * Admin routes for the application
 * 
 * PKL-278651-ADMIN-0012-PERF - Framework 5.2 Update
 * Updated to fix dashboard data issue - removing placeholder route
 * that was overriding the actual dashboard data from dashboard.ts
 */
import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';

/**
 * Register admin routes with the Express application
 * @param app Express application
 */
export function registerAdminRoutes(app: express.Express): void {
  console.log("[API] Registering Admin API routes");
  
  // NOTE: The previous sample dashboard route was removed to allow the
  // actual dashboard implementation in routes/admin/dashboard.ts to function
  
  // Add specific admin routes here (non-dashboard)
}