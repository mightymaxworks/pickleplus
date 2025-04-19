/**
 * PKL-278651-COMM-0022-FEED
 * Community Module Index
 * 
 * This module exports community-related functionality.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { activityFeedRoutes } from './activity-routes';
import { Router } from 'express';
import { initializeCommunityModule } from './initialize';

// Create the community router
const communityRouter = Router();

// Mount activity routes
communityRouter.use('/', activityFeedRoutes);

// Export the community router and initialization function
export { communityRouter, initializeCommunityModule };

// Export individual services
export * from './activity-service';