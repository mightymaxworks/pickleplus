/**
 * PKL-278651-ADMIN-0016-SYS-TOOLS
 * Admin Navigation Type Definitions
 * 
 * This file contains navigation-specific types and enums for the admin module
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

/**
 * Navigation category types for better organization
 * Re-exported from useAdminComponents for direct imports
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