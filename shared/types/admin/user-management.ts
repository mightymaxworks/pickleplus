/**
 * PKL-278651-ADMIN-0015-USER
 * Enhanced User Management Types
 * 
 * This file contains the type definitions for enhanced user management capabilities
 * including user notes, administrative actions log, user statuses, and permission records.
 */

import { z } from "zod";
import { User } from "../../types";

/**
 * User Account Status
 */
export interface UserAccountStatus {
  id: number;
  userId: number;
  status: 'active' | 'suspended' | 'restricted' | 'deactivated';
  reason?: string;
  changedById: number;
  changedByName?: string;
  createdAt: Date;
  expiresAt?: Date | null;
}

/**
 * Admin User Note
 */
export interface AdminUserNote {
  id: number;
  userId: number;
  authorId: number;
  authorName?: string;
  note: string;
  visibility: 'admin' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin User Action - Records administrative actions taken on a user account
 */
export interface AdminUserAction {
  id: number;
  userId: number;
  adminId: number;
  adminName?: string;
  action: string;
  details?: string;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * User Login History Entry
 */
export interface UserLoginHistory {
  id: number;
  userId: number;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  device?: string;
}

/**
 * User Permission Override
 */
export interface UserPermissionOverride {
  id: number;
  userId: number;
  permission: string;
  granted: boolean;
  reason?: string;
  createdById: number;
  createdAt: Date;
  expiresAt?: Date | null;
}

/**
 * User Details Response - Complete user record with all management-related data
 */
export interface UserDetailsResponse {
  user: User;
  notes: AdminUserNote[];
  accountStatus: UserAccountStatus | null;
  recentActions: AdminUserAction[];
  permissions: UserPermissionOverride[];
  loginHistory: UserLoginHistory[];
}

/**
 * Pagination Data for paginated responses
 */
export interface PaginationData {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/**
 * User Search Result
 */
export interface UserSearchResponse {
  users: User[];
  pagination: PaginationData;
}

/**
 * User Actions Search Response
 */
export interface UserActionsResponse {
  actions: AdminUserAction[];
  pagination: PaginationData;
}

/**
 * Admin Action Schema
 */
export const AdminActionSchema = z.object({
  actionType: z.enum(['note', 'status', 'permission']),
  note: z.string().optional(),
  visibility: z.enum(['admin', 'system']).optional(),
  status: z.enum(['active', 'suspended', 'restricted', 'deactivated']).optional(),
  statusReason: z.string().optional(),
  statusExpiration: z.string().optional(),
  permission: z.string().optional(),
  permissionValue: z.boolean().optional(),
  permissionReason: z.string().optional(),
  permissionExpiration: z.string().optional(),
});

export type AdminAction = z.infer<typeof AdminActionSchema>;