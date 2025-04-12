/**
 * PKL-278651-TOURN-0002-ADMIN
 * Register Tournament Bracket Routes with Admin Authorization
 * 
 * Updated to use Framework 5.0 principles with balanced access control:
 * - Public endpoints for basic viewing
 * - Admin-only endpoints for management
 */

import express from 'express';
import { Router } from 'express';
import tournamentBracketRoutes from './tournament-bracket-routes';
import { isAuthenticated, isAdmin } from '../auth';

/**
 * Register tournament bracket routes to the Express app with appropriate access controls
 * Framework 5.0: Segmented access patterns for different user roles
 */
export function registerTournamentBracketRoutes(app: express.Express): void {
  console.log("[API] Registering tournament bracket routes with Framework 5.0 access control...");
  
  // Create a dedicated Router for authenticated but non-admin routes
  const standardRoutes = Router();
  
  // Create a dedicated Router for admin-only routes
  const adminRoutes = Router();
  
  // Apply your authentication middleware to all routes as a base requirement
  app.use('/api', isAuthenticated, (req, res, next) => {
    // Get the request path
    const path = req.path;
    
    // Debug logging for authentication
    console.log(`[API][Tournament] Processing request for ${path} with auth: ${req.isAuthenticated()}`);
    
    // Routes that require admin access
    const requiresAdmin = 
      // POST endpoints for creating/updating
      req.method === 'POST' || 
      req.method === 'PUT' || 
      req.method === 'DELETE' ||
      // Admin-specific endpoints that contain these patterns
      path.includes('/admin/');
    
    if (requiresAdmin) {
      // Check admin privileges
      return isAdmin(req, res, next);
    }
    
    // Allow authenticated access to view-only endpoints
    return next();
  }, tournamentBracketRoutes);
  
  console.log("[API] Tournament bracket routes registered with Framework 5.0 access patterns");
}