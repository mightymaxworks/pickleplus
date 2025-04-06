/**
 * Ranking Data Hook
 * 
 * Custom hooks for accessing user ranking data from the CourtIQ™ system.
 * 
 * NOTE: This hook now uses the multi-dimensional ranking system internally,
 * but maintains backward compatibility by transforming the data format.
 */
import { useQuery } from '@tanstack/react-query';
import { RankingHistoryEntry } from '@shared/multi-dimensional-rankings';

export interface RankingHistory {
  id: number;
  userId: number;
  oldRanking: number;
  newRanking: number;
  changeDate: string;
  reason: string;
  matchId: number | null;
  format?: string;
  ageDivision?: string;
  ratingTierId?: number | null;
}

/**
 * Hook to fetch ranking history data for a user
 * This hook now uses the multi-dimensional ranking system internally
 */
export function useRankingHistory(userId?: number, limit?: number) {
  const queryParams = new URLSearchParams();
  
  if (userId) {
    queryParams.append('userId', userId.toString());
  }
  
  if (limit) {
    queryParams.append('limit', limit.toString());
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const { data, isLoading, error } = useQuery<RankingHistory[]>({
    queryKey: ['/api/user/ranking-history', userId, limit],
    queryFn: async () => {
      // This endpoint now redirects to the multi-dimensional ranking system
      const response = await fetch(`/api/user/ranking-history${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ranking history');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  return {
    rankingHistory: data || [],
    isLoading,
    error,
  };
}