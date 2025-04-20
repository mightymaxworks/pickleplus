/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Module
 * 
 * This is the main export file for the community hub module.
 * Updated to include moderation, notification systems, and enhanced member management.
 * Implementation timestamp: 2025-04-20 15:45 ET
 */
import { registerCommunityRoutes } from './routes';
import { registerCommunityModerationRoutes } from '../../routes/community-moderation-routes';
import { registerCommunityNotificationsRoutes } from '../../routes/community-notifications-routes';
import memberManagementRoutes from '../../routes/community-member-management-routes-fixed';

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
  
  // Register enhanced member management routes (PKL-278651-COMM-0034-MEMBER)
  console.log('[MODULE] Initializing Enhanced Member Management System (PKL-278651-COMM-0034-MEMBER)');
  options.app.use('/api/communities', memberManagementRoutes);
  
  return {
    name: 'community-hub',
    version: '1.2.0', // Version updated to reflect new features
  };
}