/**
 * Admin routes for the application
 * 
 * PKL-278651-ADMIN-0012-PERF - Framework 5.2 Update
 * PKL-278651-ADMIN-API-001 - Unified Admin API Integration
 * Updated to include new unified admin framework with security-first approach
 * UDF Rule 18-21 Compliance - Admin-first development with comprehensive security
 */
import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { createAdminAPIv1Router } from '../admin/api/v1/index';

/**
 * Register admin routes with the Express application
 * @param app Express application
 */
export async function registerAdminRoutes(app: express.Express): Promise<void> {
  console.log("[API] Registering Admin API routes");
  
  // ===== NEW UNIFIED ADMIN API v1 SYSTEM =====
  // UDF Rule 18-21 Compliance: Security-first admin framework
  try {
    const adminAPIv1Router = createAdminAPIv1Router();
    app.use('/api/admin/v1', adminAPIv1Router);
    console.log("[API] ✅ Unified Admin API v1 routes registered successfully");
    console.log("[API] 🔒 Security: Role-based access control enabled");
    console.log("[API] 📋 Audit: Comprehensive logging enabled");
  } catch (error) {
    console.error('[API] ❌ Error registering Admin API v1 routes:', error);
  }
  
  // NOTE: Legacy admin routes maintained for backward compatibility
  // TODO: Migrate these to new admin API v1 framework following UDF practices
  
  // Register Admin Match Management routes
  try {
    const adminMatchManagementModule = await import('../api/admin/match-management-simple');
    const adminMatchManagementRoutes = adminMatchManagementModule.default || adminMatchManagementModule;
    app.use('/api/admin/match-management', adminMatchManagementRoutes);
    console.log("[API] Admin Match Management routes registered successfully");
  } catch (error) {
    console.error('[API] Error registering Admin Match Management routes:', error);
  }

  // Register Enhanced Match Management routes
  try {
    const enhancedMatchManagementModule = await import('../api/admin/enhanced-match-management');
    const enhancedMatchManagementRoutes = enhancedMatchManagementModule.enhancedMatchManagementRouter;
    app.use('/api/admin/enhanced-match-management', enhancedMatchManagementRoutes);
    console.log("[API] Enhanced Match Management routes registered successfully");
  } catch (error) {
    console.error('[API] Error registering Enhanced Match Management routes:', error);
  }
  
  // Add specific admin routes here (non-dashboard)
}