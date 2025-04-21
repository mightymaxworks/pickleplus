/**
 * PKL-278651-ADMIN-0002-UI
 * Admin Registry Hook
 * 
 * This hook provides access to the admin component registry.
 */

import { useCallback } from 'react';
import { adminComponentRegistry } from '../services/adminComponentRegistry';
import { ReactNode } from 'react';

/**
 * User-friendly interface for registering nav items
 * Note: This is converted internally to match the actual AdminNavItem interface
 */
export interface AdminNavItemInput {
  id?: string;
  label: string;
  path: string;
  icon?: ReactNode;
  group?: string;
  description?: string;
  priority?: number;
  permission?: string;
}

/**
 * Hook to access the admin component registry
 */
export function useAdminRegistry() {
  
  /**
   * Register a navigation item in the admin sidebar
   */
  const registerNavItem = useCallback((navItem: AdminNavItemInput) => {
    adminComponentRegistry.registerNavItemDirect(navItem);
  }, []);

  /**
   * Unregister a navigation item from the admin sidebar
   */
  const unregisterNavItem = useCallback((label: string) => {
    adminComponentRegistry.unregisterNavItem(label);
  }, []);

  /**
   * Get all registered navigation items
   */
  const getNavItems = useCallback(() => {
    return adminComponentRegistry.getNavItems();
  }, []);

  return {
    registerNavItem,
    unregisterNavItem,
    getNavItems
  };
}