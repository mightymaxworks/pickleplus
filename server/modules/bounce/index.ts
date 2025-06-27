/**
 * PKL-278651-BOUNCE-0004-GAME
 * Bounce Module Entry Point
 * 
 * This file initializes the Bounce module and registers its routes and components.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express from 'express';
import { registerBounceGamificationRoutes } from '../../routes/bounce-gamification-routes';
import { registerBounceXpRoutes } from '../../routes/bounce-xp-routes';
import { registerBounceAdminRoutes } from '../../routes/admin-bounce-routes';
import { setupBounceAchievements } from '../../services/bounce-achievements-setup';
import { getEventBus } from '../../core/events/server-event-bus';

let moduleInitialized = false;

/**
 * Initialize the Bounce module and register its routes
 * This connects Bounce testing with the platform's gamification system
 * 
 * @param app Express application instance
 */
export async function initializeBounceModule(app: express.Express): Promise<void> {
  if (moduleInitialized) {
    console.log('[Bounce] Module already initialized, skipping');
    return;
  }

  try {
    console.log('[Bounce] Initializing Bounce module');
    
    // Register API routes
    registerBounceGamificationRoutes(app);
    registerBounceXpRoutes(app);
    registerBounceAdminRoutes(app);
    
    // Setup default achievements
    await setupBounceAchievements();
    
    // Publish module initialized event
    const eventBus = getEventBus();
    eventBus.publish('module:bounce:initialized', {
      timestamp: new Date(),
      message: 'Bounce module initialized successfully'
    });
    
    moduleInitialized = true;
    console.log('[Bounce] Module initialized successfully');
  } catch (error) {
    console.error('[Bounce] Error initializing module:', error);
    throw error;
  }
}