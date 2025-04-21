/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS - System Tools Initialization
 * 
 * This file initializes the system tools components and registers them with
 * the admin module for visibility in both desktop and mobile navigation.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import { registerSystemItems } from './SystemToolsNavItems';
import { eventBus, Events } from '@/core/events/eventBus';

/**
 * Initialize system tools components
 */
export function initSystemTools(): void {
  try {
    // Directly register all system tools navigation items
    registerSystemItems();
    
    console.log('[Admin] System tools components initialized');
    
    // Publish an event to notify that system tools are registered
    eventBus.publish(Events.ADMIN_NAV_UPDATED, { message: 'System tools navigation registered' });
  } catch (error) {
    console.error('[Admin] Error initializing system tools components:', error);
  }
}