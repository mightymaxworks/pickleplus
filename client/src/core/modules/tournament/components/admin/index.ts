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
  try {
    // For Framework 5.0 compliance, always ensure our components are registered correctly
    // First, unregister all tournament components from the registry
    adminComponentRegistry.unregisterModuleComponents('tournament');
    
    // Register the tournament navigation item in the admin sidebar
    adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
    console.log('[Tournament] Tournament nav item registered successfully');
    
    // Mark as registered to prevent duplicate registrations during development
    hasRegistered = true;
    
    // Check if registration was successful
    const registeredItems = adminComponentRegistry.getNavItems()
      .filter(item => item.path === '/admin/tournaments');
    
    if (registeredItems.length === 0) {
      console.error('[Tournament] Failed to register tournament nav item, not found in registry');
    } else {
      console.log('[Tournament] Verified tournament nav item is in registry');
    }
  } catch (error) {
    console.error('[Tournament] Failed to register tournament admin components:', error);
    hasRegistered = false;
  }
}