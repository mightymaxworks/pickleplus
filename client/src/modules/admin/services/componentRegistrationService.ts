/**
 * PKL-278651-ADMIN-0002-UI
 * Component Registration Service
 *
 * This service registers admin components from various modules
 */

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
  
  console.log('[Admin] Admin components registered');
}