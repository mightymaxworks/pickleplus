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
import AdminCoachNavItem from '../components/coach/AdminCoachNavItem'; // PKL-278651-COACH-ADMIN-001
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
 * Register coach management components
 * PKL-278651-COACH-ADMIN-001
 */
export function registerCoachComponents() {
  // Register coach applications nav item
  adminComponentRegistry.registerNavItem('coach', AdminCoachNavItem);
  
  console.log('[Admin] Coach management components registered');
}

/**
 * Register system tools components
 * PKL-278651-ADMIN-0016-SYS-TOOLS
 */
export function registerSystemToolsComponents() {
  try {
    // Use dynamic import for browser compatibility
    import('../components/system/SystemToolsNavItems').then(({ registerSystemItems }) => {
      registerSystemItems();
      console.log('[Admin] System tools components initialized');
    }).catch(error => {
      console.error('[Admin] Error registering system tools components:', error);
    });
  } catch (error) {
    console.error('[Admin] Error registering system tools components:', error);
  }
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
  registerCoachComponents(); // Added Coach Management
  registerSystemToolsComponents(); // Added System Tools
  
  console.log('[Admin] Admin components registered');
}