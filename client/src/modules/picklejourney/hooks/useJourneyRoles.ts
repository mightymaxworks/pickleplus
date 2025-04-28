/**
 * PKL-278651-JOUR-002.1: useJourneyRoles Hook
 * 
 * Custom hook for accessing and managing journey roles through the JourneyRoleContext.
 * Provides convenient methods for working with role data and metadata.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useContext } from 'react';
import { UserRole, getRoleLabel } from '@/lib/roles';
import { JourneyRoleContext, JourneyRoleContextType } from '../contexts/JourneyRoleContext';
import { ExperienceLevel, RoleMetadata } from '../types';

/**
 * Extended return type for useJourneyRoles with additional helper methods
 */
export interface UseJourneyRolesReturn extends JourneyRoleContextType {
  // Role information helpers
  getRoleLabel: (role: UserRole) => string;
  getRoleExperienceLabel: (role: UserRole) => string;
  getRoleProgress: (role: UserRole) => number;
  
  // Role summary data
  getTotalRoleCount: () => number;
  getTotalGoalsCount: () => number;
  getCompletedGoalsCount: () => number;
  getTotalAchievementsCount: () => number;
  
  // Multi-role helpers
  getRolesInPriorityOrder: () => UserRole[];
  getPrimaryRoleMetadata: () => RoleMetadata;
}

/**
 * Returns an experience level label based on the enum value
 */
function getExperienceLevelLabel(level: ExperienceLevel): string {
  switch (level) {
    case ExperienceLevel.BEGINNER:
      return 'Beginner';
    case ExperienceLevel.INTERMEDIATE:
      return 'Intermediate';
    case ExperienceLevel.ADVANCED:
      return 'Advanced';
    case ExperienceLevel.EXPERT:
      return 'Expert';
    default:
      return 'Unknown';
  }
}

/**
 * Hook for accessing and managing journey roles
 */
export function useJourneyRoles(): UseJourneyRolesReturn {
  const context = useContext(JourneyRoleContext);
  
  if (!context) {
    throw new Error('useJourneyRoles must be used within a JourneyRoleProvider');
  }
  
  // Extract core functionality from context
  const { 
    roles, 
    primaryRole, 
    getRoleMetadata,
    ...restContext 
  } = context;
  
  /**
   * Get the label for a role
   */
  const getRoleLabelFn = (role: UserRole): string => {
    return getRoleLabel(role);
  };
  
  /**
   * Get the experience level label for a role
   */
  const getRoleExperienceLabel = (role: UserRole): string => {
    const metadata = getRoleMetadata(role);
    return getExperienceLevelLabel(metadata.experience);
  };
  
  /**
   * Get the progress percentage for a role (based on completed goals)
   */
  const getRoleProgress = (role: UserRole): number => {
    const metadata = getRoleMetadata(role);
    const { goals } = metadata;
    
    if (goals.length === 0) {
      return 0;
    }
    
    const completedCount = goals.filter(goal => goal.completed).length;
    return Math.round((completedCount / goals.length) * 100);
  };
  
  /**
   * Get the total number of roles
   */
  const getTotalRoleCount = (): number => {
    return roles.length;
  };
  
  /**
   * Get the total number of goals across all roles
   */
  const getTotalGoalsCount = (): number => {
    return roles.reduce((count, role) => {
      const metadata = getRoleMetadata(role);
      return count + metadata.goals.length;
    }, 0);
  };
  
  /**
   * Get the total number of completed goals across all roles
   */
  const getCompletedGoalsCount = (): number => {
    return roles.reduce((count, role) => {
      const metadata = getRoleMetadata(role);
      return count + metadata.goals.filter(goal => goal.completed).length;
    }, 0);
  };
  
  /**
   * Get the total number of achievements across all roles
   */
  const getTotalAchievementsCount = (): number => {
    return roles.reduce((count, role) => {
      const metadata = getRoleMetadata(role);
      return count + metadata.achievements.length;
    }, 0);
  };
  
  /**
   * Get the roles in priority order (highest priority first)
   */
  const getRolesInPriorityOrder = (): UserRole[] => {
    return [...roles];
  };
  
  /**
   * Get the metadata for the primary role
   */
  const getPrimaryRoleMetadata = (): RoleMetadata => {
    return getRoleMetadata(primaryRole);
  };
  
  return {
    // Original context methods and properties
    roles,
    primaryRole,
    getRoleMetadata,
    ...restContext,
    
    // Additional helper methods
    getRoleLabel: getRoleLabelFn,
    getRoleExperienceLabel,
    getRoleProgress,
    getTotalRoleCount,
    getTotalGoalsCount,
    getCompletedGoalsCount,
    getTotalAchievementsCount,
    getRolesInPriorityOrder,
    getPrimaryRoleMetadata
  };
}