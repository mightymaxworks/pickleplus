/**
 * PKL-278651-TOURN-0002-ADMIN
 * Tournament Module Initialization
 * 
 * This file initializes the tournament module by registering components
 * with the admin module and setting up necessary services.
 * 
 * Following Framework 5.0 principles for modular architecture and
 * PKL-278651-ADMIN series integration standards.
 */

import { registerTournamentAdminComponents } from './components/admin';
import { eventBus, Events } from '@/core/events/eventBus';
import { adminModule } from '@/modules/admin';

/**
 * Initialize the tournament module and register its admin components
 */
export function initializeTournamentModule() {
  console.log('[Tournament] Initializing tournament module...');
  
  try {
    // Register the tournament admin components with the admin module
    registerTournamentAdminComponents();
    
    // Log success
    console.log('[Tournament] Tournament admin components registered successfully');
    
    // Subscribe to admin-related events for tournament management
    eventBus.subscribe(Events.ADMIN_COMPONENTS_UNREGISTERED, (data) => {
      if (data.moduleId === 'tournament') {
        console.log('[Tournament] Tournament admin components unregistered');
      }
    });
    
    // Get current nav items for debugging
    const adminAPI = adminModule.exports as any;
    const navItems = adminAPI.getNavItems();
    console.log('[Tournament] Current admin nav items:', 
      navItems.map((item: any) => ({label: item.label, path: item.path})));
  } catch (error) {
    console.error('[Tournament] Error initializing tournament module:', error);
    eventBus.publish(Events.ADMIN_COMPONENTS_UNREGISTERED, { 
      moduleId: 'tournament', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  console.log('[Tournament] Tournament module initialization complete');
}

// Auto-initialize when this module is imported
initializeTournamentModule();