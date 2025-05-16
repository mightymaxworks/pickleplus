/**
 * PKL-278651-DASH-0010-REDESIGN
 * Hook for fetching recent matches
 * 
 * Provides real match data for displaying recent match history
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-05-16
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface MatchPlayer {
  userId: number;
  score: string;
  isWinner: boolean;
  displayName?: string;
  username?: string;
  avatarInitials?: string;
}

export interface GameScore {
  playerOneScore: number;
  playerTwoScore: number;
}

export interface RecentMatch {
  id: string;
  formatType: string;
  date: string;
  players: MatchPlayer[];
  gameScores: GameScore[];
  pointsAwarded?: number;
  rankingPointsEarned?: number;
  validationStatus: string;
  matchType?: string;
  playerNames?: {
    [key: string]: {
      displayName: string;
      username: string;
      avatarInitials: string;
    }
  };
  user1Id?: number;
  user2Id?: number;
  user1Name?: string;
  user2Name?: string;
  user1Score?: string;
  user2Score?: string;
  isUser1Winner?: boolean;
}

interface UseRecentMatchesOptions {
  userId?: number;
  limit?: number;
  enabled?: boolean;
}

export function useRecentMatches({ userId, limit = 5, enabled = true }: UseRecentMatchesOptions = {}) {
  return useQuery({
    queryKey: ['/api/sage/match-history', userId, limit],
    queryFn: async () => {
      // Using the sage/match-history endpoint which is available in our API
      const res = await apiRequest('GET', `/api/sage/match-history?limit=${limit}`);
      const data = await res.json();
      
      // Check if we have valid data in the expected format
      if (data && data.success && Array.isArray(data.data)) {
        return data.data as RecentMatch[];
      }
      
      // Return empty array if no data found
      return [] as RecentMatch[];
    },
    enabled: !!userId && enabled,
  });
}