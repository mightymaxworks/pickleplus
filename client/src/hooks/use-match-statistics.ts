/**
 * PKL-278651-STATS-0002-RD: Match Statistics Dashboard Integration
 * This hook fetches match statistics for a user
 */
import { useQuery } from '@tanstack/react-query';

export interface MatchStatistics {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  totalSets: number;
  setsWon: number;
  totalPoints: number;
  pointsWon: number;
  avgPointsPerMatch: number;
  longestWinStreak: number;
  currentStreak: number;
  // Recent matches
  recentMatches: Array<{
    id: number;
    date: string;
    opponent: string;
    result: 'win' | 'loss';
    score: string;
    format: 'singles' | 'doubles' | 'mixed';
  }>;
}

export interface MatchStatisticsOptions {
  userId?: number;
  timeRange?: 'all' | '30days' | '90days' | '6months' | '1year';
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
  formatType?: 'singles' | 'doubles' | 'mixed';
  enabled?: boolean;
}

/**
 * Hook to fetch match statistics
 */
export function useMatchStatistics(options: MatchStatisticsOptions = {}) {
  const {
    userId,
    timeRange = 'all',
    matchType,
    formatType,
    enabled = true
  } = options;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId.toString());
  if (timeRange) queryParams.append('timeRange', timeRange);
  if (matchType) queryParams.append('matchType', matchType);
  if (formatType) queryParams.append('formatType', formatType);

  // Construct query key with all parameters for proper caching
  const queryKeyParts: any[] = ['/api/match/stats'];
  if (userId) queryKeyParts.push({ userId });
  if (timeRange) queryKeyParts.push({ timeRange });
  if (matchType) queryKeyParts.push({ matchType });
  if (formatType) queryKeyParts.push({ formatType });

  return useQuery<MatchStatistics>({
    queryKey: queryKeyParts,
    queryFn: async () => {
      const res = await fetch(`/api/match/stats${queryParams.toString() ? `?${queryParams}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch match statistics');
      }
      return res.json();
    },
    enabled
  });
}