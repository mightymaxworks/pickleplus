/**
 * PKL-278651-ADMIN-0003-NAV
 * Admin Components Hook
 * 
 * React hook for accessing registered admin components in the admin module
 * with improved navigation categorization and organization.
 */

import { useEffect, useState, useMemo } from 'react';
import { adminModule } from '../index';
import { AdminNavItem, AdminDashboardCard, AdminViewComponent, AdminQuickAction, AdminComponentType } from '../types';
import { eventBus, Events } from '@/core/events/eventBus';

/**
 * Navigation category types for better organization
 */
export enum NavCategory {
  DASHBOARD = 'dashboard',
  USER_MANAGEMENT = 'user-management',
  CONTENT = 'content',
  EVENTS = 'events',
  GAME = 'game',
  SYSTEM = 'system',
  OTHER = 'other'
}

/**
 * Determine the category for a navigation item based on its path or label
 */
export function getCategoryForNavItem(item: AdminNavItem): NavCategory {
  // Check if metadata category is specified first (Framework 5.0 approach)
  if (item.metadata?.category) {
    // Ensure the category exists, otherwise default to OTHER
    const category = item.metadata.category;
    const isValidCategory = Object.values(NavCategory).includes(category as NavCategory);
    if (isValidCategory) {
      return category as NavCategory;
    }
  }
  
  const path = item.path ? item.path.toLowerCase() : '';
  const label = item.label ? item.label.toLowerCase() : '';
  
  if (path === '/admin' || path.includes('dashboard')) {
    return NavCategory.DASHBOARD;
  }
  
  if (path.includes('user') || label.includes('user') || 
      path.includes('player') || label.includes('player') ||
      path.includes('account') || label.includes('account')) {
    return NavCategory.USER_MANAGEMENT;
  }
  
  if (path.includes('event') || label.includes('event') || 
      path.includes('tournament') || label.includes('tournament')) {
    return NavCategory.EVENTS;
  }

  if (path.includes('passport') || label.includes('passport') ||
      path.includes('code') || label.includes('code') ||
      path.includes('qr') || label.includes('qr')) {
    return NavCategory.EVENTS;
  }
  
  if (path.includes('match') || label.includes('match') ||
      path.includes('game') || label.includes('game') ||
      path.includes('league') || label.includes('league')) {
    return NavCategory.GAME;
  }
  
  if (path.includes('setting') || label.includes('setting') ||
      path.includes('config') || label.includes('config') ||
      path.includes('system') || label.includes('system')) {
    return NavCategory.SYSTEM;
  }
  
  return NavCategory.OTHER;
}

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
 * Hook for accessing categorized navigation items
 * @returns Object with navigation items organized by category
 */
export function useCategorizedNavItems(): Record<NavCategory, AdminNavItem[]> {
  const allNavItems = useAdminNavItems();
  
  return useMemo(() => {
    const categorized: Record<NavCategory, AdminNavItem[]> = {
      [NavCategory.DASHBOARD]: [],
      [NavCategory.USER_MANAGEMENT]: [],
      [NavCategory.CONTENT]: [],
      [NavCategory.EVENTS]: [],
      [NavCategory.GAME]: [],
      [NavCategory.SYSTEM]: [],
      [NavCategory.OTHER]: []
    };
    
    // Categorize each nav item
    allNavItems.forEach(item => {
      const category = getCategoryForNavItem(item);
      categorized[category].push(item);
    });
    
    // Sort items within each category by order
    Object.keys(categorized).forEach(category => {
      categorized[category as NavCategory].sort((a, b) => a.order - b.order);
    });
    
    return categorized;
  }, [allNavItems]);
}

/**
 * Hook for accessing admin components by type
 * @param type The type of components to get
 * @returns Array of components of the specified type
 */
export function useAdminComponentsByType(type: AdminComponentType) {
  switch (type) {
    case AdminComponentType.NAV_ITEM:
      return useAdminNavItems();
    case AdminComponentType.DASHBOARD_CARD:
      return useAdminDashboardCards();
    case AdminComponentType.ADMIN_VIEW:
      return useAdminViews();
    case AdminComponentType.ADMIN_ACTION:
      return useAdminQuickActions();
    default:
      return [];
  }
}

/**
 * Hook for accessing filtered navigation items by category
 * @param category The category to filter by
 * @returns Array of navigation items in the specified category
 */
export function useNavItemsByCategory(category: NavCategory): AdminNavItem[] {
  const allNavItems = useAdminNavItems();
  
  return useMemo(() => {
    return allNavItems.filter(item => getCategoryForNavItem(item) === category)
      .sort((a, b) => a.order - b.order);
  }, [allNavItems, category]);
}