/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Components Registration
 * 
 * This file registers all tournament admin components with the admin module
 * following Framework 5.0 modular component registration patterns.
 */

import { AdminTournamentNavItem } from './AdminTournamentNavItem';
import { AdminComponentType } from '@/modules/admin/types';
import { adminComponentRegistry } from '@/modules/admin/services/adminComponentRegistry';

// Track whether we've already registered to prevent duplicate registrations
let hasRegistered = false;

/**
 * Register tournament admin components with the admin module
 * 
 * This follows PKL-278651-ADMIN-0001-CORE component registration pattern
 * and Framework 5.0 modular architecture principles.
 */
export function registerTournamentAdminComponents() {
  // Prevent duplicate registrations which can happen during HMR (hot module replacement)
  if (hasRegistered) {
    console.log('[Tournament] Tournament admin components already registered, skipping');
    return;
  }
  
  try {
    // First, unregister all tournament components from the registry
    adminComponentRegistry.unregisterModuleComponents('tournament');
    
    // Clear any existing nav items with the same path to prevent duplicates
    const existingNavItems = adminComponentRegistry.getNavItems()
      .filter(item => item.path === '/admin/tournaments');
    
    if (existingNavItems.length > 0) {
      console.log('[Tournament] Found existing tournament nav items, clearing...');
      adminComponentRegistry.clearComponentsOfType(AdminComponentType.NAV_ITEM);
      
      // Re-register all other nav items from the admin module
      // This ensures we don't lose other navigation items
      import('@/modules/admin/services/componentRegistrationService')
        .then(({ registerAllAdminComponents }) => {
          registerAllAdminComponents();
          console.log('[Tournament] Re-registered admin components');
          
          // Now register our tournament nav item
          adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
          console.log('[Tournament] Tournament nav item registered');
        });
    } else {
      // If no duplicates found, just register normally
      adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
      console.log('[Tournament] Tournament nav item registered normally');
    }
    
    // Mark as registered to prevent duplicate registrations
    hasRegistered = true;
  } catch (error) {
    console.error('[Tournament] Failed to register tournament admin components:', error);
  }
}