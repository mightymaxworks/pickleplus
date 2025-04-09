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
 * Tier-specific promotion rules
 */
export interface TierPromotionRules {
  matchesAboveThreshold: number; // Number of matches above threshold rating to promote
  requiresConsecutiveMatches: boolean; // Whether matches need to be consecutive
  celebrationLevel: 'basic' | 'enhanced' | 'premium'; // Level of celebration UI
  startingPositionPercentile: number; // Starting position percentile in new tier (0-100)
}

/**
 * Tier-specific demotion rules
 */
export interface TierDemotionRules {
  gracePeriodMatches: number; // Number of matches protected after promotion
  matchesBelowThreshold: number; // Number of matches below threshold to demote
  requiresConsecutiveMatches: boolean; // Whether matches need to be consecutive
  inactivityThresholdDays: number | null; // Days of inactivity before tier health warning
  bufferZonePercentage: number; // Percentage of the tier range to use as a buffer zone
}

/**
 * Tier-adaptive rating adjustment parameters
 */
export interface TierRatingParameters {
  baseKFactor: number; // Base K-factor for this tier
  minRatingGain: number; // Minimum rating gain per match
  maxRatingGain: number; // Maximum rating gain per match
  minRatingLoss: number; // Minimum rating loss per match
  maxRatingLoss: number; // Maximum rating loss per match
  underperformanceMultiplier: number; // Multiplier for losing to lower-rated players
  overperformanceMultiplier: number; // Multiplier for beating higher-rated players
}

/**
 * Comprehensive tier rules
 */
export interface MasteryPathRules {
  tier: MasteryTierName;
  path: MasteryPath;
  promotion: TierPromotionRules;
  demotion: TierDemotionRules;
  ratingParameters: TierRatingParameters;
  features: string[]; // Tier-specific features enabled
}

/**
 * Player tier status
 */
export interface PlayerTierStatus {
  userId: number;
  currentTier: MasteryTierName;
  currentPath: MasteryPath;
  rating: number;
  globalRank: number;
  tierRank: number;
  progressToNextTier: number; // 0-100 percentage
  tierHealth: number; // 0-100 percentage (0 = at risk of demotion)
  matchesInTier: number;
  daysInTier: number;
  promotionProgress: number; // Matches above threshold / required matches
  demotionRisk: number; // Matches below threshold / limit
  gracePeriodRemaining: number; // Matches remaining in grace period
  features: string[]; // Features unlocked at this tier
}

/**
 * Tier progression history entry
 */
export interface TierProgressionEntry {
  id: number;
  userId: number;
  oldTier: MasteryTierName;
  newTier: MasteryTierName;
  oldPath: MasteryPath;
  newPath: MasteryPath;
  ratingAtProgression: number;
  reason: 'promotion' | 'demotion' | 'season_reset' | 'manual_adjustment';
  matchId?: number;
  createdAt: Date | string;
}

/**
 * Default color codes for each tier
 */
export const DEFAULT_TIER_COLORS: Record<MasteryTierName, string> = {
  // Foundation Path - Blues and Greens
  'Explorer': '#3498db',     // Blue
  'Pathfinder': '#2ecc71',   // Green
  'Trailblazer': '#1abc9c',  // Turquoise
  
  // Evolution Path - Oranges and Purples
  'Challenger': '#e67e22',   // Orange
  'Innovator': '#9b59b6',    // Purple
  'Tactician': '#d35400',    // Dark Orange
  
  // Pinnacle Path - Reds and Golds
  'Virtuoso': '#e74c3c',     // Red
  'Luminary': '#f39c12',     // Yellow/Gold
  'Legend': '#c0392b'        // Dark Red
};

/**
 * Rating ranges for each tier on the 0-9 scale
 */
export const TIER_RATING_RANGES: Record<MasteryTierName, [number, number]> = {
  // Foundation Path (0.0-2.5)
  'Explorer': [0.0, 1.0],
  'Pathfinder': [1.1, 1.8],
  'Trailblazer': [1.9, 2.5],
  
  // Evolution Path (2.6-5.0)
  'Challenger': [2.6, 3.3],
  'Innovator': [3.4, 4.2],
  'Tactician': [4.3, 5.0],
  
  // Pinnacle Path (5.1-9.0)
  'Virtuoso': [5.1, 6.3],
  'Luminary': [6.4, 7.7],
  'Legend': [7.8, 9.0]
};

/**
 * Default taglines for each tier
 */
export const DEFAULT_TIER_TAGLINES: Record<MasteryTierName, string> = {
  // Foundation Path
  'Explorer': 'Discovering the world of pickleball',
  'Pathfinder': 'Forging your unique pickleball journey',
  'Trailblazer': 'Setting the foundation for future mastery',
  
  // Evolution Path
  'Challenger': 'Expanding your skills and strategic thinking',
  'Innovator': 'Developing your distinctive playing style',
  'Tactician': 'Refining your approach with strategic precision',
  
  // Pinnacle Path
  'Virtuoso': 'Mastering the subtle artistry of the game',
  'Luminary': 'Illuminating the court with exceptional skill',
  'Legend': 'Defining the heights of pickleball excellence'
};