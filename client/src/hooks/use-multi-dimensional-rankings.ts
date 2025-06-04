/**
 * Hook for interacting with the Multi-Dimensional Ranking System API
 */
import { useQuery } from "@tanstack/react-query";
import { AgeDivision, PlayFormat, LeaderboardEntry, PlayerRanking, RankingHistoryEntry } from "@shared/multi-dimensional-rankings";

interface RankingPosition {
  userId: number;
  format: PlayFormat;
  ageDivision: AgeDivision;
  ratingTierId?: number;
  rankingPoints?: number;
  rank?: number;
  totalPlayers?: number;
  skillRating?: number;
  // Fields for empty states
  status?: "not_ranked" | "insufficient_data";
  message?: string;
  requiredMatches?: number;
  currentMatches?: number;
  requiresEnrollment?: boolean;
  guidance?: {
    title: string;
    description: string;
    primaryAction: string;
    primaryActionPath: string;
    secondaryAction?: string;
    secondaryActionPath?: string;
  };
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

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  categories: string[];
  tiers: {
    name: string;
    minRating: number;
    color: string;
  }[];
  // PKL-278651-RANK-0004-THRESH - Ranking Table Threshold System
  status?: "active" | "insufficient_players";
  playerCount?: number;
  requiredCount?: number;
  message?: string;
  guidance?: {
    title: string;
    description: string;
    primaryAction: string;
    primaryActionPath: string;
    secondaryAction?: string;
    secondaryActionPath?: string;
  };
}

/**
 * Get the multi-dimensional ranking leaderboard with skill-based rating filters
 * 
 * @param format The play format (singles, doubles, mixed)
 * @param ageDivision The age division (19plus, 35plus, etc.)
 * @param ratingTierId Optional rating tier ID for backward compatibility
 * @param limit Number of records to return
 * @param offset Pagination offset
 * @param tier Optional tier filter (e.g., "Elite", "Advanced")
 * @param minRating Optional minimum rating filter (0-9 scale)
 * @param maxRating Optional maximum rating filter (0-9 scale)
 * @returns Query result with leaderboard data
 */
export function useMultiDimensionalLeaderboard(
  format: PlayFormat = 'singles',
  ageDivision: AgeDivision = '19plus',
  ratingTierId?: number,
  limit = 100,
  offset = 0,
  tier?: string,
  minRating?: number,
  maxRating?: number
) {
  return useQuery<LeaderboardResponse>({
    queryKey: [
      '/api/multi-rankings/leaderboard',
      format,
      ageDivision,
      ratingTierId,
      limit,
      offset,
      tier,
      minRating,
      maxRating,
      'age-division-v1' // Cache buster for new age-division ranking system
    ],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const currentFormat = queryKey[1] as string;
      const currentAgeDivision = queryKey[2] as string;
      const currentRatingTierId = queryKey[3] as number | undefined;
      const currentLimit = queryKey[4] as number;
      const currentOffset = queryKey[5] as number;
      const currentTier = queryKey[6] as string | undefined;
      const currentMinRating = queryKey[7] as number | undefined;
      const currentMaxRating = queryKey[8] as number | undefined;
      
      const queryParams = new URLSearchParams();
      queryParams.append('format', currentFormat);
      queryParams.append('ageDivision', currentAgeDivision);
      if (currentRatingTierId !== undefined) queryParams.append('ratingTierId', currentRatingTierId.toString());
      queryParams.append('limit', currentLimit.toString());
      queryParams.append('offset', currentOffset.toString());
      
      // Add new rating filter parameters
      if (currentTier !== undefined) queryParams.append('tier', currentTier);
      if (currentMinRating !== undefined) queryParams.append('minRating', currentMinRating.toString());
      if (currentMaxRating !== undefined) queryParams.append('maxRating', currentMaxRating.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      return response.json();
    },
    placeholderData: previousData => previousData,
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
      ratingTierId,
      'age-division-v1' // Cache buster for new age-division ranking system
    ],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const currentUserId = queryKey[1] as number | undefined;
      const currentFormat = queryKey[2] as string;
      const currentAgeDivision = queryKey[3] as string; 
      const currentRatingTierId = queryKey[4] as number | undefined;
      
      const queryParams = new URLSearchParams();
      if (currentUserId !== undefined) queryParams.append('userId', currentUserId.toString());
      queryParams.append('format', currentFormat);
      queryParams.append('ageDivision', currentAgeDivision);
      if (currentRatingTierId !== undefined) queryParams.append('ratingTierId', currentRatingTierId.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ranking position');
      }
      return response.json();
    },
    enabled: userId !== undefined,
  });
}

/**
 * Get a user's ranking history
 */
export function useUserRankingHistory(userId?: number) {
  return useQuery<RankingHistoryEntry[]>({
    queryKey: ['/api/multi-rankings/history', userId],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const currentUserId = queryKey[1] as number | undefined;
      
      const queryParams = new URLSearchParams();
      if (currentUserId !== undefined) queryParams.append('userId', currentUserId.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ranking history');
      }
      return response.json();
    },
    enabled: userId !== undefined,
  });
}

/**
 * Get all available rating tiers
 */
export function useRatingTiers() {
  return useQuery<RatingTier[]>({
    queryKey: ['/api/multi-rankings/rating-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/multi-rankings/rating-tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch rating tiers');
      }
      return response.json();
    },
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

  // PKL-278651-RANK-0004-THRESH - Ranking Table Threshold System
  return {
    leaderboard: leaderboardQuery.data?.leaderboard || [],
    position: positionQuery.data,
    history: historyQuery.data || [],
    tiers: tiersQuery.data || [],
    categories: leaderboardQuery.data?.categories || [],
    // New fields for threshold system
    leaderboardStatus: leaderboardQuery.data?.status || "active",
    playerCount: leaderboardQuery.data?.playerCount,
    requiredCount: leaderboardQuery.data?.requiredCount,
    leaderboardMessage: leaderboardQuery.data?.message,
    leaderboardGuidance: leaderboardQuery.data?.guidance,
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