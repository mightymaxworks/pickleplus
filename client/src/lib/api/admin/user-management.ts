/**
 * PKL-278651-ADMIN-0015-USER
 * Admin User Management API Client
 * 
 * SDK layer for interacting with the admin user management API.
 */

import { apiRequest } from '../../queryClient';
import { User } from '@/types';
import {
  DetailedUserProfile,
  AdminUserNote,
  UserAccountStatus,
  AdminUserAction,
  UserStats,
  PaginationData
} from '../../../../shared/types/admin/user-management';

/**
 * Get users with pagination, filtering, and sorting
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}): Promise<{ users: User[]; pagination: PaginationData }> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.filter) searchParams.append('filter', params.filter);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortDir) searchParams.append('sortDir', params.sortDir);
  
  const queryString = searchParams.toString();
  return apiRequest(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get detailed user profile (with admin data)
 */
export async function getUserDetails(userId: number): Promise<DetailedUserProfile> {
  return apiRequest(`/api/admin/users/${userId}`);
}

/**
 * Add a note to a user's profile
 */
export async function addUserNote(userId: number, data: {
  note: string;
  visibility: 'admin' | 'system';
}): Promise<AdminUserNote> {
  return apiRequest(`/api/admin/users/${userId}/notes`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update a user's account status
 */
export async function updateUserStatus(userId: number, data: {
  status: 'active' | 'suspended' | 'restricted' | 'deactivated';
  reason?: string;
  expiresAt?: string;
}): Promise<UserAccountStatus> {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update a user's profile (admin version)
 */
export async function updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
  return apiRequest(`/api/admin/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Get admin actions for a user
 */
export async function getUserAdminActions(userId: number, params: {
  page?: number;
  limit?: number;
}): Promise<{ actions: AdminUserAction[]; pagination: PaginationData }> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  return apiRequest(`/api/admin/users/${userId}/actions${queryString ? `?${queryString}` : ''}`);
}

/**
 * Record an admin action
 */
export async function recordAdminAction(data: {
  userId: number;
  actionType: string;
  description: string;
  metadata?: string;
}): Promise<AdminUserAction> {
  return apiRequest('/api/admin/users/actions', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get user stats for dashboard
 */
export async function getUserStats(): Promise<UserStats> {
  return apiRequest('/api/admin/users/stats');
}