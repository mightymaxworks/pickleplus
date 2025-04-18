/**
 * PKL-278651-GAME-0001-MOD
 * Gamification API Types
 * 
 * Type definitions for the gamification module API.
 */

/**
 * Discovery Context
 * 
 * Contains contextual information about the user and their environment
 * when a discovery is made.
 */
export interface DiscoveryContext {
  /** User's current level */
  userLevel?: number;
  /** User's current type (e.g., 'free', 'premium', 'admin') */
  userType?: string;
  /** List of previous discovery codes that the user has found */
  previousDiscoveries?: string[];
  /** Other contextual data */
  [key: string]: any;
}

/**
 * Requirement Check Result
 * 
 * Result of checking if a user meets the requirements for a discovery.
 */
export interface RequirementCheckResult {
  /** Whether the requirements are met */
  met: boolean;
  /** Reason why the requirements are not met (if applicable) */
  reason?: string;
}

/**
 * Discovery Notification
 * 
 * Notification displayed to the user when they make a discovery.
 */
export interface DiscoveryNotification {
  /** Title of the notification */
  title: string;
  /** Message displayed in the notification */
  message: string;
  /** Optional image URL to display */
  imageUrl?: string;
  /** Level of the notification ('info', 'success', 'special', etc.) */
  level?: 'info' | 'success' | 'special';
  /** Whether to automatically hide the notification */
  autoHide?: boolean;
  /** Duration in milliseconds before hiding (if autoHide is true) */
  duration?: number;
  /** Reward associated with the discovery (if any) */
  reward?: Reward;
}

/**
 * Reward
 * 
 * A reward that can be earned through the gamification system.
 */
export interface Reward {
  /** Unique identifier for the reward */
  id?: number;
  /** Name of the reward */
  name: string;
  /** Description of the reward */
  description: string;
  /** Type of reward ('badge', 'xp', 'feature_unlock', 'physical', etc.) */
  type: 'badge' | 'xp' | 'feature_unlock' | 'physical' | string;
  /** Rarity of the reward ('common', 'uncommon', 'rare', 'epic', 'legendary') */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Optional image URL for the reward */
  imageUrl?: string;
  /** Value of the reward (depends on the type) */
  value?: {
    /** Amount of XP awarded (for 'xp' type) */
    xpAmount?: number;
    /** Badge ID (for 'badge' type) */
    badgeId?: string;
    /** Feature ID to unlock (for 'feature_unlock' type) */
    featureId?: string;
    /** Coupon code (for 'coupon' type) */
    couponCode?: string;
    /** Physical item details (for 'physical' type) */
    physicalItem?: {
      /** Name of the physical item */
      name: string;
      /** SKU of the physical item */
      sku: string;
      /** Shipping information for the physical item */
      shippingInfo?: Record<string, any>;
    };
    /** Other value types */
    [key: string]: any;
  };
}

/**
 * Discovery Point
 * 
 * A specific item or interaction that can be discovered in the application.
 */
export interface DiscoveryPoint {
  /** Unique identifier for the discovery point */
  id?: number;
  /** Campaign ID that this discovery point belongs to */
  campaignId: number;
  /** Name of the discovery point */
  name: string;
  /** Unique code for the discovery */
  code: string;
  /** Description of the discovery */
  description?: string;
  /** Point value for discovering this point */
  pointValue?: number;
  /** Content associated with the discovery */
  content?: {
    /** Optional title for the content */
    title?: string;
    /** Detailed information about the discovery */
    details?: string;
    /** Optional image URL */
    imageUrl?: string;
    /** Optional video URL */
    videoUrl?: string;
    /** External links related to the discovery */
    externalLinks?: { label: string; url: string }[];
  };
  /** Requirements to discover this point */
  requirements?: {
    /** Minimum user level required */
    minUserLevel?: number;
    /** Prerequisite discoveries (by code) */
    prerequisiteDiscoveries?: string[];
    /** User types that can make this discovery */
    userType?: string[];
    /** Date restrictions for the discovery */
    dateRestriction?: {
      /** Date from which the discovery is available */
      from?: string;
      /** Date until which the discovery is available */
      to?: string;
    };
  };
  /** Configuration for the discovery */
  config: {
    /** Difficulty of finding the discovery */
    difficulty: 'easy' | 'medium' | 'hard';
    /** Type of discovery */
    type: 'hidden' | 'educational' | 'game' | 'quiz';
    /** Action that triggers the discovery */
    triggerAction?: string;
    /** Location where the discovery can be found */
    location?: string;
  };
}

/**
 * Discovery Event
 * 
 * An event related to a discovery.
 */
export interface DiscoveryEvent {
  /** ID of the discovery */
  discoveryId: number;
  /** Code of the discovery */
  code: string;
  /** Timestamp of the event */
  timestamp: string;
  /** Contextual information about the event */
  context?: Record<string, any>;
}

/**
 * Campaign
 * 
 * A collection of discovery points and rewards.
 */
export interface Campaign {
  /** Unique identifier for the campaign */
  id: number;
  /** Name of the campaign */
  name: string;
  /** Description of the campaign */
  description?: string;
  /** Start date of the campaign */
  startDate?: string;
  /** End date of the campaign */
  endDate?: string;
  /** Whether the campaign is active */
  isActive: boolean;
  /** Configuration for the campaign */
  config?: {
    /** Theme of the campaign */
    theme?: string;
    /** Required user level to participate */
    requiredUserLevel?: number;
    /** Whether to show in campaign list */
    showInList?: boolean;
    /** Featured image URL */
    imageUrl?: string; // Changed from featuredImage for schema consistency
    /** Tags for the campaign */
    tags?: string[];
  };
}

/**
 * Campaign Progress
 * 
 * A user's progress in a campaign.
 */
export interface CampaignProgress {
  /** Campaign ID */
  campaignId: number;
  /** Number of discoveries found */
  discoveries: number;
  /** Total points earned */
  totalPoints: number;
  /** Progress details */
  progress: {
    /** Completion percentage */
    percentage: number;
    /** Milestones achieved */
    milestones: Record<string, boolean>;
    /** Timestamp of last activity */
    lastActivity: string;
  };
}

/**
 * User Discovery
 * 
 * A record of a user discovering a discovery point.
 */
export interface UserDiscovery {
  /** ID of the discovery */
  discoveryId: number;
  /** When the discovery was made */
  discoveredAt: string;
  /** Whether the reward has been claimed */
  rewardClaimed: boolean;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Trigger Config
 * 
 * Configuration for triggering a discovery.
 */
export interface TriggerConfig {
  /** Type of trigger */
  type: 'click' | 'hover' | 'keystroke' | 'sequence' | 'location' | 'timer';
  /** Parameters for the trigger */
  params?: Record<string, any>;
}