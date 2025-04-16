/**
 * PKL-278651-ADMIN-0015-USER
 * Admin User Management Navigation Item
 * 
 * Navigation item for the enhanced user management dashboard
 */

import React from 'react';
import { Users } from 'lucide-react';
import { AdminNavItem } from '../../types';

/**
 * Admin User Management Navigation Item
 */
export const AdminUserManagementNavItem: AdminNavItem = {
  label: 'User Management',
  path: '/admin/users',
  icon: <Users className="w-5 h-5" />,
  order: 10, // Higher priority, positioned near the top
  metadata: {
    category: 'Core',
    description: 'Manage users, view user details, and perform administrative actions',
    tags: ['users', 'management', 'admin']
  }
};

export default AdminUserManagementNavItem;