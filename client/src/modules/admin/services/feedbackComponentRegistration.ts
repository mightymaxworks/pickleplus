/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Component Registration
 * 
 * This file registers the bug report management components with the admin module.
 */

import { lazy } from 'react';
import { Bug } from 'lucide-react';
import { adminComponentRegistry } from './adminComponentRegistry';

// Lazy-load the bug report dashboard
const BugReportDashboard = lazy(() => import('../components/feedback/BugReportDashboard'));

/**
 * Register bug report management components with the admin module
 */
export function registerFeedbackComponents(): void {
  console.log('[Admin] Registering bug report management components');
  
  // Create the bug icon
  const bugIcon = document.createElement('div');
  bugIcon.innerHTML = '🐛';
  bugIcon.className = 'text-amber-500';
  
  // Register the navigation item
  adminComponentRegistry.registerNavItem('feedback', {
    label: 'Bug Reports',
    path: '/admin/bug-reports',
    icon: bugIcon,
    order: 50, // Position after other main nav items
    permission: 'admin'
  });
  
  // Register the admin view
  adminComponentRegistry.registerAdminView('feedback', {
    id: 'bug-reports',
    path: '/admin/bug-reports',
    component: BugReportDashboard,
    permission: 'admin'
  });
  
  console.log('[Admin] Bug report management components registered successfully');
}