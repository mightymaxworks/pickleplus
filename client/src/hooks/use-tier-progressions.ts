/**
 * Hook for tracking tier progression history
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { TierProgressionEntry } from '@shared/mastery-paths';

/**
 * Hook to fetch the current user's tier progression history
 */
export function useTierProgressions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mastery', 'progressions', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/mastery/progressions');
      if (!response.ok) {
        throw new Error('Failed to fetch tier progressions');
      }
      return response.json() as Promise<TierProgressionEntry[]>;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch another player's tier progression history
 */
export function useOtherPlayerTierProgressions(playerId: number | undefined) {
  return useQuery({
    queryKey: ['mastery', 'progressions', 'player', playerId],
    queryFn: async () => {
      const response = await fetch(`/api/mastery/players/${playerId}/progressions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tier progressions for player ${playerId}`);
      }
      return response.json() as Promise<TierProgressionEntry[]>;
    },
    enabled: !!playerId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Utility to format progression events for human-readable display
 */
export function formatTierProgression(progression: TierProgressionEntry): {
  text: string;
  color: string;
  icon: string;
} {
  // Determine display text based on progression reason
  let text = '';
  let color = '';
  let icon = '';
  
  switch (progression.reason) {
    case 'promotion':
      text = `Promoted from ${progression.oldTier} to ${progression.newTier}`;
      color = 'text-green-600';
      icon = 'arrow-up';
      
      // Special case for path change
      if (progression.oldPath !== progression.newPath) {
        text = `Advanced from ${progression.oldPath} Path (${progression.oldTier}) to ${progression.newPath} Path (${progression.newTier})`;
        color = 'text-purple-600';
        icon = 'medal';
      }
      break;
      
    case 'demotion':
      text = `Moved from ${progression.oldTier} to ${progression.newTier}`;
      color = 'text-amber-600';
      icon = 'arrow-down';
      
      // Special case for path change
      if (progression.oldPath !== progression.newPath) {
        text = `Moved from ${progression.oldPath} Path (${progression.oldTier}) to ${progression.newPath} Path (${progression.newTier})`;
        color = 'text-blue-600';
        icon = 'refresh-cw';
      }
      break;
      
    case 'season_reset':
      text = `Season Reset: Placed in ${progression.newTier}`;
      color = 'text-blue-500';
      icon = 'calendar';
      break;
      
    case 'manual_adjustment':
      text = `Admin adjustment from ${progression.oldTier} to ${progression.newTier}`;
      color = 'text-gray-600';
      icon = 'settings';
      break;
  }
  
  return { text, color, icon };
}