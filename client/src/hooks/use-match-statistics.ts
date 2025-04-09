/**
 * Hook for interacting with match statistics API
 */
import { useQuery } from "@tanstack/react-query";

export interface MatchStats {
  totalMatches: number;
  matchesWon: number;
  winPercentage: number;
  totalPoints: number;
  averagePointsPerMatch: number;
  longestWinStreak: number;
  currentWinStreak: number;
  recentMatches: any[];
}

/**
 * Get match statistics for a user
 */
export function useMatchStats(userId?: number) {
  return useQuery<MatchStats>({
    queryKey: ['/api/match/stats', userId],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const currentUserId = queryKey[1] as number | undefined;
      
      const queryParams = new URLSearchParams();
      if (currentUserId !== undefined) queryParams.append('userId', currentUserId.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch match statistics');
      }
      return response.json();
    },
    enabled: userId !== undefined,
  });
}

/**
 * Get recent matches for a user
 */
export function useRecentMatches(userId?: number, limit = 5) {
  return useQuery<any[]>({
    queryKey: ['/api/match/recent', userId, limit],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const currentUserId = queryKey[1] as number | undefined;
      const currentLimit = queryKey[2] as number;
      
      const queryParams = new URLSearchParams();
      if (currentUserId !== undefined) queryParams.append('userId', currentUserId.toString());
      queryParams.append('limit', currentLimit.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent matches');
      }
      return response.json();
    },
    enabled: userId !== undefined,
  });
}