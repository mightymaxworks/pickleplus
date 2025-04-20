/**
 * PKL-278651-COMM-0034-MEMBER
 * Community Roles Types
 * 
 * This file defines the TypeScript types for community roles and permissions
 * on the client side.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

/**
 * Member action types enum - matches the server-side enum
 */
export enum MemberActionType {
  PROMOTE = "promote",
  DEMOTE = "demote",
  REMOVE = "remove",
  BAN = "ban",
  UNBAN = "unban",
  ADD_ROLE = "add_role",
  REMOVE_ROLE = "remove_role",
  CHANGE_PRIMARY_ROLE = "change_primary_role"
}

/**
 * Role with its permissions
 */
export interface RoleWithPermissions {
  roleName: string;
  permissions: Record<string, boolean>;
}

/**
 * Permission group - used to group permissions by category
 */
export interface PermissionGroup {
  category: string;
  permissions: {
    name: string;
    displayName: string;
    description: string;
  }[];
}

/**
 * Community custom role
 */
export interface CommunityCustomRole {
  id: number;
  communityId: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number; // Not in the DB schema, but returned by API
}

/**
 * Community role assignment
 */
export interface CommunityRoleAssignment {
  id: number;
  communityId: number;
  userId: number;
  customRoleId: number;
  assignedByUserId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Community member action log
 */
export interface CommunityMemberActionLog {
  id: number;
  communityId: number;
  actionType: MemberActionType;
  performedByUserId: number;
  performedBy?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  targetUserIds: number[];
  actionDetails?: any;
  createdAt: string;
}

/**
 * Member with roles - returned by the members with roles API
 */
export interface MemberWithRoles {
  userId: number;
  username: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isCreator: boolean;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    passportId?: string;
    avatarUrl?: string;
  };
  customRoles?: CommunityCustomRole[];
}