/**
 * PKL-278651-BOUNCE-0001-CORE
 * Admin Dashboard Routes for Bounce Testing System
 * 
 * This file registers the Bounce testing system admin routes with the Express application.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express from 'express';
import bounceApi from '../api/bounce';
import { isAuthenticated, isAdmin } from '../middleware/auth';

/**
 * Register Bounce admin routes
 * @param app Express application
 */
export function registerBounceAdminRoutes(app: express.Express): void {
  console.log("[API] Registering Bounce Admin API routes");
  
  // Register the Bounce API routes
  app.use('/api/admin/bounce', isAuthenticated, isAdmin, bounceApi);
}