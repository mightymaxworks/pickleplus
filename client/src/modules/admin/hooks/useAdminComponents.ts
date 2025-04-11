/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Components Hook
 * 
 * React hook for accessing registered admin components in the admin module.
 */

import { useState, useEffect } from 'react';
import { 
  AdminNavItem, 
  AdminDashboardCard, 
  AdminViewComponent, 
  AdminQuickAction,
  AdminComponentType
} from '../types';
import { adminComponentRegistry } from '../services/adminComponentRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { useAuth } from '@/lib/auth';

/**
 * Hook for accessing registered navigation items
 * @returns Array of navigation items, sorted by order
 */
export function useAdminNavItems(): AdminNavItem[] {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState<AdminNavItem[]>(
    adminComponentRegistry.getNavItems()
  );
  
  useEffect(() => {
    // Update items when nav is updated
    const unsubscribe = eventBus.subscribe(Events.ADMIN_NAV_UPDATED, () => {
      setNavItems(adminComponentRegistry.getNavItems());
    });
    
    return unsubscribe;
  }, []);
  
  return navItems;
}

/**
 * Hook for accessing registered dashboard cards
 * @returns Array of dashboard cards, sorted by order
 */
export function useAdminDashboardCards(): AdminDashboardCard[] {
  const { user } = useAuth();
  const [cards, setCards] = useState<AdminDashboardCard[]>(
    adminComponentRegistry.getDashboardCards()
  );
  
  useEffect(() => {
    // Update cards when dashboard is updated
    const unsubscribe = eventBus.subscribe(Events.ADMIN_DASHBOARD_UPDATED, () => {
      setCards(adminComponentRegistry.getDashboardCards());
    });
    
    return unsubscribe;
  }, []);
  
  return cards;
}

/**
 * Hook for accessing registered admin views
 * @returns Array of admin views
 */
export function useAdminViews(): AdminViewComponent[] {
  const { user } = useAuth();
  const [views, setViews] = useState<AdminViewComponent[]>(
    adminComponentRegistry.getAdminViews()
  );
  
  useEffect(() => {
    // Update views when admin views are updated
    const unsubscribe = eventBus.subscribe(Events.ADMIN_VIEWS_UPDATED, () => {
      setViews(adminComponentRegistry.getAdminViews());
    });
    
    return unsubscribe;
  }, []);
  
  return views;
}

/**
 * Hook for accessing registered quick actions
 * @returns Array of quick actions, sorted by order
 */
export function useAdminQuickActions(): AdminQuickAction[] {
  const { user } = useAuth();
  const [actions, setActions] = useState<AdminQuickAction[]>(
    adminComponentRegistry.getQuickActions()
  );
  
  useEffect(() => {
    // Update actions when admin actions are updated
    const unsubscribe = eventBus.subscribe(Events.ADMIN_ACTIONS_UPDATED, () => {
      setActions(adminComponentRegistry.getQuickActions());
    });
    
    return unsubscribe;
  }, []);
  
  return actions;
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