/**
 * PKL-278651-AUTH-0008-ROLES - Role Definitions
 * 
 * This file defines the user roles for the application using a simple three-tier approach.
 * Following Framework 5.3 principles of simplicity, we avoid complex role matrices
 * and focus on three clear roles with implicit permissions hierarchy.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

/**
 * User role enumeration
 * Simple three-tier approach that follows an implicit hierarchy:
 * - PLAYER: Basic user with standard player permissions
 * - COACH: Higher access level for coaching features
 * - ADMIN: Full system access
 */
export enum UserRole {
  PLAYER = "PLAYER",
  COACH = "COACH", 
  ADMIN = "ADMIN"
}

/**
 * Gets a human-readable label for a role
 * @param role The role to get a label for
 * @returns A readable label string for the role
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.PLAYER:
      return "Player";
    case UserRole.COACH:
      return "Coach";
    case UserRole.ADMIN:
      return "Administrator";
    default:
      return "Unknown Role";
  }
}

/**
 * Checks if a user has the required role
 * 
 * This function follows a simple hierarchical approach:
 * - ADMIN can access anything
 * - COACH can access COACH and PLAYER features
 * - PLAYER can only access PLAYER features
 * 
 * @param userRole The user's current role
 * @param requiredRole The role required for access
 * @returns Boolean indicating if the user has sufficient permissions
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  // Admin can access everything
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  
  // Coach can access coach and player features
  if (userRole === UserRole.COACH) {
    return requiredRole === UserRole.COACH || requiredRole === UserRole.PLAYER;
  }
  
  // Player can only access player features
  if (userRole === UserRole.PLAYER) {
    return requiredRole === UserRole.PLAYER;
  }
  
  // Default to deny access
  return false;
}

/**
 * Gets the highest role from a list of role strings
 * @param roles Array of role strings
 * @returns The highest role in the hierarchy
 */
export function getHighestRole(roles: string[]): UserRole {
  if (roles.includes(UserRole.ADMIN)) {
    return UserRole.ADMIN;
  }
  
  if (roles.includes(UserRole.COACH)) {
    return UserRole.COACH;
  }
  
  return UserRole.PLAYER;
}

/**
 * Default role for new users
 */
export const DEFAULT_ROLE = UserRole.PLAYER;