/**
 * PKL-278651-XP-0001-FOUND
 * XP System Module
 * 
 * This module exports the XP service and routes for use in the application.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Express } from 'express';
import { registerXpRoutes } from './xp-routes';
import { xpService } from './xp-service';

/**
 * Initialize the XP system module
 */
export function initializeXpModule(app: Express): void {
  console.log('[XP] Initializing XP system module...');
  
  // Register XP routes
  registerXpRoutes(app);
  
  console.log('[XP] XP system module initialized successfully');
}

export { xpService };