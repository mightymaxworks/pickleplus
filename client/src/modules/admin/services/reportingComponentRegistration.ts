/**
 * PKL-278651-ADMIN-0010-REPORT
 * Reporting Component Registration Service
 *
 * This service registers reporting components with the admin module
 */

import { adminComponentRegistry } from './adminComponentRegistry';
import { 
  AdminReportingNavItem,
  AdminReportingDashboardCard,
  AdminReportingQuickAction
} from '../components/reporting';

/**
 * Register reporting components with the admin module
 */
export function registerReportingComponents() {
  console.log('[Admin] Registering reporting components');
  
  // Register reporting nav item
  adminComponentRegistry.registerNavItem('reporting', AdminReportingNavItem);
  
  // Register reporting dashboard card
  adminComponentRegistry.registerDashboardCard('reporting', AdminReportingDashboardCard);
  
  // Register reporting quick action
  adminComponentRegistry.registerQuickAction('reporting', AdminReportingQuickAction);
  
  console.log('[Admin] Reporting components registered');
}