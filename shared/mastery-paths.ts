/**
 * Shared types for the CourtIQ™ Mastery Paths System
 * Sprint: PKL-278651-RATE-0004-MADV
 */

/**
 * Path types for grouping tiers
 */
export type MasteryPath = 'Foundation' | 'Evolution' | 'Pinnacle';

/**
 * Tier names enum for the Mastery Path system
 */
export type MasteryTierName = 
  // Foundation Path
  'Explorer' | 'Pathfinder' | 'Trailblazer' |
  // Evolution Path
  'Challenger' | 'Innovator' | 'Tactician' |
  // Pinnacle Path
  'Virtuoso' | 'Luminary' | 'Legend';

/**
 * Mastery Tier definition
 */
export interface MasteryTier {
  id: number;
  name: MasteryTierName;
  path: MasteryPath;
  displayName: string;
  tagline: string;
  minRating: number;
  maxRating: number;
  badgeUrl: string | null;
  colorCode: string | null;
  description: string | null;
  order: number;
  iconName: string | null;
}

/**
 * Maps a tier to its path
 */
export const TIER_TO_PATH_MAP: Record<MasteryTierName, MasteryPath> = {
  // Foundation Path
  'Explorer': 'Foundation',
  'Pathfinder': 'Foundation',
  'Trailblazer': 'Foundation',
  // Evolution Path
  'Challenger': 'Evolution',
  'Innovator': 'Evolution',
  'Tactician': 'Evolution',
  // Pinnacle Path
  'Virtuoso': 'Pinnacle',
  'Luminary': 'Pinnacle',
  'Legend': 'Pinnacle'
};

/**
 * Tier health status
 */
export type TierHealth = 'good' | 'warning' | 'danger';

/**
 * Default tier colors for UI rendering when not provided by the API
 * Added as part of PKL-278651-RATE-0004-MADV-FIX
 */
export const DEFAULT_TIER_COLORS = {
  // Foundation Path
  'Explorer': '#4285F4',      // Blue
  'Pathfinder': '#3367D6',    // Darker Blue
  'Trailblazer': '#2A56C6',   // Deep Blue
  
  // Evolution Path
  'Challenger': '#9C27B0',    // Purple
  'Innovator': '#8E24AA',     // Mid Purple
  'Tactician': '#7B1FA2',     // Deep Purple
  
  // Pinnacle Path
  'Virtuoso': '#FFA000',      // Amber
  'Luminary': '#FF8F00',      // Dark Amber
  'Legend': '#FF6F00'         // Deep Amber
} as const;

/**
 * Player's current tier status
 */
export interface PlayerTierStatus {
  userId: number;
  currentTierId: number;
  currentTierName: MasteryTierName;
  currentPath: MasteryPath;
  progressPercent: number;
  pathProgressPercent: number;
  rating: number;
  nextTierId?: number;
  nextTierName?: MasteryTierName;
  pointsToNextTier: number;
  tierHealth: TierHealth;
  matchesInTier: number;
  lastMatch: string; // ISO date string
  status?: string;   // For status messages like "insufficient_data"
}

/**
 * Tier progression event
 */
export interface TierProgression {
  id: number;
  userId: number;
  fromTierId: number | null;
  fromTierName: MasteryTierName | null;
  toTierId: number;
  toTierName: MasteryTierName;
  ratingBefore: number;
  ratingAfter: number;
  matchId: number | null;
  timestamp: string; // ISO date string
  progressionType: 'promotion' | 'demotion' | 'initial';
}

/**
 * Progress needed for next tier
 */
export interface NextTierProgress {
  currentTierName: MasteryTierName;
  nextTierName: MasteryTierName | null;
  currentRating: number;
  pointsNeeded: number;
  estimatedMatches: number;
  progressPercent: number;
}