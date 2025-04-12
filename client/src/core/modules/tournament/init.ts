/**
 * PKL-278651-TOURN-0002-ADMIN
 * Tournament Module Initialization
 * 
 * This file initializes the tournament module by registering components
 * with the admin module and setting up necessary services.
 */

import { registerTournamentAdminComponents } from './components/admin';

/**
 * Initialize the tournament module and register its admin components
 */
export function initializeTournamentModule() {
  console.log('[Tournament] Initializing tournament module...');
  
  try {
    // Register the tournament admin components
    registerTournamentAdminComponents();
    
    // Log success
    console.log('[Tournament] Tournament admin components registered successfully');
    
    // Output the current navigation items for debugging
    import('@/modules/admin').then(({ adminModule }) => {
      const adminAPI = adminModule.exports as any;
      const navItems = adminAPI.getNavItems();
      console.log('[Tournament] Current admin nav items:', navItems);
    });
  } catch (error) {
    console.error('[Tournament] Error initializing tournament module:', error);
  }
  
  console.log('[Tournament] Tournament module initialization complete');
}

// Auto-initialize when this module is imported
initializeTournamentModule();