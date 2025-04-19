/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Module
 * 
 * This is the main export file for the community hub module.
 * Updated to include moderation and notification systems.
 * Implementation timestamp: 2025-04-19 13:15 ET
 */
import { registerCommunityRoutes } from './routes';
import { registerCommunityModerationRoutes } from '../../routes/community-moderation-routes';
import { registerCommunityNotificationsRoutes } from '../../routes/community-notifications-routes';

export interface CommunityModuleOptions {
  app: any;
}

/**
 * Initialize the community hub module
 */
export function initializeCommunityModule(options: CommunityModuleOptions) {
  console.log('[MODULE] Initializing Community Hub Module (PKL-278651-COMM-0006-HUB)');
  
  // Register core community routes
  registerCommunityRoutes(options.app);
  
  // Register moderation system routes (PKL-278651-COMM-0027-MOD)
  console.log('[MODULE] Initializing Community Moderation System (PKL-278651-COMM-0027-MOD)');
  registerCommunityModerationRoutes(options.app);
  
  // Register notification system routes (PKL-278651-COMM-0028-NOTIF)
  console.log('[MODULE] Initializing Community Notification System (PKL-278651-COMM-0028-NOTIF)');
  registerCommunityNotificationsRoutes(options.app);
  
  return {
    name: 'community-hub',
    version: '1.1.0', // Version updated to reflect new features
  };
}