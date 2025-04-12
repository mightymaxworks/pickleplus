/**
 * PKL-278651-TOURN-0003.1-API
 * Register Match Result Routes with Authentication
 * 
 * Following Framework 5.0 principles with balanced access control:
 * - Authenticated endpoints for match result operations
 */

import express from 'express';
import { Router } from 'express';
import matchResultRoutes from './match-result-routes';
import { isAuthenticated, isAdmin } from '../auth';

/**
 * Register match result routes to the Express app with appropriate access controls
 * Framework 5.0: Segmented access patterns for different user roles
 */
export function registerMatchResultRoutes(app: express.Express): void {
  console.log("[API][PKL-278651-TOURN-0003.1-API] Registering match result routes with Framework 5.0 access control...");
  
  // Apply authentication middleware to all match result routes
  app.use('/api', isAuthenticated, (req, res, next) => {
    // Get the request path
    const path = req.path;
    
    // Debug logging for authentication
    console.log(`[API][PKL-278651-TOURN-0003.1-API] Processing match result request for ${path} with auth: ${req.isAuthenticated()}`);
    
    // Routes that require admin access
    const requiresAdmin = 
      // Admin-specific endpoints that contain these patterns
      path.includes('/admin/') ||
      // Admin operations on matches
      (path.includes('/matches/') && path.includes('/admin/'));
    
    if (requiresAdmin) {
      // Check admin privileges
      return isAdmin(req, res, next);
    }
    
    // Allow authenticated access to standard match result endpoints
    return next();
  }, matchResultRoutes);
  
  console.log("[API][PKL-278651-TOURN-0003.1-API] Match result routes registered with Framework 5.0 access patterns");
}