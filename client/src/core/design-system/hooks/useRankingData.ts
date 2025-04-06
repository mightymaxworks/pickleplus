/**
 * Ranking Data Hook
 * 
 * Custom hooks for accessing user ranking data from the CourtIQ™ system.
 */
import { useQuery } from '@tanstack/react-query';

export interface RankingHistory {
  id: number;
  userId: number;
  oldRanking: number;
  newRanking: number;
  changeDate: string;
  reason: string;
  matchId: number | null;
}

/**
 * Hook to fetch ranking history data for a user
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