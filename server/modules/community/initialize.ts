/**
 * PKL-278651-COMM-0022-FEED
 * Community Module Initialization
 * 
 * This file initializes the community module and its routes.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import express from 'express';
import { communityRouter } from './index';
import { isAuthenticated } from '../../auth';

/**
 * Initialize community module and register routes
 * @param options Configuration options
 */
export function initializeCommunityModule(options: { app: express.Express }): void {
  console.log('[API] Initializing Community Module (PKL-278651-COMM-0022-FEED)');
  
  const { app } = options;
  
  // Register routes
  app.use('/api/community', isAuthenticated, communityRouter);
  
  console.log('[API] Community module initialized successfully');
}

export default initializeCommunityModule;