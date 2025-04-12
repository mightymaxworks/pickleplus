/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Components Registration
 * 
 * This file registers all tournament admin components with the admin module
 */

import { AdminTournamentNavItem } from './AdminTournamentNavItem';
import { adminModule } from '@/modules/admin';
import { adminComponentRegistry } from '@/modules/admin/services/adminComponentRegistry';
import { eventBus, Events } from '@/core/events/eventBus';

// Track whether we've already registered to prevent duplicate registrations
let hasRegistered = false;

export function registerTournamentAdminComponents() {
  // Prevent duplicate registrations which can happen during HMR (hot module replacement)
  if (hasRegistered) {
    console.log('[Tournament] Tournament admin components already registered, skipping');
    return;
  }
  
  // Register the tournament navigation item in the admin sidebar
  adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
  
  // Get current nav items for verification
  const adminAPI = adminModule.exports as any;
  const allNavItems = adminAPI.getNavItems();
  console.log('[Tournament] Registered tournament nav item. Total nav items:', allNavItems.length);
  
  // Mark as registered
  hasRegistered = true;
  
  // Explicitly publish an event to update all components using the nav items
  eventBus.publish(Events.ADMIN_NAV_UPDATED, { added: AdminTournamentNavItem });
}