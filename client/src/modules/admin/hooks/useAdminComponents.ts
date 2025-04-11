/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Components Hook
 * 
 * React hook for accessing registered admin components in the admin module.
 */

import { useEffect, useState } from 'react';
import { adminModule } from '../index';
import { AdminNavItem, AdminDashboardCard, AdminViewComponent, AdminQuickAction, AdminComponentType } from '../types';
import { eventBus } from '@/core/events/eventBus';

/**
 * Hook for accessing registered navigation items
 * @returns Array of navigation items, sorted by order
 */
export function useAdminNavItems(): AdminNavItem[] {
  const [navItems, setNavItems] = useState<AdminNavItem[]>([]);
  
  useEffect(() => {
    // Get initial navigation items from the admin module
    setNavItems(adminModule.getNavItems());
    
    // Subscribe to navigation item registration events
    const unsubscribe = eventBus.subscribe('admin:navItemRegistered', () => {
      setNavItems(adminModule.getNavItems());
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
    setDashboardCards(adminModule.getDashboardCards());
    
    // Subscribe to dashboard card registration events
    const unsubscribe = eventBus.subscribe('admin:dashboardCardRegistered', () => {
      setDashboardCards(adminModule.getDashboardCards());
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
    setAdminViews(adminModule.getAdminViews());
    
    // Subscribe to admin view registration events
    const unsubscribe = eventBus.subscribe('admin:viewRegistered', () => {
      setAdminViews(adminModule.getAdminViews());
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
    setQuickActions(adminModule.getQuickActions());
    
    // Subscribe to quick action registration events
    const unsubscribe = eventBus.subscribe('admin:quickActionRegistered', () => {
      setQuickActions(adminModule.getQuickActions());
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