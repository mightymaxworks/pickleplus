/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Nav Item
 * 
 * This component registers the tournament management in the admin navigation
 */

import { Trophy } from 'lucide-react';
import { AdminNavItem } from '@/modules/admin/types';

export const AdminTournamentNavItem: AdminNavItem = {
  label: "Tournament Management",
  path: "/admin/tournaments",
  icon: <Trophy className="h-5 w-5" />,
  order: 45, // Between reporting (30) and other items
};

export default AdminTournamentNavItem;