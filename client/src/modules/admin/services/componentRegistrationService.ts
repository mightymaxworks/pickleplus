/**
 * PKL-278651-ADMIN-0002-UI
 * Component Registration Service
 *
 * This service registers admin components from various modules
 */

import React from 'react';
import { adminComponentRegistry } from './adminComponentRegistry';
import { 
  AdminPassportNavItem,
  passportVerificationCard, 
  passportVerificationView
} from '../components/passport';
import { AdminMobileTestNavItem } from '../components/mobile-test';
import { AdminUserManagementNavItem } from '../components/user-management';
import { registerReportingComponents } from './reportingComponentRegistration';
import { registerFeedbackComponents } from './feedbackComponentRegistration';
import BounceAdminNavItem from '../components/bounce/BounceAdminNavItem';
import { SystemToolsNavItems } from '../components/system'; // PKL-278651-ADMIN-0016-SYS-TOOLS
// Import settings module to register its components
import '../components/settings';

/**
 * Register passport verification components
 */
export function registerPassportVerificationComponents() {
  // Register passport verification nav item
  adminComponentRegistry.registerNavItem('passport', AdminPassportNavItem);
  
  // Register passport verification dashboard card
  adminComponentRegistry.registerDashboardCard('passport', passportVerificationCard);
  
  // Register passport verification view
  adminComponentRegistry.registerAdminView('passport', passportVerificationView);
}

/**
 * Register mobile test components
 */
export function registerMobileTestComponents() {
  // Register mobile test nav item
  adminComponentRegistry.registerNavItem('admin', AdminMobileTestNavItem);
}

/**
 * Register user management components
 * PKL-278651-ADMIN-0015-USER
 */
export function registerUserManagementComponents() {
  // Register user management nav item
  adminComponentRegistry.registerNavItem('core', AdminUserManagementNavItem);
  
  console.log('[Admin] User Management components registered');
}

/**
 * Register Bounce testing system components
 * PKL-278651-BOUNCE-0001-CORE
 */
export function registerBounceComponents() {
  // Register Bounce admin nav item
  adminComponentRegistry.registerNavItem('bounce', BounceAdminNavItem);
  
  console.log('[Admin] Bounce testing components registered');
}

/**
 * Register system tools components
 * PKL-278651-ADMIN-0016-SYS-TOOLS
 */
export function registerSystemToolsComponents() {
  // We'll insert the SystemToolsNavItems component into the admin app
  // This component will register direct navigation items when mounted
  
  // Create a provider that will render the SystemToolsNavItems component
  const renderSystemToolsProvider = () => {
    return React.createElement(SystemToolsNavItems, {});
  };
  
  // Register the provider as a special admin view that's always active
  adminComponentRegistry.registerAdminView('system', {
    id: 'system-tools-provider',
    path: '',  // Empty path ensures it's always rendered
    component: renderSystemToolsProvider,
    label: 'System Tools Provider',
    hidden: true  // Hidden from navigation
  });
  
  console.log('[Admin] System tools components initialized');
}

/**
 * Register all admin components
 */
export function registerAllAdminComponents() {
  console.log('[Admin] Registering admin components');
  
  // Register module-specific components
  registerPassportVerificationComponents();
  registerMobileTestComponents();
  registerReportingComponents();
  registerFeedbackComponents();
  registerUserManagementComponents(); // Added User Management
  registerBounceComponents(); // Added Bounce Testing System
  registerSystemToolsComponents(); // Added System Tools
  
  console.log('[Admin] Admin components registered');
}