/**
 * PKL-278651-COMM-0034-MEMBER
 * Enhanced Member Management API Client
 * 
 * This file provides API client functions for the enhanced member management feature.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { apiRequest } from '@/lib/queryClient';
import { 
  MemberActionType, 
  CommunityCustomRole, 
  RoleWithPermissions,
  MemberWithRoles,
  CommunityMemberActionLog
} from '@/types/community-roles';

/**
 * Get community members with their roles
 */
export async function getCommunityMembersWithRoles(
  communityId: number, 
  options?: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
  }
): Promise<MemberWithRoles[]> {
  const searchParams = new URLSearchParams();
  
  if (options?.limit) searchParams.append('limit', options.limit.toString());
  if (options?.offset) searchParams.append('offset', options.offset.toString());
  if (options?.search) searchParams.append('search', options.search);
  if (options?.role) searchParams.append('role', options.role);
  
  const response = await apiRequest(
    'GET',
    `/api/communities/${communityId}/members/with-roles?${searchParams.toString()}`
  );
  
  return await response.json();
}

/**
 * Get custom roles for a community
 */
export async function getCommunityCustomRoles(
  communityId: number
): Promise<CommunityCustomRole[]> {
  const response = await apiRequest(
    'GET',
    `/api/communities/${communityId}/custom-roles`
  );
  
  return await response.json();
}

/**
 * Create a custom role for a community
 */
export async function createCommunityCustomRole(
  communityId: number,
  data: {
    name: string;
    description?: string;
    color: string;
    icon?: string;
  }
): Promise<CommunityCustomRole> {
  const response = await apiRequest(
    'POST',
    `/api/communities/${communityId}/custom-roles`,
    {
      ...data,
      communityId
    }
  );
  
  return await response.json();
}

/**
 * Update a custom role
 */
export async function updateCommunityCustomRole(
  communityId: number,
  roleId: number,
  data: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>
): Promise<CommunityCustomRole> {
  const response = await apiRequest(
    'PATCH',
    `/api/communities/${communityId}/custom-roles/${roleId}`,
    data
  );
  
  return await response.json();
}

/**
 * Delete a custom role
 */
export async function deleteCommunityCustomRole(
  communityId: number,
  roleId: number
): Promise<void> {
  await apiRequest(
    'DELETE',
    `/api/communities/${communityId}/custom-roles/${roleId}`
  );
}

/**
 * Get roles with their permissions
 */
export async function getCommunityRolesWithPermissions(
  communityId: number
): Promise<RoleWithPermissions[]> {
  const response = await apiRequest(
    'GET',
    `/api/communities/${communityId}/roles`
  );
  
  return await response.json();
}

/**
 * Get permission types
 */
export async function getCommunityPermissionTypes(
  communityId: number
): Promise<any> {
  const response = await apiRequest(
    'GET',
    `/api/communities/${communityId}/permission-types`
  );
  
  return await response.json();
}

/**
 * Update permissions for a role
 */
export async function updateRolePermissions(
  communityId: number,
  role: string,
  permissions: Record<string, boolean>
): Promise<void> {
  await apiRequest(
    'PATCH',
    `/api/communities/${communityId}/roles/${role}/permissions`,
    { permissions }
  );
}

/**
 * Assign a role to a member
 */
export async function assignRoleToMember(
  communityId: number,
  userId: number,
  customRoleId: number
): Promise<void> {
  await apiRequest(
    'POST',
    `/api/communities/${communityId}/members/${userId}/assign-role`,
    { customRoleId }
  );
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMember(
  communityId: number,
  userId: number,
  roleId: number
): Promise<void> {
  await apiRequest(
    'DELETE',
    `/api/communities/${communityId}/members/${userId}/roles/${roleId}`
  );
}

/**
 * Perform a bulk action on multiple members
 */
export async function performBulkAction(
  communityId: number,
  action: MemberActionType,
  userIds: number[],
  details?: any
): Promise<any> {
  const response = await apiRequest(
    'POST',
    `/api/communities/${communityId}/members/bulk-actions`,
    {
      action,
      userIds,
      details
    }
  );
  
  return await response.json();
}

/**
 * Get community action logs
 */
export async function getCommunityActionLogs(
  communityId: number,
  limit: number = 20,
  offset: number = 0
): Promise<CommunityMemberActionLog[]> {
  const response = await apiRequest(
    'GET',
    `/api/communities/${communityId}/action-logs?limit=${limit}&offset=${offset}`
  );
  
  return await response.json();
}