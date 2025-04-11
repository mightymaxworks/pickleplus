/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Components Hook
 * 
 * React hook for accessing registered admin components in the admin module.
 */

import { useEffect, useState } from 'react';
import { adminModule } from '../index';
import { AdminNavItem, AdminDashboardCard, AdminViewComponent, AdminQuickAction, AdminComponentType } from '../types';
import { eventBus, Events } from '@/core/events/eventBus';

// Access the exported admin module implementation
const adminAPI = adminModule.exports as any;

/**
 * Hook for accessing registered navigation items
 * @returns Array of navigation items, sorted by order
 */
export function useAdminNavItems(): AdminNavItem[] {
  const [navItems, setNavItems] = useState<AdminNavItem[]>([]);
  
  useEffect(() => {
    // Get initial navigation items from the admin module
    setNavItems(adminAPI.getNavItems());
    
    // Subscribe to navigation item registration events
    const unsubscribe = eventBus.subscribe(Events.ADMIN_NAV_UPDATED, () => {
      setNavItems(adminAPI.getNavItems());
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return navItems;
}

/**
 * Hook for accessing registered dashboard cards
 * @returns Array of dashboard cards, sorted by order
 */
export function useAdminDashboardCards(): AdminDashboardCard[] {
  const [dashboardCards, setDashboardCards] = useState<AdminDashboardCard[]>([]);
  
  useEffect(() => {
    // Get initial dashboard cards from the admin module
    setDashboardCards(adminAPI.getDashboardCards());
    
    // Subscribe to dashboard card registration events
    const unsubscribe = eventBus.subscribe(Events.ADMIN_DASHBOARD_UPDATED, () => {
      setDashboardCards(adminAPI.getDashboardCards());
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return dashboardCards;
}

/**
 * Hook for accessing registered admin views
 * @returns Array of admin views
 */
export function useAdminViews(): AdminViewComponent[] {
  const [adminViews, setAdminViews] = useState<AdminViewComponent[]>([]);
  
  useEffect(() => {
    // Get initial admin views from the admin module
    setAdminViews(adminAPI.getAdminViews());
    
    // Subscribe to admin view registration events
    const unsubscribe = eventBus.subscribe(Events.ADMIN_VIEWS_UPDATED, () => {
      setAdminViews(adminAPI.getAdminViews());
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return adminViews;
}

/**
 * Hook for accessing registered quick actions
 * @returns Array of quick actions, sorted by order
 */
export function useAdminQuickActions(): AdminQuickAction[] {
  const [quickActions, setQuickActions] = useState<AdminQuickAction[]>([]);
  
  useEffect(() => {
    // Get initial quick actions from the admin module
    setQuickActions(adminAPI.getQuickActions());
    
    // Subscribe to quick action registration events
    const unsubscribe = eventBus.subscribe(Events.ADMIN_ACTIONS_UPDATED, () => {
      setQuickActions(adminAPI.getQuickActions());
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return quickActions;
}

/**
 * Hook for accessing admin components by type
 * @param type The type of components to get
 * @returns Array of components of the specified type
 */
export function useAdminComponentsByType(type: AdminComponentType) {
  switch (type) {
    case 'navItem':
      return useAdminNavItems();
    case 'dashboardCard':
      return useAdminDashboardCards();
    case 'adminView':
      return useAdminViews();
    case 'quickAction':
      return useAdminQuickActions();
    default:
      return [];
  }
}