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
  
  // Register the tournament admin components
  registerTournamentAdminComponents();
  
  console.log('[Tournament] Tournament module initialized');
}

// Auto-initialize when this module is imported
initializeTournamentModule();