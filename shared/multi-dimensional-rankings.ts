/**
 * Shared types for the multi-dimensional ranking system
 */

/**
 * Play format enum type
 */
export type PlayFormat = 'singles' | 'doubles' | 'mixed';

/**
 * Age division enum type
 * Junior divisions: U12, U14, U16, U19
 * Adult divisions: 19plus (Open), 35plus, 50plus
 * Senior divisions: 60plus, 70plus
 */
export type AgeDivision = 'U12' | 'U14' | 'U16' | 'U19' | '19plus' | '35plus' | '50plus' | '60plus' | '70plus';

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
  reason?: string;
  matchId?: number | null;
  tournamentId?: number | null;
  createdAt?: Date | string | null;
  timestamp?: string;
  rankingPoints?: number;
  rank?: number;
  skillRating?: number;
}

/**
 * Entry for the leaderboard
 */
export interface LeaderboardEntry {
  id?: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarInitials?: string | null;
  avatarUrl?: string | null;
  countryCode?: string;
  rankingPoints?: number;
  rank?: number;
  position?: number;
  pointsTotal?: number;
  specialty?: string;
  ratings?: {
    serve?: number;
    return?: number;
    dinking?: number;
    third_shot?: number;
    court_movement?: number;
    strategy?: number;
    offensive?: number;
    defensive?: number;
    [key: string]: number | undefined;
  };
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