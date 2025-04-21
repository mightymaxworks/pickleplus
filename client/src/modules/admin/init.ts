/**
 * PKL-278651-ADMIN-0002-UI
 * Admin Module Initialization
 * 
 * This file initializes the admin module by registering components
 * and setting up necessary services.
 */

import { registerAllAdminComponents } from './services/componentRegistrationService';

// PKL-278651-ADMIN-0016-SYS-TOOLS - Import direct registration for System Tools
import './direct-system-tools-registration';

/**
 * Initialize the admin module
 */
export function initializeAdminModule() {
  // Register all admin components
  registerAllAdminComponents();
  
  console.log('[Admin] Admin module initialized successfully');
}

// Auto-initialize when this module is imported
initializeAdminModule();