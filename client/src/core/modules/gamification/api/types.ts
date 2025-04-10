/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module Types
 * 
 * This file defines the TypeScript types for the gamification module.
 */

import type {
  Campaign,
  DiscoveryPoint,
  UserDiscovery,
  Reward,
  UserReward,
  CampaignProgress
} from '@shared/gamification.schema';

// Re-export database types
export type {
  Campaign,
  DiscoveryPoint,
  UserDiscovery,
  Reward,
  UserReward,
  CampaignProgress
};

/**
 * Discovery event details
 */
export interface DiscoveryEvent {
  discoveryId: number;
  code: string;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Reward event details
 */
export interface RewardEvent {
  rewardId: number;
  userId: number;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Notification level for discovery alerts
 */
export type NotificationLevel = 'info' | 'success' | 'special' | 'hidden';

/**
 * Discovery notification configuration
 */
export interface DiscoveryNotification {
  title: string;
  message: string;
  level: NotificationLevel;
  imageUrl?: string;
  reward?: {
    id: number;
    name: string;
    description: string;
    value: any;
    imageUrl?: string;
  };
  autoHide?: boolean;
  duration?: number; // in milliseconds
  sound?: 'default' | 'achievement' | 'special' | string;
  animation?: 'fade' | 'slide' | 'bounce' | 'confetti' | string;
}

/**
 * Discovery trigger types
 */
export type DiscoveryTriggerType = 
  | 'click'      // Triggered by clicking an element
  | 'sequence'   // Triggered by a sequence of actions
  | 'konami'     // Triggered by keyboard sequence
  | 'timer'      // Triggered after being on a page for a duration
  | 'scroll'     // Triggered when scrolling to a specific point
  | 'hover'      // Triggered when hovering over an element
  | 'combo'      // Triggered by a combination of other triggers
  | 'custom';    // Triggered by custom logic

/**
 * Click trigger configuration
 */
export interface ClickTriggerConfig {
  selector?: string;      // CSS selector for the element
  clickCount?: number;    // Number of clicks required
  interval?: number;      // Max time between clicks (ms)
  requirePreciseOrder?: boolean; // If multi-element, require exact order
}

/**
 * Sequence trigger configuration
 */
export interface SequenceTriggerConfig {
  steps: Array<{
    action: 'click' | 'hover' | 'input' | 'key';
    target?: string;
    value?: string;
    duration?: number;
  }>;
  timeLimit?: number;     // Time limit to complete sequence (ms)
  allowExtra?: boolean;   // Allow extra actions between sequence steps
}

/**
 * Konami trigger configuration
 */
export interface KonamiTriggerConfig {
  code: string[];         // Array of key codes, e.g. ['ArrowUp', 'ArrowUp', ...]
  caseSensitive?: boolean;
  timeLimit?: number;     // Time limit to enter code (ms)
}

/**
 * Timer trigger configuration
 */
export interface TimerTriggerConfig {
  duration: number;       // Time in milliseconds
  requireActivity?: boolean; // Require user activity during wait
  resetOnNavigate?: boolean; // Reset timer on page navigation
}

/**
 * Scroll trigger configuration
 */
export interface ScrollTriggerConfig {
  target?: string;        // Element to scroll to, or % of page
  threshold?: number;     // % of element visible to trigger
  mustStay?: boolean;     // Must stay at position for duration
  duration?: number;      // Time to stay at position (ms)
}

/**
 * Hover trigger configuration
 */
export interface HoverTriggerConfig {
  selector: string;        // Element to hover over
  duration: number;        // Time to hover (ms)
  requireContinuous?: boolean; // Must be continuous hover
}

/**
 * Combined trigger configuration union type
 */
export type TriggerConfig = 
  | { type: 'click', config: ClickTriggerConfig }
  | { type: 'sequence', config: SequenceTriggerConfig }
  | { type: 'konami', config: KonamiTriggerConfig }
  | { type: 'timer', config: TimerTriggerConfig }
  | { type: 'scroll', config: ScrollTriggerConfig }
  | { type: 'hover', config: HoverTriggerConfig }
  | { type: 'combo', config: { triggers: TriggerConfig[], requireAll: boolean } }
  | { type: 'custom', config: Record<string, any> };

/**
 * Discovery status for a user
 */
export interface DiscoveryStatus {
  discovered: boolean;
  discoveredAt?: string;
  rewardClaimed: boolean;
  rewardClaimedAt?: string;
}

/**
 * Campaign status for a user
 */
export interface CampaignStatus {
  campaignId: number;
  name: string;
  totalDiscoveries: number;
  discoveredCount: number;
  completionPercentage: number;
  isComplete: boolean;
  completedAt?: string;
  totalPoints: number;
  progress: {
    percentage: number;
    milestones: Record<string, boolean>;
    lastActivity: string;
  };
}

/**
 * Gamification module state
 */
export interface GamificationState {
  initialized: boolean;
  activeCampaigns: Campaign[];
  userDiscoveries: Record<string, DiscoveryStatus>; // key is discovery code
  campaignProgress: Record<number, CampaignStatus>; // key is campaign ID
  currentNotification: DiscoveryNotification | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Gamification API response for user discoveries
 */
export interface UserDiscoveriesResponse {
  discoveries: Array<UserDiscovery & { discoveryDetails: DiscoveryPoint }>;
  campaigns: Array<CampaignProgress & { campaignDetails: Campaign }>;
}

/**
 * Discovery requirement check result
 */
export interface RequirementCheckResult {
  met: boolean;
  reason?: string;
}

/**
 * Context for triggering discoveries
 */
export interface DiscoveryContext {
  location: string;
  userLevel?: number;
  userType?: string;
  previousDiscoveries?: string[];
  [key: string]: any;
}