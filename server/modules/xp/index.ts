/**
 * PKL-278651-XP-0002-UI
 * XP Module Entry Point
 * 
 * Exports and registers XP system routes and components.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import express from 'express';
import xpRoutes from './xp-routes';
import { XpService } from './xp-service';

// Initialize the module and register routes
export function initializeXpModule(app: express.Express): void {
  // Register routes with '/api/xp' prefix
  app.use('/api/xp', xpRoutes);
  
  console.log('[XP] Module initialized successfully');
}

// Export service for use in other modules
export { XpService };