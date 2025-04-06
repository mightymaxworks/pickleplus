/**
 * Hook for interacting with the PCP Global Rankings System API (Powered by CourtIQ™)
 */
import { useMultiDimensionalRankingData, useMultiDimensionalLeaderboard, useUserRankingPosition, useUserRankingHistory, useRatingTiers } from './use-multi-dimensional-rankings';
import { AgeDivision, PlayFormat } from "../../shared/multi-dimensional-rankings";

/**
 * PCP Global Rankings data hook that combines all the queries
 * This is a renamed wrapper for useMultiDimensionalRankingData for better naming conventions
 */
export function usePCPGlobalRankingData(
  userId?: number,
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number,
  limit = 100
) {
  return useMultiDimensionalRankingData(userId, format, ageDivision, ratingTierId, limit);
}

/**
 * Get the PCP Global Rankings leaderboard
 * This is a renamed wrapper for useMultiDimensionalLeaderboard for better naming conventions
 */
export function usePCPGlobalLeaderboard(
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number,
  limit = 100,
  offset = 0
) {
  return useMultiDimensionalLeaderboard(format, ageDivision, ratingTierId, limit, offset);
}

/**
 * Get a user's PCP Global Rankings position
 * This is a renamed wrapper for useUserRankingPosition for better naming conventions
 */
export function useUserGlobalRankingPosition(
  userId?: number,
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number
) {
  return useUserRankingPosition(userId, format, ageDivision, ratingTierId);
}

/**
 * Get a user's PCP Global Rankings history
 * This is a renamed wrapper for useUserRankingHistory for better naming conventions
 */
export function useUserGlobalRankingHistory(userId?: number) {
  return useUserRankingHistory(userId);
}

// Re-export the useRatingTiers hook for convenience
export { useRatingTiers };