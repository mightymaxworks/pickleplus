/**
 * PKL-278651-ADMIN-0002-UI
 * Admin Module Initialization
 * 
 * This file initializes the admin module by registering components
 * and setting up necessary services.
 */

import { registerAllAdminComponents } from './services/componentRegistrationService';

/**
 * Initialize the admin module
 */
export function initializeAdminModule() {
  // Register all admin components
  registerAllAdminComponents();
}

// Auto-initialize when this module is imported
initializeAdminModule();