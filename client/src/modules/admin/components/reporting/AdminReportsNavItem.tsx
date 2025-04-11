/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reports Navigation Item
 * 
 * Navigation item for the admin reporting system
 */

import React from 'react';
import { LineChart } from 'lucide-react';
import { AdminNavItem } from '../../types';

/**
 * Admin Reports Navigation Item
 */
export const AdminReportsNavItem: AdminNavItem = {
  label: 'Reports & Analytics',
  path: '/admin/reports',
  icon: <LineChart className="w-5 h-5" />,
  order: 30, // Position in navigation
};