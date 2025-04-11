/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Component Registry Service
 * 
 * This service manages the registration of admin components from various modules.
 */

import { 
  AdminComponentType, 
  AdminComponentRegistration,
  AdminNavItem,
  AdminDashboardCard,
  AdminViewComponent,
  AdminQuickAction
} from '../types';
import { eventBus, Events } from '@/core/events/eventBus';

class AdminComponentRegistry {
  private registrations: AdminComponentRegistration[] = [];

  /**
   * Register a navigation item with the admin module
   * @param moduleId ID of the module registering the component
   * @param navItem Navigation item to register
   */
  registerNavItem(moduleId: string, navItem: AdminNavItem): void {
    this.registrations.push({
      moduleId,
      type: AdminComponentType.NAV_ITEM,
      component: navItem
    });

    // Publish event for navigation update
    eventBus.publish(Events.ADMIN_NAV_UPDATED, { added: navItem });
  }

  /**
   * Register a dashboard card with the admin module
   * @param moduleId ID of the module registering the component
   * @param card Dashboard card to register
   */
  registerDashboardCard(moduleId: string, card: AdminDashboardCard): void {
    this.registrations.push({
      moduleId,
      type: AdminComponentType.DASHBOARD_CARD,
      component: card
    });

    // Publish event for dashboard update
    eventBus.publish(Events.ADMIN_DASHBOARD_UPDATED, { added: card });
  }

  /**
   * Register an admin view with the admin module
   * @param moduleId ID of the module registering the component
   * @param view Admin view to register
   */
  registerAdminView(moduleId: string, view: AdminViewComponent): void {
    this.registrations.push({
      moduleId,
      type: AdminComponentType.ADMIN_VIEW,
      component: view
    });

    // Publish event for view update
    eventBus.publish(Events.ADMIN_VIEWS_UPDATED, { added: view });
  }

  /**
   * Register a quick action with the admin module
   * @param moduleId ID of the module registering the component
   * @param action Quick action to register
   */
  registerQuickAction(moduleId: string, action: AdminQuickAction): void {
    this.registrations.push({
      moduleId,
      type: AdminComponentType.ADMIN_ACTION,
      component: action
    });

    // Publish event for actions update
    eventBus.publish(Events.ADMIN_ACTIONS_UPDATED, { added: action });
  }

  /**
   * Get all registered navigation items
   * @param permission Optional permission to filter by
   * @returns Array of navigation items
   */
  getNavItems(permission?: string): AdminNavItem[] {
    return this.registrations
      .filter(reg => 
        reg.type === AdminComponentType.NAV_ITEM && 
        (!permission || !(reg.component as AdminNavItem).permission || 
          (reg.component as AdminNavItem).permission === permission)
      )
      .map(reg => reg.component as AdminNavItem)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get all registered dashboard cards
   * @param permission Optional permission to filter by
   * @returns Array of dashboard cards
   */
  getDashboardCards(permission?: string): AdminDashboardCard[] {
    return this.registrations
      .filter(reg => 
        reg.type === AdminComponentType.DASHBOARD_CARD &&
        (!permission || !(reg.component as AdminDashboardCard).permission ||
          (reg.component as AdminDashboardCard).permission === permission)
      )
      .map(reg => reg.component as AdminDashboardCard)
      .sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  /**
   * Get all registered admin views
   * @param permission Optional permission to filter by
   * @returns Array of admin views
   */
  getAdminViews(permission?: string): AdminViewComponent[] {
    return this.registrations
      .filter(reg => 
        reg.type === AdminComponentType.ADMIN_VIEW &&
        (!permission || !(reg.component as AdminViewComponent).permission ||
          (reg.component as AdminViewComponent).permission === permission)
      )
      .map(reg => reg.component as AdminViewComponent);
  }

  /**
   * Get all registered quick actions
   * @param permission Optional permission to filter by
   * @returns Array of quick actions
   */
  getQuickActions(permission?: string): AdminQuickAction[] {
    return this.registrations
      .filter(reg => 
        reg.type === AdminComponentType.ADMIN_ACTION &&
        (!permission || !(reg.component as AdminQuickAction).permission ||
          (reg.component as AdminQuickAction).permission === permission)
      )
      .map(reg => reg.component as AdminQuickAction)
      .sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  /**
   * Unregister all components from a specific module
   * @param moduleId ID of the module
   */
  unregisterModuleComponents(moduleId: string): void {
    const removedComponents = this.registrations.filter(reg => reg.moduleId === moduleId);
    this.registrations = this.registrations.filter(reg => reg.moduleId !== moduleId);
    
    // Publish events for removed components
    if (removedComponents.length > 0) {
      eventBus.publish(Events.ADMIN_COMPONENTS_UNREGISTERED, { moduleId, removedComponents });
    }
  }
}

// Export a singleton instance
export const adminComponentRegistry = new AdminComponentRegistry();