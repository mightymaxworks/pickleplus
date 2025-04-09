/**
 * Hook for fetching mastery tier information
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import { useQuery } from '@tanstack/react-query';
import type { MasteryTier, MasteryPath } from '@shared/mastery-paths';

/**
 * Hook to fetch all mastery tiers
 */
export function useMasteryTiers() {
  return useQuery({
    queryKey: ['mastery', 'tiers'],
    queryFn: async () => {
      const response = await fetch('/api/mastery/tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch mastery tiers');
      }
      return response.json() as Promise<MasteryTier[]>;
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour - these rarely change
  });
}

/**
 * Hook to fetch tiers for a specific path
 */
export function usePathTiers(path: MasteryPath | undefined) {
  return useQuery({
    queryKey: ['mastery', 'tiers', 'path', path],
    queryFn: async () => {
      const response = await fetch(`/api/mastery/paths/${path}/tiers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tiers for path ${path}`);
      }
      return response.json() as Promise<MasteryTier[]>;
    },
    enabled: !!path,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch a specific tier by name
 */
export function useTierByName(tierName: string | undefined) {
  return useQuery({
    queryKey: ['mastery', 'tier', tierName],
    queryFn: async () => {
      const response = await fetch(`/api/mastery/tiers/${tierName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tier ${tierName}`);
      }
      return response.json() as Promise<MasteryTier>;
    },
    enabled: !!tierName,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch players in a specific tier
 */
export function usePlayersInTier(tierName: string | undefined, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['mastery', 'tier', tierName, 'players', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/mastery/tiers/${tierName}/players?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch players for tier ${tierName}`);
      }
      return response.json() as Promise<{
        players: Array<{
          userId: number;
          username: string;
          displayName: string;
          avatarUrl: string | null;
          countryCode: string;
          rating: number;
          matchesInTier: number;
          position: number;
          tier: string;
          path: MasteryPath;
        }>;
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          pages: number;
        };
      }>;
    },
    enabled: !!tierName,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}