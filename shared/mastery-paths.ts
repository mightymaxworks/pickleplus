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