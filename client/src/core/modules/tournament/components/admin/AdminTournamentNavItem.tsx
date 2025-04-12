/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Nav Item
 * 
 * This component registers the tournament management in the admin navigation
 */

import { Trophy } from 'lucide-react';
import { AdminNavItem } from '@/modules/admin/types';

export const AdminTournamentNavItem: AdminNavItem = {
  label: 'Tournaments',
  path: '/admin/tournaments',
  icon: <Trophy size={18} />,
  order: 50 // Position in the sidebar navigation
};