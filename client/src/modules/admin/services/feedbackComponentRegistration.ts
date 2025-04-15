/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Component Registration
 * 
 * This file registers the bug report management components with the admin module.
 */

import { lazy } from 'react';
import React from 'react';
import { adminComponentRegistry } from './adminComponentRegistry';
import { AdminComponentType } from '../types';

// Lazy-load the bug report dashboard
const BugReportDashboard = lazy(() => import('../components/feedback/BugReportDashboard'));

/**
 * Register bug report management components with the admin module
 */
export function registerFeedbackComponents(): void {
  console.log('[Admin] Registering bug report management components');
  
  // Register the navigation item
  adminComponentRegistry.registerNavItem('feedback', {
    label: 'Bug Reports',
    path: '/admin/bug-reports',
    icon: React.createElement('span', { className: 'text-amber-500' }, '🐛'),
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