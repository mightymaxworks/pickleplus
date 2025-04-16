/**
 * PKL-278651-ADMIN-0015-USER
 * User Management API Client
 * 
 * This file contains the client-side API functions for the user management feature
 */

import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/types'; 
import { 
  UserDetailsResponse,
  UserSearchResponse,
  AdminUserNote,
  UserActionsResponse,
  UserAccountStatus,
  AdminAction
} from '@shared/types/admin/user-management';

/**
 * Get a list of users with pagination, sorting, and filtering
 */
export async function getUsers(
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortDir = 'desc',
  search?: string,
  filter?: string
): Promise<UserSearchResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortDir,
    ...(search && { search }),
    ...(filter && filter !== 'all' && { filter })
  });
  
  const response = await fetch(`/api/admin/users?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return await response.json() as UserSearchResponse;
}

/**
 * Get detailed user information including notes, account status, etc.
 */
export async function getUserDetails(userId: number): Promise<UserDetailsResponse> {
  const response = await fetch(`/api/admin/users/${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }
  
  return await response.json() as UserDetailsResponse;
}

/**
 * Add a note to a user's profile
 */
export async function addUserNote(
  userId: number, 
  data: { note: string; visibility: 'admin' | 'system' }
): Promise<AdminUserNote> {
  const response = await fetch(`/api/admin/users/${userId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to add user note');
  }
  
  return await response.json();
}

/**
 * Update a user's account status
 */
export async function updateUserStatus(
  userId: number,
  data: { 
    status: 'active' | 'suspended' | 'restricted' | 'deactivated';
    reason?: string;
    expiresAt?: string;
  }
): Promise<UserAccountStatus> {
  const response = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user status');
  }
  
  return await response.json();
}

/**
 * Update a user's profile information
 */
export async function updateUserProfile(
  userId: number,
  data: Partial<User>
): Promise<User> {
  const response = await fetch(`/api/admin/users/${userId}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  
  return await response.json();
}

/**
 * Get user action history with pagination
 */
export async function getUserActions(
  userId: number,
  page = 1,
  limit = 10
): Promise<UserActionsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`/api/admin/users/${userId}/actions?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user actions');
  }
  
  return await response.json() as UserActionsResponse;
}

/**
 * Perform an admin action on a user
 */
export async function performAdminAction(
  userId: number,
  action: AdminAction
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/admin/users/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    credentials: 'include',
    body: JSON.stringify({
      userId,
      ...action
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to perform admin action');
  }
  
  return await response.json();
}

/**
 * Get matches for a specific user
 */
export async function getUserMatches(
  userId: number,
  page = 1,
  limit = 10
): Promise<any> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    userId: userId.toString()
  });
  
  const response = await fetch(`/api/admin/users/${userId}/matches?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user matches');
  }
  
  return await response.json();
}

/**
 * Update user scores (XP and/or ranking points)
 */
export async function updateUserScores(
  userId: number,
  data: { xp?: number; rankingPoints?: number }
): Promise<{ 
  id: number; 
  xp: number; 
  level: number; 
  rankingPoints: number;
  previousValues: {
    xp: number;
    level: number;
    rankingPoints: number;
  }
}> {
  // First, fetch the CSRF token
  console.log('[Admin] Fetching CSRF token for score update');
  const csrfResponse = await fetch('/api/auth/csrf-token', {
    credentials: 'include'
  });
  
  if (!csrfResponse.ok) {
    console.error('[Admin] Failed to fetch CSRF token:', csrfResponse.status, csrfResponse.statusText);
    throw new Error('Failed to fetch CSRF token');
  }
  
  const { csrfToken } = await csrfResponse.json();
  console.log('[Admin] Successfully obtained CSRF token');
  
  // Now send the score update request with the token
  console.log('[Admin] Sending score update request');
  const response = await fetch(`/api/admin/users/${userId}/scores`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Admin] Error updating scores:', response.status, response.statusText, errorText);
    throw new Error(`Failed to update user scores: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}