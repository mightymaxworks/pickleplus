/**
 * Hook for fetching all ranking positions across eligible divisions and formats
 * Creates competitive motivation by showing users where they need to "catch up"
 */

import { useQuery } from "@tanstack/react-query";

export interface RankingPosition {
  division: string;
  format: string;
  status: 'ranked' | 'not_ranked';
  rank: number;
  rankingPoints: number;
  matchCount: number;
  requiredMatches: number;
  totalPlayersInDivision: number;
  lastMatchDate: string | null;
  needsMatches: number;
}

export interface AllRankingPositionsResponse {
  success: boolean;
  data: RankingPosition[];
  totalCategories: number;
}

export function useAllRankingPositions() {
  return useQuery<AllRankingPositionsResponse>({
    queryKey: ["/api/multi-rankings/all-positions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}