/**
 * Hook for interacting with the Multi-Dimensional Ranking System API
 */
import { useQuery } from "@tanstack/react-query";
import { AgeDivision, PlayFormat, LeaderboardEntry, PlayerRanking, RankingHistoryEntry } from "../../shared/multi-dimensional-rankings";

interface RankingPosition {
  userId: number;
  format: PlayFormat;
  ageDivision: AgeDivision;
  ratingTierId?: number;
  rankingPoints: number;
  rank: number;
  totalPlayers: number;
}

interface RatingTier {
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

/**
 * Get the multi-dimensional ranking leaderboard
 */
export function useMultiDimensionalLeaderboard(
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number,
  limit = 100,
  offset = 0
) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: [
      '/api/multi-rankings/leaderboard',
      format,
      ageDivision,
      ratingTierId,
      limit,
      offset
    ],
    keepPreviousData: true,
  });
}

/**
 * Get a user's ranking position across different dimensions
 */
export function useUserRankingPosition(
  userId?: number,
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number
) {
  return useQuery<RankingPosition>({
    queryKey: [
      '/api/multi-rankings/position',
      userId,
      format, 
      ageDivision,
      ratingTierId
    ],
    enabled: userId !== undefined,
  });
}

/**
 * Get a user's ranking history
 */
export function useUserRankingHistory(userId?: number) {
  return useQuery<RankingHistoryEntry[]>({
    queryKey: ['/api/multi-rankings/history', userId],
    enabled: userId !== undefined,
  });
}

/**
 * Get all available rating tiers
 */
export function useRatingTiers() {
  return useQuery<RatingTier[]>({
    queryKey: ['/api/multi-rankings/rating-tiers'],
  });
}

/**
 * Multi-dimensional rankings data hook that combines all the queries above
 */
export function useMultiDimensionalRankingData(
  userId?: number,
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number,
  limit = 100
) {
  const leaderboardQuery = useMultiDimensionalLeaderboard(format, ageDivision, ratingTierId, limit);
  const positionQuery = useUserRankingPosition(userId, format, ageDivision, ratingTierId);
  const historyQuery = useUserRankingHistory(userId);
  const tiersQuery = useRatingTiers();

  const isLoading = leaderboardQuery.isLoading || positionQuery.isLoading || historyQuery.isLoading || tiersQuery.isLoading;
  const isError = leaderboardQuery.isError || positionQuery.isError || historyQuery.isError || tiersQuery.isError;
  const error = leaderboardQuery.error || positionQuery.error || historyQuery.error || tiersQuery.error;

  return {
    leaderboard: leaderboardQuery.data || [],
    position: positionQuery.data,
    history: historyQuery.data || [],
    tiers: tiersQuery.data || [],
    isLoading,
    isError,
    error,
    refetch: () => {
      leaderboardQuery.refetch();
      positionQuery.refetch();
      historyQuery.refetch();
      tiersQuery.refetch();
    }
  };
}