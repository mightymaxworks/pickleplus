/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Admin Nav Item
 * 
 * This file defines the navigation item for the bug report management section in the admin
 * interface.
 */

import React from 'react';
import { Bug } from 'lucide-react';
import { AdminNavItem } from '../../types';

/**
 * Bug Report Admin Navigation Item
 */
export const BugReportAdminNavItem: AdminNavItem = {
  label: 'Bug Reports',
  path: '/admin/bug-reports',
  icon: <Bug className="h-5 w-5" />,
  order: 50, // Position after other main nav items
  permission: 'admin'
};