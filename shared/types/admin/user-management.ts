/**
 * PKL-278651-ADMIN-0015-USER
 * Admin User Management Types
 * 
 * Types for the enhanced user management feature.
 */

import { User } from '../../types';

/**
 * Admin User Note
 */
export interface AdminUserNote {
  id: number;
  userId: number;
  authorId: number;
  authorUsername?: string;
  note: string;
  visibility: 'admin' | 'system';
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin User Action
 */
export interface AdminUserAction {
  id: number;
  userId: number;
  adminId: number;
  adminUsername?: string;
  actionType: string;
  description: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * User Permission Override
 */
export interface UserPermissionOverride {
  id: number;
  userId: number;
  permissionKey: string;
  allowed: boolean;
  reason?: string;
  addedById: number;
  createdAt: string;
  expiresAt?: string;
}

/**
 * User Login History
 */
export interface UserLoginHistory {
  id: number;
  userId: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  loginAt: string;
}

/**
 * User Account Status
 */
export interface UserAccountStatus {
  id: number;
  userId: number;
  status: 'active' | 'suspended' | 'restricted' | 'deactivated';
  reason?: string;
  changedById: number;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Detailed User Profile (with admin data)
 */
export interface DetailedUserProfile {
  user: User;
  notes: AdminUserNote[];
  accountStatus: UserAccountStatus | null;
  recentActions: AdminUserAction[];
  permissions: UserPermissionOverride[];
  loginHistory: UserLoginHistory[];
}

/**
 * User Stats
 */
export interface UserStats {
  totalUsers: number;
  admins: number;
  foundingMembers: number;
  activeUsers: number;
  newUsers: number;
  topRankedUsers: {
    id: number;
    username: string;
    displayName?: string;
    rankingPoints: number;
    level: number;
  }[];
}

/**
 * Pagination Data
 */
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}