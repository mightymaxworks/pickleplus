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
export async function registerAdminRoutes(app: express.Express): Promise<void> {
  console.log("[API] Registering Admin API routes");
  
  // NOTE: The previous sample dashboard route was removed to allow the
  // actual dashboard implementation in routes/admin/dashboard.ts to function
  
  // Register Admin Match Management routes
  try {
    const adminMatchManagementModule = await import('../api/admin/match-management');
    const adminMatchManagementRoutes = adminMatchManagementModule.default || adminMatchManagementModule;
    app.use('/api/admin/match-management', adminMatchManagementRoutes);
    console.log("[API] Admin Match Management routes registered successfully");
  } catch (error) {
    console.error('[API] Error registering Admin Match Management routes:', error);
  }
  
  // Add specific admin routes here (non-dashboard)
}