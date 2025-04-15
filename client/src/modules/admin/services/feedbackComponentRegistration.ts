/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Component Registration
 * 
 * This file registers the bug report management components with the admin module.
 */

import { lazy } from 'react';
import { adminComponentRegistry } from './adminComponentRegistry';
import { BugReportAdminNavItem } from '../components/feedback/BugReportAdminNavItem';

// Lazy-load the bug report dashboard
const BugReportDashboard = lazy(() => import('../components/feedback/BugReportDashboard'));

/**
 * Register bug report management components with the admin module
 */
export function registerFeedbackComponents(): void {
  console.log('[Admin] Registering bug report management components');
  
  // Register the navigation item
  adminComponentRegistry.registerNavItem('feedback', BugReportAdminNavItem);
  
  // Register the admin view
  adminComponentRegistry.registerAdminView('feedback', {
    id: 'bug-reports',
    path: '/admin/bug-reports',
    component: BugReportDashboard,
    permission: 'admin'
  });
  
  console.log('[Admin] Bug report management components registered successfully');
}