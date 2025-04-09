/**
 * Hook for getting player's current mastery tier status
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { PlayerTierStatus } from '@shared/mastery-paths';

/**
 * Hook to fetch the current user's mastery tier status
 */
export function useMasteryTierStatus() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mastery', 'status', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/mastery/status');
      if (!response.ok) {
        throw new Error('Failed to fetch mastery tier status');
      }
      return response.json() as Promise<PlayerTierStatus>;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch another player's mastery tier status
 */
export function useOtherPlayerMasteryStatus(playerId: number | undefined) {
  return useQuery({
    queryKey: ['mastery', 'status', 'player', playerId],
    queryFn: async () => {
      const response = await fetch(`/api/mastery/players/${playerId}/status`);
      if (!response.ok) {
        throw new Error(`Failed to fetch player ${playerId}'s mastery tier status`);
      }
      return response.json() as Promise<PlayerTierStatus>;
    },
    enabled: !!playerId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch the progress needed to reach the next tier
 */
export function useNextTierProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mastery', 'next-tier', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/mastery/next-tier');
      if (!response.ok) {
        throw new Error('Failed to fetch next tier progress');
      }
      return response.json() as Promise<{
        currentTier: string;
        nextTier: string | null;
        currentRating: number;
        requiredRating: number;
        progressPercent: number;
        matchesNeeded: number;
      }>;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}