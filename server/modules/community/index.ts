/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Module
 * 
 * This is the main export file for the community hub module.
 * Updated to include moderation, notification systems, enhanced member management,
 * and event template management.
 * 
 * Implementation timestamp: 2025-04-20 17:30 ET
 */
import { registerCommunityRoutes } from './routes';
import { registerCommunityModerationRoutes } from '../../routes/community-moderation-routes';
import { registerCommunityNotificationsRoutes } from '../../routes/community-notifications-routes';
import memberManagementRoutes from '../../routes/community-member-management-routes-fixed';
import eventTemplatesRoutes from './event-templates-routes-fixed';

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
  
  // Register event templates routes (PKL-278651-COMM-0035-EVENT)
  console.log('[MODULE] Initializing Enhanced Event Display and Templates System (PKL-278651-COMM-0035-EVENT)');
  options.app.use('/api', eventTemplatesRoutes);
  
  return {
    name: 'community-hub',
    version: '1.3.0', // Version updated to reflect new features
  };
}