/**
 * PKL-278651-COMM-0022-FEED
 * Community Module Initialization
 * 
 * This file initializes the community module and its routes.
 * Following Framework 5.1 principles, this preserves all original
 * functionality while adding new activity feed features.
 * 
 * @framework Framework5.1
 * @version 1.1.0
 * @lastModified 2025-04-19
 */

import express from 'express';
import { communityRouter } from './index';
import { isAuthenticated } from '../../auth';
import { initializeWebSocketServer } from '../websocket';
import { Server as HttpServer } from 'http';

/**
 * Initialize community module and register routes
 * @param options Configuration options
 */
export function initializeCommunityModule(options: { app: express.Express, httpServer?: HttpServer }): void {
  console.log('[API] Initializing Community Module (PKL-278651-COMM-0006-HUB) with Activity Feed (PKL-278651-COMM-0022-FEED)');
  
  const { app, httpServer } = options;
  
  // Register routes for both singular and plural endpoints for compatibility
  app.use('/api/communities', isAuthenticated, communityRouter);
  app.use('/api/community', isAuthenticated, communityRouter);
  
  // Initialize WebSocket server for real-time updates if httpServer is provided
  if (httpServer) {
    console.log('[API] Initializing WebSocket server for real-time community updates');
    initializeWebSocketServer(httpServer);
  }
  
  console.log('[API] Community module initialized successfully');
}

export default initializeCommunityModule;