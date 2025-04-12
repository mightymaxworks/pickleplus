/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Components Registration
 * 
 * This file registers all tournament admin components with the admin module
 */

import { AdminTournamentNavItem } from './AdminTournamentNavItem';
import { adminComponentRegistry } from '@/modules/admin/services/adminComponentRegistry';

// Register admin components
export function registerTournamentAdminComponents() {
  // Register navigation item in the admin component registry
  adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
  
  console.log("[Admin] Tournament management components registered");
}

// Auto-execute registration
registerTournamentAdminComponents();