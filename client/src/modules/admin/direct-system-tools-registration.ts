/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS - Direct System Tools Registration
 * 
 * This script directly injects System Tools navigation items into the admin navigation.
 * It's called at application startup to ensure the items are available immediately.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import React from 'react';
import { Activity, Bot, Server } from 'lucide-react';
import { adminComponentRegistry } from './services/adminComponentRegistry';

// Define system tools navigation items
const SYSTEM_HEADER = {
  id: 'system-tools-header',
  label: 'System Tools',
  path: '', // Empty path for header
  icon: React.createElement(Server, { size: 18 }),
  group: 'system',
  priority: 10,
  description: 'System administration tools',
  isHeader: true
};

const BOUNCE_TESTING = {
  id: 'bounce-testing',
  label: 'Bounce Testing',
  path: '/admin/bounce',
  icon: React.createElement(Bot, { size: 18 }),
  group: 'system',
  priority: 11,
  description: 'Automated testing system'
};

const ACTIVITY_MONITOR = {
  id: 'activity-monitor',
  label: 'Activity Monitor',
  path: '/admin/system-activity',
  icon: React.createElement(Activity, { size: 18 }),
  group: 'system',
  priority: 12,
  description: 'System activity monitoring'
};

/**
 * Register all system tools navigation items directly
 */
export function registerSystemToolsDirect(): void {
  console.log('[Admin] Directly registering System Tools navigation items');
  
  // Register all system tools items
  adminComponentRegistry.registerNavItemDirect(SYSTEM_HEADER);
  adminComponentRegistry.registerNavItemDirect(BOUNCE_TESTING);
  adminComponentRegistry.registerNavItemDirect(ACTIVITY_MONITOR);
  
  console.log('[Admin] System Tools navigation items registered successfully');
}

// Auto-execute when this module is imported
registerSystemToolsDirect();