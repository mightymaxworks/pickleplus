/**
 * PKL-278651-JOUR-002: PickleJourney™ Types
 * 
 * Types used throughout the PickleJourney emotionally intelligent journaling system.
 * Updated to support multi-role journaling in sprint JOUR-002.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-04-28
 */

import { UserRole } from '@/lib/roles';

/**
 * Emotional states used to track user's emotions
 * These states represent a blend of emotional and motivational states
 * relevant to pickleball players' journey
 */
export type EmotionalState = 
  | 'frustrated-disappointed' // Negative emotions after setbacks
  | 'anxious-uncertain'       // Anxiety or uncertainty about performance
  | 'neutral-focused'         // Neutral, baseline state of engagement
  | 'excited-proud'           // Positive emotions after success
  | 'determined-growth';      // Growth-oriented mindset

/**
 * The result of an emotion detection process
 */
export interface EmotionDetectionResult {
  /** The primary detected emotional state */
  primaryEmotion: EmotionalState;
  
  /** Confidence level (0.0-1.0) in the emotion detection */
  confidence: number;
  
  /** When the detection occurred */
  timestamp: Date;
  
  /** Source of the emotion detection */
  source: 'user-reported' | 'text-analysis' | 'interaction-pattern' | 'performance-related';
}

/**
 * Journal entry visibility level
 */
export type JournalVisibility = 
  | 'private'        // Only visible to the user
  | 'coach-shared'   // Shared with user's coach
  | 'team-shared'    // Shared with user's team
  | 'public';        // Visible to all users

/**
 * Structure of a journal entry
 */
export interface JournalEntry {
  /** Unique ID (generated client-side for now) */
  id?: string;
  
  /** Entry title */
  title: string;
  
  /** Main content of the journal entry */
  content: string;
  
  /** The emotional state associated with this entry */
  emotionalState: EmotionalState;
  
  /** When the entry was created */
  createdAt: Date;
  
  /** The visibility level of this entry */
  visibility: JournalVisibility;
  
  /** Optional tags for categorization */
  tags?: string[];
  
  /** Whether the entry has been analyzed for emotional patterns */
  analyzed?: boolean;
  
  /** Optional match ID if the entry is related to a specific match */
  matchId?: string;
  
  /** Optional list of media attachments */
  media?: Array<{
    type: 'image' | 'video',
    url: string
  }>;
}

/**
 * PKL-278651-JOUR-002.1: Extended journal entry with role context
 */
export interface RoleJournalEntry extends JournalEntry {
  /** The roles relevant to this journal entry */
  roles: UserRole[];
  
  /** The primary role perspective for this entry */
  primaryRole: UserRole;
  
  /** Insights that span across multiple roles */
  crossRoleInsights?: string;
}

/**
 * PKL-278651-JOUR-002.1: Experience level for a role
 */
export enum ExperienceLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

/**
 * PKL-278651-JOUR-002.1: Goal for a specific role journey
 */
export interface JourneyGoal {
  /** Unique identifier for the goal */
  id: string;
  
  /** Description of the goal */
  description: string;
  
  /** The primary role this goal belongs to */
  role: UserRole;
  
  /** Whether the goal has been completed */
  completed: boolean;
  
  /** Optional target date for completion */
  targetDate?: Date;
  
  /** Other roles that this goal might benefit */
  relatedRoles?: UserRole[];
}

/**
 * PKL-278651-JOUR-002.1: Achievement in a role journey
 */
export interface RoleAchievement {
  /** Unique identifier */
  id: string;
  
  /** Title of the achievement */
  title: string;
  
  /** Description of what was accomplished */
  description: string;
  
  /** When the achievement was earned */
  date: Date;
  
  /** The role this achievement is associated with */
  role: UserRole;
}

/**
 * PKL-278651-JOUR-002.1: Metadata for a specific role
 */
export interface RoleMetadata {
  /** The user's "why" statement for this role */
  why: string;
  
  /** Goals specific to this role */
  goals: JourneyGoal[];
  
  /** Experience level in this role */
  experience: ExperienceLevel;
  
  /** When the user started in this role */
  startDate: Date;
  
  /** Achievements in this role */
  achievements: RoleAchievement[];
}

/**
 * PKL-278651-JOUR-002.1: Role preferences for the journey
 */
export interface JourneyRolePreferences {
  /** All roles the user has */
  roles: UserRole[];
  
  /** The user's primary/current role focus */
  primaryRole: UserRole;
  
  /** Metadata for each role */
  roleMetadata: Record<UserRole, RoleMetadata>;
}

/**
 * PKL-278651-JOUR-002.1: Journey metadata
 */
export interface JourneyMetadata {
  /** Role preferences and metadata */
  rolePreferences: JourneyRolePreferences;
  
  /** Onboarding status */
  onboarding: {
    /** Whether onboarding has been completed */
    completed: boolean;
    
    /** Last completed step */
    lastStep: string;
    
    /** All completed steps */
    completedSteps: string[];
  };
  
  /** Journey progress tracking */
  progress: {
    /** Journey milestones achieved */
    milestones: JourneyMilestone[];
    
    /** Overall journey level */
    currentLevel: number;
    
    /** Level in each specific role */
    roleSpecificLevels: Record<UserRole, number>;
  };
}

/**
 * PKL-278651-JOUR-002.1: Journey milestone
 */
export interface JourneyMilestone {
  /** Unique identifier */
  id: string;
  
  /** Title of the milestone */
  title: string;
  
  /** Description of the milestone */
  description: string;
  
  /** When the milestone was reached */
  achievedAt: Date;
  
  /** The roles this milestone is relevant to */
  roles: UserRole[];
}

/**
 * Structure for emotional patterns derived from journal entries
 */
export interface EmotionalPatternAnalysis {
  /** The dominant emotional state in the analyzed period */
  dominantEmotion: EmotionalState;
  
  /** Distribution of emotional states */
  distribution: Record<EmotionalState, number>;
  
  /** Transition patterns between emotional states */
  transitions: Array<{
    from: EmotionalState;
    to: EmotionalState;
    frequency: number;
  }>;
  
  /** Correlation between emotional states and performance */
  performanceCorrelation?: Record<EmotionalState, number>;
  
  /** The date range analyzed */
  analyzedPeriod: {
    from: Date;
    to: Date;
  };
}

/**
 * Chart data point for emotional journey visualization
 */
export interface EmotionalDataPoint {
  /** The date represented */
  date: Date;
  
  /** Formatted date string for display */
  formattedDate: string;
  
  /** Numeric value derived from emotional state */
  value: number;
  
  /** Raw numeric value before any smoothing */
  rawValue: number | null;
  
  /** Number of entries for this date */
  entryCount: number;
  
  /** Role context for this data point */
  role?: UserRole;
}