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
import { registerReportingComponents } from './reportingComponentRegistration';

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
 * Register all admin components
 */
export function registerAllAdminComponents() {
  console.log('[Admin] Registering admin components');
  
  // Register module-specific components
  registerPassportVerificationComponents();
  registerMobileTestComponents();
  registerReportingComponents();
  
  console.log('[Admin] Admin components registered');
}