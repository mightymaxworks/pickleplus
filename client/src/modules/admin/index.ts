/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Module
 * 
 * This module handles administrative functionality across the platform
 * and provides a component registration system for admin features
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { User, RedemptionCode, CoachingProfile } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { AdminModuleAPI } from './types';
import { 
  enableFeature, 
  disableFeature, 
  resetFeature 
} from '@/lib/featureFlags';

// Import admin module specific types and services
import { 
  AdminNavItem, 
  AdminDashboardCard, 
  AdminViewComponent, 
  AdminQuickAction 
} from './types';
import { adminComponentRegistry } from './services/adminComponentRegistry';

/**
 * Extended Admin Module API for component registration
 */
interface ExtendedAdminModuleAPI extends AdminModuleAPI {
  registerNavItem(item: AdminNavItem): void;
  registerDashboardCard(card: AdminDashboardCard): void;
  registerAdminView(view: AdminViewComponent): void;
  registerQuickAction(action: AdminQuickAction): void;
  getNavItems(): AdminNavItem[];
  getDashboardCards(): AdminDashboardCard[];
  getAdminViews(): AdminViewComponent[];
  getQuickActions(): AdminQuickAction[];
}

/**
 * Core implementation of the Admin Module API
 */
class AdminModule implements ExtendedAdminModuleAPI {
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiRequest('GET', '/api/admin/users');
      return await response.json();
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: number, isAdmin: boolean): Promise<User> {
    try {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { isAdmin });
      const data = await response.json();
      eventBus.publish(Events.USER_ROLE_UPDATED, data);
      return data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  async verifyCoach(coachId: number): Promise<CoachingProfile> {
    try {
      const response = await apiRequest('PATCH', `/api/admin/coaches/${coachId}/verify`);
      const data = await response.json();
      eventBus.publish(Events.COACH_VERIFIED, data);
      return data;
    } catch (error) {
      console.error('Verify coach error:', error);
      throw error;
    }
  }

  async getRedemptionCodes(): Promise<RedemptionCode[]> {
    try {
      const response = await apiRequest('GET', '/api/redemption-codes');
      return await response.json();
    } catch (error) {
      console.error('Get redemption codes error:', error);
      throw error;
    }
  }

  async createRedemptionCode(codeData: any): Promise<RedemptionCode> {
    try {
      const response = await apiRequest('POST', '/api/admin/redemption-codes', codeData);
      const data = await response.json();
      eventBus.publish(Events.REDEMPTION_CODE_CREATED, data);
      return data;
    } catch (error) {
      console.error('Create redemption code error:', error);
      throw error;
    }
  }

  async updateRedemptionCode(codeId: number, codeData: any): Promise<RedemptionCode> {
    try {
      const response = await apiRequest('PATCH', `/api/admin/redemption-codes/${codeId}`, codeData);
      const data = await response.json();
      eventBus.publish(Events.REDEMPTION_CODE_UPDATED, data);
      return data;
    } catch (error) {
      console.error('Update redemption code error:', error);
      throw error;
    }
  }

  getFeatureFlags(): Promise<Record<string, boolean>> {
    // This is implemented client-side using localStorage
    // We use the existing feature flags system
    try {
      const flags: Record<string, boolean> = {};
      const keys = Object.keys(localStorage).filter(key => key.startsWith('feature_'));
      
      keys.forEach(key => {
        const flagName = key.replace('feature_', '');
        flags[flagName] = localStorage.getItem(key) === 'true';
      });
      
      return Promise.resolve(flags);
    } catch (error) {
      console.error('Get feature flags error:', error);
      return Promise.reject(error);
    }
  }

  async updateFeatureFlag(flagName: string, enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        enableFeature(flagName);
      } else {
        disableFeature(flagName);
      }
      eventBus.publish(Events.FEATURE_FLAG_UPDATED, { flagName, enabled });
      return Promise.resolve();
    } catch (error) {
      console.error('Update feature flag error:', error);
      return Promise.reject(error);
    }
  }

  async getDashboardStats(): Promise<any> {
    try {
      const response = await apiRequest('GET', '/api/admin/dashboard');
      return await response.json();
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Register a navigation item with the admin module
   * @param item Navigation item to register
   */
  registerNavItem(item: AdminNavItem): void {
    adminComponentRegistry.registerNavItem('admin', item);
    console.log(`[Admin] Registered nav item: ${item.label}`);
  }

  /**
   * Register a dashboard card with the admin module
   * @param card Dashboard card to register
   */
  registerDashboardCard(card: AdminDashboardCard): void {
    adminComponentRegistry.registerDashboardCard('admin', card);
    console.log(`[Admin] Registered dashboard card: ${card.id}`);
  }

  /**
   * Register an admin view with the admin module
   * @param view Admin view to register
   */
  registerAdminView(view: AdminViewComponent): void {
    adminComponentRegistry.registerAdminView('admin', view);
    console.log(`[Admin] Registered admin view: ${view.id} for path ${view.path}`);
  }

  /**
   * Register a quick action with the admin module
   * @param action Quick action to register
   */
  registerQuickAction(action: AdminQuickAction): void {
    adminComponentRegistry.registerQuickAction('admin', action);
    console.log(`[Admin] Registered quick action: ${action.label}`);
  }

  /**
   * Get all registered navigation items
   * @returns Array of navigation items
   */
  getNavItems(): AdminNavItem[] {
    return adminComponentRegistry.getNavItems();
  }

  /**
   * Get all registered dashboard cards
   * @returns Array of dashboard cards
   */
  getDashboardCards(): AdminDashboardCard[] {
    return adminComponentRegistry.getDashboardCards();
  }

  /**
   * Get all registered admin views
   * @returns Array of admin views
   */
  getAdminViews(): AdminViewComponent[] {
    return adminComponentRegistry.getAdminViews();
  }

  /**
   * Get all registered quick actions
   * @returns Array of quick actions
   */
  getQuickActions(): AdminQuickAction[] {
    return adminComponentRegistry.getQuickActions();
  }
}

// Export the module for registration
export const adminModule: Module = {
  name: 'admin',
  version: '0.1.0',
  exports: new AdminModule(),
};