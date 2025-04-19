/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Module
 * 
 * This is the main export file for the community hub module.
 */
import { registerCommunityRoutes } from './routes';

export interface CommunityModuleOptions {
  app: any;
}

/**
 * Initialize the community hub module
 */
export function initializeCommunityModule(options: CommunityModuleOptions) {
  console.log('[MODULE] Initializing Community Hub Module (PKL-278651-COMM-0006-HUB)');
  
  // Register routes
  registerCommunityRoutes(options.app);
  
  return {
    name: 'community-hub',
    version: '1.0.0',
  };
}