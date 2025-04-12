/**
 * PKL-278651-TOURN-0002-ADMIN
 * Admin Tournament Management Components Registration
 * 
 * This file registers all tournament admin components with the admin module
 */

import { AdminTournamentNavItem } from './AdminTournamentNavItem';
import { adminModule } from '@/modules/admin';
import { adminComponentRegistry } from '@/modules/admin/services/adminComponentRegistry';

export function registerTournamentAdminComponents() {
  // Register the tournament navigation item in the admin sidebar
  adminComponentRegistry.registerNavItem('tournament', AdminTournamentNavItem);
}