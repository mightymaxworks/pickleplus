/**
 * Shared types for the multi-dimensional ranking system
 */

/**
 * Play format enum type
 */
export type PlayFormat = 'singles' | 'doubles' | 'mixed';

/**
 * Age division enum type
 */
export type AgeDivision = '19plus' | '35plus' | '50plus';

/**
 * Player ranking in the database
 */
export interface PlayerRanking {
  id: number;
  userId: number;
  format: PlayFormat;
  ageDivision: AgeDivision;
  ratingTierId: number | null;
  rankingPoints: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Entry for a player's ranking history
 */
export interface RankingHistoryEntry {
  id: number;
  userId: number;
  format: PlayFormat;
  ageDivision: AgeDivision;
  ratingTierId: number | null;
  oldRanking: number;
  newRanking: number;
  reason: string;
  matchId: number | null;
  tournamentId: number | null;
  createdAt: Date | null;
}

/**
 * Entry for the leaderboard
 */
export interface LeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarInitials: string | null;
  rankingPoints: number;
  rank: number;
}

/**
 * Rating tier for grouping players
 */
export interface RatingTier {
  id: number;
  name: string;
  minRating: number;
  maxRating: number;
  badgeUrl: string | null;
  colorCode: string | null;
  protectionLevel: number;
  description: string | null;
  order: number;
}