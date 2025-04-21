/**
 * PKL-278651-BOUNCE-0005-AUTO - Admin Bounce Automation Routes
 * 
 * This file defines the registration function for Bounce automation routes.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express from 'express';
import bounceAutomationRoutes from './bounce-automation-routes';

/**
 * Register Bounce automation routes with the Express app
 * @param app Express application
 */
export function registerBounceAutomationRoutes(app: express.Express): void {
  // Mount bounce automation routes under admin/bounce/automation
  app.use('/api/admin/bounce/automation', bounceAutomationRoutes);
  
  console.log('[Routes] Registered Bounce automation routes under /api/admin/bounce/automation');
}