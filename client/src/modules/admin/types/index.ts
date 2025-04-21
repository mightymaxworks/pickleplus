/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Module Type Definitions
 * 
 * This file contains the interfaces and types for the admin module's component registration system.
 */

import { ReactNode } from 'react';
import { User, RedemptionCode, CoachingProfile } from '@shared/schema';

/**
 * Admin Module API
 * Core interface for the admin module
 */
export interface AdminModuleAPI {
  getUsers(): Promise<User[]>;
  updateUserRole(userId: number, isAdmin: boolean): Promise<User>;
  verifyCoach(coachId: number): Promise<CoachingProfile>;
  getRedemptionCodes(): Promise<RedemptionCode[]>;
  createRedemptionCode(codeData: any): Promise<RedemptionCode>;
  updateRedemptionCode(codeId: number, codeData: any): Promise<RedemptionCode>;
  getFeatureFlags(): Promise<Record<string, boolean>>;
  updateFeatureFlag(flagName: string, enabled: boolean): Promise<void>;
  getDashboardStats(): Promise<any>;
}

/**
 * Admin Component Types
 * These represent the different types of components that can be registered with the admin module
 */
export enum AdminComponentType {
  DASHBOARD_CARD = 'dashboardCard', // Card components for the admin dashboard
  NAV_ITEM = 'navItem',             // Navigation items for the admin sidebar
  ADMIN_VIEW = 'adminView',         // Main admin view components
  ADMIN_ACTION = 'adminAction'      // Quick action components for the admin dashboard
}

/**
 * Admin Navigation Item Metadata
 * Additional properties for navigation items
 */
export interface AdminNavItemMetadata {
  category?: string;       // Category for the navigation item (used for grouping in mobile view)
  mobileVisible?: boolean; // Whether to show this item in mobile view (default: true)
  desktopVisible?: boolean; // Whether to show this item in desktop view (default: true)
  description?: string;    // Description for tooltip or accessibility
  tags?: string[];         // Additional tags for filtering or identification
}

/**
 * Admin Navigation Item
 * Represents an item in the admin navigation sidebar
 */
export interface AdminNavItem {
  label: string;           // Display name for the navigation item
  path: string;            // URL path for the navigation item
  icon: ReactNode;         // Icon component to display
  order: number;           // Order in which to display (lower numbers first)
  children?: AdminNavItem[]; // Optional sub-items for nested navigation
  permission?: string;     // Optional permission key required to view this item
  metadata?: AdminNavItemMetadata; // Additional metadata for the navigation item
  isHeader?: boolean;      // Whether this item is a section header (PKL-278651-ADMIN-0016-SYS-TOOLS)
}

/**
 * Admin Dashboard Card
 * Represents a card component to be displayed on the admin dashboard
 */
export interface AdminDashboardCard {
  id: string;              // Unique identifier for the card
  component: React.ComponentType<any>; // The component to render
  width?: 'full' | 'half' | 'third'; // Width of the card (default: 'third')
  height?: 'small' | 'medium' | 'large'; // Height of the card (default: 'medium')
  order?: number;          // Order in which to display (lower numbers first)
  permission?: string;     // Optional permission key required to view this card
}

/**
 * Admin View Component
 * Represents a main view component for an admin page
 */
export interface AdminViewComponent {
  id: string;              // Unique identifier for the view
  path: string;            // URL path where this view is displayed
  component: React.ComponentType<any>; // The component to render
  permission?: string;     // Optional permission key required to view this component
}

/**
 * Admin Quick Action
 * Represents a quick action button displayed on the admin dashboard
 */
export interface AdminQuickAction {
  id: string;              // Unique identifier for the action
  label: string;           // Display name for the action
  icon: ReactNode;         // Icon component to display
  onClick: () => void;     // Function to call when the action is clicked
  description?: string;    // Optional description of what the action does
  permission?: string;     // Optional permission key required to perform this action
  order?: number;          // Order in which to display (lower numbers first)
}

/**
 * Admin Component Registration
 * Represents a component registered with the admin module
 */
export interface AdminComponentRegistration {
  moduleId: string;        // ID of the module that registered the component
  type: AdminComponentType; // Type of admin component
  component: 
    | AdminNavItem
    | AdminDashboardCard
    | AdminViewComponent
    | AdminQuickAction;
}