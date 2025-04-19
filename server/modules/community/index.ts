/**
 * PKL-278651-COMM-0022-FEED
 * Community Module Index
 * 
 * This module exports community-related functionality, including both
 * the original community hub features and the new activity feed.
 * 
 * @framework Framework5.1
 * @version 1.1.0
 * @lastModified 2025-04-19
 */

import { activityFeedRoutes } from './activity-routes';
import { communityRoutes } from './community-routes';
import { Router } from 'express';
import { initializeCommunityModule } from './initialize';
import { activityFeedService } from './activity-service';

// Create the community router
const communityRouter = Router();

// Mount core community routes first to ensure they have precedence
communityRouter.use('/', communityRoutes);

// Mount activity feed routes as a sub-resource
// This follows RESTful conventions where activities are a child resource of communities
communityRouter.use('/activities', activityFeedRoutes);

// Export the community router and initialization function
export { 
  communityRouter, 
  initializeCommunityModule,
  communityRoutes,
  activityFeedRoutes,
  activityFeedService
};

// Export individual services for direct access by other modules
export * from './activity-service';