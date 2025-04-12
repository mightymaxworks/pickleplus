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

/**
 * Tournament management navigation item
 * 
 * Places the tournament management section in the admin sidebar
 * with appropriate icon and positioning.
 */
export const AdminTournamentNavItem: AdminNavItem = {
  label: 'Tournaments',
  path: '/admin/tournaments',
  icon: <Trophy size={18} />,
  order: 50, // Position in the sidebar navigation (lower numbers appear first)
};