/**
 * PKL-278651-JOUR-002.1: Journey Role Context
 * 
 * This context provides access to the user's role preferences and role management
 * for the PickleJourney™ dashboard. It handles:
 * - Storing and retrieving role preferences
 * - Managing the primary role (current perspective)
 * - Providing role metadata
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { 
  createContext, 
  ReactNode, 
  useCallback, 
  useEffect, 
  useMemo, 
  useState 
} from 'react';
import { UserRole, getRoleLabel as getRoleLabelUtil, DEFAULT_ROLE } from '@/lib/roles';
import { 
  ExperienceLevel, 
  JourneyGoal, 
  JourneyRolePreferences, 
  RoleAchievement, 
  RoleMetadata 
} from '../types';
import { nanoid } from 'nanoid';

// Storage key for persisting role preferences in localStorage
const ROLE_PREFERENCES_STORAGE_KEY = 'picklejourney:rolePreferences';

// Default empty role metadata
export const DEFAULT_ROLE_METADATA: RoleMetadata = {
  why: '',
  goals: [],
  experience: ExperienceLevel.BEGINNER,
  startDate: new Date(),
  achievements: []
};

// Context type definition
export interface JourneyRoleContextType {
  // Core role properties
  roles: UserRole[];
  primaryRole: UserRole;
  
  // Role management methods
  setPrimaryRole: (role: UserRole) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  setRolePriority: (roles: UserRole[]) => void;
  
  // Role metadata methods
  getRoleMetadata: (role: UserRole) => RoleMetadata;
  updateRoleMetadata: (role: UserRole, metadata: Partial<RoleMetadata>) => void;
  
  // Helper methods
  getRoleLabel: (role: UserRole) => string;
  getRoleExperienceLabel: (role: UserRole) => string;
  getRoleProgress: (role: UserRole) => number;
  
  // Goals management
  addGoal: (goal: Omit<JourneyGoal, 'id'>) => void;
  updateGoal: (goalId: string, updates: Partial<JourneyGoal>) => void;
  removeGoal: (goalId: string) => void;
  
  // Achievements management
  addAchievement: (achievement: Omit<RoleAchievement, 'id'>) => void;
  removeAchievement: (achievementId: string) => void;
  
  // Helper methods
  hasRole: (role: UserRole) => boolean;
  isPrimaryRole: (role: UserRole) => boolean;
}

// Create the context with null default value
export const JourneyRoleContext = createContext<JourneyRoleContextType | null>(null);

// Provider props
export interface JourneyRoleProviderProps {
  children: ReactNode;
  initialRoles?: UserRole[];
  initialPrimaryRole?: UserRole;
}

/**
 * Provider component for Journey Role Context
 */
export function JourneyRoleProvider({
  children,
  initialRoles = [DEFAULT_ROLE],
  initialPrimaryRole = DEFAULT_ROLE
}: JourneyRoleProviderProps) {
  // Load stored preferences or use defaults
  const [preferences, setPreferences] = useState<JourneyRolePreferences>(() => {
    try {
      const stored = localStorage.getItem(ROLE_PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure the parsed data has the expected structure
        if (parsed && 
            Array.isArray(parsed.roles) && 
            typeof parsed.primaryRole === 'string' &&
            typeof parsed.roleMetadata === 'object') {
          // Convert date strings back to Date objects
          Object.values(parsed.roleMetadata).forEach((metadata: any) => {
            if (metadata.startDate) {
              metadata.startDate = new Date(metadata.startDate);
            }
            
            metadata.goals?.forEach((goal: any) => {
              if (goal.targetDate) {
                goal.targetDate = new Date(goal.targetDate);
              }
            });
            
            metadata.achievements?.forEach((achievement: any) => {
              if (achievement.date) {
                achievement.date = new Date(achievement.date);
              }
            });
          });
          
          return parsed as JourneyRolePreferences;
        }
      }
    } catch (error) {
      console.error('Error loading role preferences:', error);
    }
    
    // Default preferences if nothing is stored or parsing fails
    const defaultPreferences: JourneyRolePreferences = {
      roles: initialRoles,
      primaryRole: initialPrimaryRole,
      roleMetadata: initialRoles.reduce((acc, role) => {
        acc[role] = { ...DEFAULT_ROLE_METADATA };
        return acc;
      }, {} as Record<UserRole, RoleMetadata>)
    };
    
    return defaultPreferences;
  });
  
  // Destructure preferences for cleaner code
  const { roles, primaryRole, roleMetadata } = preferences;
  
  // Persist preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ROLE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving role preferences:', error);
    }
  }, [preferences]);
  
  // Set primary role (current perspective)
  const setPrimaryRole = useCallback((role: UserRole) => {
    if (!roles.includes(role)) {
      console.error(`Cannot set primary role to ${role} as it's not in the roles list`);
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      primaryRole: role
    }));
  }, [roles]);
  
  // Add a new role
  const addRole = useCallback((role: UserRole) => {
    if (roles.includes(role)) {
      console.log(`Role ${role} already exists`);
      return;
    }
    
    setPreferences(prev => {
      const newRoles = [...prev.roles, role];
      const newMetadata = { ...prev.roleMetadata };
      
      // Initialize metadata for the new role
      newMetadata[role] = {
        why: '',
        goals: [],
        experience: ExperienceLevel.BEGINNER,
        startDate: new Date(),
        achievements: []
      };
      
      return {
        ...prev,
        roles: newRoles,
        roleMetadata: newMetadata,
        // If this is the first role, make it primary
        primaryRole: prev.roles.length === 0 ? role : prev.primaryRole
      };
    });
  }, [roles]);
  
  // Remove a role
  const removeRole = useCallback((role: UserRole) => {
    if (!roles.includes(role)) {
      console.error(`Cannot remove role ${role} as it doesn't exist`);
      return;
    }
    
    // Don't allow removing all roles
    if (roles.length <= 1) {
      console.error('Cannot remove the only role');
      return;
    }
    
    setPreferences(prev => {
      const newRoles = prev.roles.filter(r => r !== role);
      const newMetadata = { ...prev.roleMetadata };
      
      // Remove metadata for the deleted role
      delete newMetadata[role];
      
      // If removing the primary role, select a new primary
      const newPrimaryRole = prev.primaryRole === role 
        ? newRoles[0] 
        : prev.primaryRole;
      
      return {
        ...prev,
        roles: newRoles,
        roleMetadata: newMetadata,
        primaryRole: newPrimaryRole
      };
    });
  }, [roles]);
  
  // Change the priority order of roles
  const setRolePriority = useCallback((newRoles: UserRole[]) => {
    // Validate that the new array contains the same roles
    if (newRoles.length !== roles.length || 
        !newRoles.every(role => roles.includes(role))) {
      console.error('New role priority list must contain the same roles');
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      roles: newRoles
    }));
  }, [roles]);
  
  // Get metadata for a specific role
  const getRoleMetadata = useCallback((role: UserRole): RoleMetadata => {
    return roleMetadata[role] || DEFAULT_ROLE_METADATA;
  }, [roleMetadata]);
  
  // Update metadata for a specific role
  const updateRoleMetadata = useCallback((role: UserRole, metadata: Partial<RoleMetadata>) => {
    if (!roles.includes(role)) {
      console.error(`Cannot update metadata for role ${role} as it doesn't exist`);
      return;
    }
    
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      
      newMetadata[role] = {
        ...newMetadata[role],
        ...metadata
      };
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, [roles]);
  
  // Add a new goal
  const addGoal = useCallback((goal: Omit<JourneyGoal, 'id'>) => {
    const { role } = goal;
    
    if (!roles.includes(role)) {
      console.error(`Cannot add goal for role ${role} as it doesn't exist`);
      return;
    }
    
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      const currentGoals = [...(newMetadata[role].goals || [])];
      
      // Add the new goal with a generated ID
      currentGoals.push({
        ...goal,
        id: nanoid()
      });
      
      // Update the role's metadata
      newMetadata[role] = {
        ...newMetadata[role],
        goals: currentGoals
      };
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, [roles]);
  
  // Update an existing goal
  const updateGoal = useCallback((goalId: string, updates: Partial<JourneyGoal>) => {
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      let goalUpdated = false;
      
      // Find the goal and update it
      Object.keys(newMetadata).forEach(roleKey => {
        const role = roleKey as UserRole;
        const goals = newMetadata[role].goals;
        
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex >= 0) {
          // Update the goal
          goals[goalIndex] = {
            ...goals[goalIndex],
            ...updates
          };
          
          goalUpdated = true;
        }
      });
      
      if (!goalUpdated) {
        console.error(`Goal with ID ${goalId} not found`);
        return prev;
      }
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, []);
  
  // Remove a goal
  const removeGoal = useCallback((goalId: string) => {
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      let goalRemoved = false;
      
      // Find the goal and remove it
      Object.keys(newMetadata).forEach(roleKey => {
        const role = roleKey as UserRole;
        const goals = newMetadata[role].goals;
        
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex >= 0) {
          // Remove the goal
          newMetadata[role].goals = goals.filter(g => g.id !== goalId);
          goalRemoved = true;
        }
      });
      
      if (!goalRemoved) {
        console.error(`Goal with ID ${goalId} not found`);
        return prev;
      }
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, []);
  
  // Add a new achievement
  const addAchievement = useCallback((achievement: Omit<RoleAchievement, 'id'>) => {
    const { role } = achievement;
    
    if (!roles.includes(role)) {
      console.error(`Cannot add achievement for role ${role} as it doesn't exist`);
      return;
    }
    
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      const currentAchievements = [...(newMetadata[role].achievements || [])];
      
      // Add the new achievement with a generated ID
      currentAchievements.push({
        ...achievement,
        id: nanoid()
      });
      
      // Update the role's metadata
      newMetadata[role] = {
        ...newMetadata[role],
        achievements: currentAchievements
      };
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, [roles]);
  
  // Remove an achievement
  const removeAchievement = useCallback((achievementId: string) => {
    setPreferences(prev => {
      const newMetadata = { ...prev.roleMetadata };
      let achievementRemoved = false;
      
      // Find the achievement and remove it
      Object.keys(newMetadata).forEach(roleKey => {
        const role = roleKey as UserRole;
        const achievements = newMetadata[role].achievements;
        
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex >= 0) {
          // Remove the achievement
          newMetadata[role].achievements = achievements.filter(a => a.id !== achievementId);
          achievementRemoved = true;
        }
      });
      
      if (!achievementRemoved) {
        console.error(`Achievement with ID ${achievementId} not found`);
        return prev;
      }
      
      return {
        ...prev,
        roleMetadata: newMetadata
      };
    });
  }, []);
  
  // Helper methods
  const hasRole = useCallback((role: UserRole) => {
    return roles.includes(role);
  }, [roles]);
  
  const isPrimaryRole = useCallback((role: UserRole) => {
    return primaryRole === role;
  }, [primaryRole]);
  
  // Get a human-readable label for a role
  const getRoleLabel = useCallback((role: UserRole): string => {
    return getRoleLabelUtil(role);  // This uses the imported utility function
  }, []);
  
  // Get a label describing experience level for a role
  const getRoleExperienceLabel = useCallback((role: UserRole): string => {
    const metadata = getRoleMetadata(role);
    switch (metadata.experience) {
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
  }, [getRoleMetadata]);
  
  // Calculate progress percentage for a role
  const getRoleProgress = useCallback((role: UserRole): number => {
    const metadata = getRoleMetadata(role);
    
    // Calculate role progress based on goals and achievements
    // A simple algorithm: achievements count / total goals count * 100
    const achievementsCount = metadata.achievements.length;
    const goalsCount = metadata.goals.length || 1; // Prevent division by zero
    
    // Calculate progress percentage, cap at 100%
    return Math.min(100, Math.round((achievementsCount / goalsCount) * 100));
  }, [getRoleMetadata]);
  
  // Build the context value
  const contextValue = useMemo<JourneyRoleContextType>(() => ({
    // Core role properties
    roles,
    primaryRole,
    
    // Role management methods
    setPrimaryRole,
    addRole,
    removeRole,
    setRolePriority,
    
    // Role metadata methods
    getRoleMetadata,
    updateRoleMetadata,
    
    // Goals management
    addGoal,
    updateGoal,
    removeGoal,
    
    // Achievements management
    addAchievement,
    removeAchievement,
    
    // Helper methods
    hasRole,
    isPrimaryRole,
    getRoleLabel,
    getRoleExperienceLabel,
    getRoleProgress
  }), [
    roles, 
    primaryRole, 
    setPrimaryRole, 
    addRole, 
    removeRole, 
    setRolePriority,
    getRoleMetadata,
    updateRoleMetadata,
    addGoal,
    updateGoal,
    removeGoal,
    addAchievement,
    removeAchievement,
    hasRole,
    isPrimaryRole,
    getRoleLabel,
    getRoleExperienceLabel,
    getRoleProgress
  ]);
  
  return (
    <JourneyRoleContext.Provider value={contextValue}>
      {children}
    </JourneyRoleContext.Provider>
  );
}