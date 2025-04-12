/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Nav Item
 * 
 * This component defines the tournament management navigation item for the admin sidebar
 * following Framework 5.0 modular component registration patterns.
 */

import React from 'react';
import { Trophy } from 'lucide-react';
import { AdminNavItem } from '@/modules/admin/types';
import { NavCategory } from '@/modules/admin/hooks/useAdminComponents';

/**
 * Tournament management navigation item
 * 
 * Places the tournament management section in the admin sidebar
 * with appropriate icon and positioning.
 * 
 * The metadata ensures proper categorization in both mobile and desktop views.
 */
export const AdminTournamentNavItem: AdminNavItem = {
  label: 'Tournaments',
  path: '/admin/tournaments',
  icon: <Trophy size={18} />,
  order: 20, // Position in the sidebar navigation (lower numbers appear first) 
  metadata: {
    category: NavCategory.EVENTS,
    mobileVisible: true,
    desktopVisible: true,
    description: 'Manage tournament brackets and settings'
  }
};