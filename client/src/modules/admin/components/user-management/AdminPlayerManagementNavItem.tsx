/**
 * PKL-278651-PLAYER-ADMIN-001
 * Admin Player Management Navigation Item
 * 
 * Navigation item for the comprehensive player management dashboard
 */

import React from 'react';
import { Users } from 'lucide-react';
import { AdminNavItem } from '../../types';

/**
 * Admin Player Management Navigation Item
 */
export const AdminPlayerManagementNavItem: AdminNavItem = {
  label: 'Player Management',
  path: '/admin/players',
  icon: <Users className="w-5 h-5" />,
  order: 5, // Position between dashboard and user management
  metadata: {
    category: 'Core',
    description: 'Manage player accounts, memberships, ratings, and development progress',
    tags: ['players', 'management', 'admin', 'ratings', 'memberships']
  }
};

export default AdminPlayerManagementNavItem;