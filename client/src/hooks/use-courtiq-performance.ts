/**
 * PKL-278651-STATS-0002-RD: CourtIQ Performance Hook
 * This hook fetches CourtIQ performance data for a user
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface CourtIQSkillRating {
  power: number;
  speed: number;
  precision: number;
  strategy: number;
  control: number;
  consistency: number;
}

export interface CourtIQPerformanceData {
  // Overall rating
  overallRating: number;
  tierName: string;
  tierColorCode: string;
  
  // Dimensions breakdown (previously named as skills)
  dimensions?: {
    technique?: { score: number; };
    strategy?: { score: number; };
    consistency?: { score: number; };
    focus?: { score: number; };
    power?: { score: number; };
    speed?: { score: number; };
  };
  
  // Source-specific dimension ratings for multi-source visualization
  sourceRatings?: {
    self?: {
      technique?: number;
      strategy?: number;
      consistency?: number;
      focus?: number;
      power?: number;
      speed?: number;
    };
    opponent?: {
      technique?: number;
      strategy?: number;
      consistency?: number;
      focus?: number;
      power?: number;
      speed?: number;
    };
    coach?: {
      technique?: number;
      strategy?: number;
      consistency?: number;
      focus?: number;
      power?: number;
      speed?: number;
    };
  };
  
  // For backwards compatibility
  skills: CourtIQSkillRating;
  
  // Trends
  recentTrends: {
    change: number;
    direction: 'up' | 'down' | 'stable';
    matches: number;
  };
  
  // Areas
  strongestArea: keyof CourtIQSkillRating;
  weakestArea: keyof CourtIQSkillRating;
  
  // Percentiles
  percentile: number;
  
  // Next tier
  nextTier?: {
    name: string;
    pointsNeeded: number;
    colorCode: string;
  };
}

export interface CourtIQPerformanceOptions {
  userId?: number;
  format?: 'singles' | 'doubles' | 'mixed';
  division?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch CourtIQ performance data
 */
export function useCourtIQPerformance(options: CourtIQPerformanceOptions = {}) {
  const { user } = useAuth();
  const {
    userId = user?.id,
    format = 'singles',
    division = 'open',
    enabled = true
  } = options;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId.toString());
  if (format) queryParams.append('format', format);
  if (division) queryParams.append('division', division);
  
  // Always include source-specific ratings for visualization
  queryParams.append('includeSourceTypes', 'true');

  return useQuery<CourtIQPerformanceData>({
    queryKey: ['/api/courtiq/performance', { userId, format, division }],
    queryFn: async () => {
      // Directly fetch from the CourtIQ performance API
      const res = await fetch(`/api/courtiq/performance?${queryParams}`);
      if (!res.ok) {
        throw new Error('Failed to fetch CourtIQ performance data');
      }
      
      return res.json();
    },
    enabled: enabled && !!userId
  });
}