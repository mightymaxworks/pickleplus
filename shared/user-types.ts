/**
 * PKL-278651-AUTH-0008-ROLES - User Role Type Definitions
 * 
 * This file defines the type extensions for users with role information.
 * Following Framework 5.3 principles of simplicity by defining clear types
 * with minimal complexity.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { User } from '@shared/schema';
import { UserRole, DEFAULT_ROLE } from '@/lib/roles';

/**
 * Extended User interface with role information
 */
export interface UserWithRole extends User {
  role: UserRole;
}

/**
 * Type guard to check if a user object has role information
 * @param user A user object to check
 * @returns Boolean indicating if the user has role information
 */
export function hasRoleInfo(user: User): user is UserWithRole {
  return (user as UserWithRole).role !== undefined;
}

/**
 * Ensures a user object has role information
 * If no role is present, assigns the default role (PLAYER)
 * @param user The user object to ensure has a role
 * @returns User with role information (UserWithRole)
 */
export function ensureUserHasRole(user: User): UserWithRole {
  if (hasRoleInfo(user)) {
    return user as UserWithRole;
  }
  
  // For existing users without a role, determine role based on username
  // This is a temporary measure until all users have explicit roles in the database
  let derivedRole = DEFAULT_ROLE;
  
  // Special handling for admin users (mightymax is the main admin)
  if (user.username === 'mightymax' || user.username === 'admin') {
    derivedRole = UserRole.ADMIN;
  }
  // Special handling for coach users
  else if (user.username?.toLowerCase().includes('coach')) {
    derivedRole = UserRole.COACH;
  }
  // Special handling for referee users
  else if (user.username?.toLowerCase().includes('referee') || user.username?.toLowerCase().includes('ref')) {
    derivedRole = UserRole.REFEREE;
  }
  
  return {
    ...user,
    role: derivedRole
  };
}