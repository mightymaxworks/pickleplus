/**
 * XP Data Hook
 * 
 * Custom hooks for accessing user XP data from the CourtIQ™ system.
 */
import { useQuery } from '@tanstack/react-query';

export interface XPLevel {
  id: number;
  name: string;
  level: number;
  description: string | null;
  minXP: number;
  maxXP: number;
  badgeUrl: string | null;
  colorCode: string | null;
  unlocks: string | string[] | null;
}

export interface XPMultiplier {
  name: string;
  value: number;
  remainingTime: string;
  expiresAt: string;
}

export interface XPActivity {
  id: number;
  description: string;
  xpEarned: number;
  date: string;
}

export interface XPData {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  levelInfo: XPLevel;
  nextLevelInfo?: XPLevel;
  recentActivities?: XPActivity[];
  activeMultipliers?: XPMultiplier[];
}

/**
 * Hook to fetch XP data for a user
 */
export function useXPData(userId?: number) {
  const queryParams = new URLSearchParams();
  
  if (userId) {
    queryParams.append('userId', userId.toString());
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const { data, isLoading, error } = useQuery<XPData>({
    queryKey: ['/api/user/xp-tier', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/xp-tier${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch XP data');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  return {
    xpData: data,
    isLoading,
    error,
  };
}