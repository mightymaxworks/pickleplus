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
  
  // Request demo data when in development mode
  if (import.meta.env.DEV) {
    queryParams.append('includeDemoData', 'true');
  }

  return useQuery<CourtIQPerformanceData>({
    queryKey: ['/api/courtiq/performance', { userId, format, division }],
    queryFn: async () => {
      // If the direct endpoint isn't available yet, we'll use the rating data
      // and multi-dimensional ranking data to construct a compatible response
      
      // First try the direct endpoint
      try {
        const res = await fetch(`/api/courtiq/performance?${queryParams}`);
        if (res.ok) {
          return res.json();
        }
      } catch (error) {
        console.log('Direct CourtIQ performance endpoint not available, using fallback');
      }
      
      // Fallback to using the rating and multi-dimensional data
      // Fetch rating data
      const ratingRes = await fetch(`/api/user/rating-detail?userId=${userId}&format=${format}&division=${division}`);
      if (!ratingRes.ok) {
        throw new Error('Failed to fetch CourtIQ performance data');
      }
      
      const ratingData = await ratingRes.json();
      
      // Fetch tier data
      const tiersRes = await fetch('/api/courtiq/tiers');
      const tiers = await tiersRes.json();
      
      // Find current tier
      const currentTier = tiers.find(
        (tier: any) => 
          ratingData.rating >= tier.minRating && 
          ratingData.rating <= tier.maxRating
      ) || {
        name: "Unranked",
        colorCode: "#9E9E9E",
      };
      
      // Find next tier
      const nextTierIndex = tiers.findIndex(
        (tier: any) => tier.id === currentTier.id
      ) - 1;
      
      const nextTier = nextTierIndex >= 0 ? tiers[nextTierIndex] : undefined;
      
      // PKL-278651-STATS-0002-DATA: Use real skill data when available
      const skills: CourtIQSkillRating = ratingData.skillBreakdown || ratingData.skills || {
        // Default to real user data from the API when available
        power: ratingData.power || 65,
        speed: ratingData.speed || 70,
        precision: ratingData.precision || 75,
        strategy: ratingData.strategy || 60,
        control: ratingData.control || 80,
        consistency: ratingData.consistency || 68
      };
      
      // Find strongest and weakest areas
      const skillEntries = Object.entries(skills) as [keyof CourtIQSkillRating, number][];
      const sortedSkills = [...skillEntries].sort((a, b) => b[1] - a[1]);
      
      const strongestArea = sortedSkills[0][0];
      const weakestArea = sortedSkills[sortedSkills.length - 1][0];
      
      // Create the response object
      return {
        overallRating: ratingData.rating,
        tierName: currentTier.name,
        tierColorCode: currentTier.colorCode,
        skills,
        // Add dimensions in the new format for compatibility with UI changes
        dimensions: {
          technique: { score: Math.round(skills.precision / 10) },
          strategy: { score: Math.round(skills.strategy / 10) },
          consistency: { score: Math.round(skills.consistency / 10) },
          focus: { score: Math.round(skills.control / 10) },
          power: { score: Math.round(skills.power / 10) },
          speed: { score: Math.round(skills.speed / 10) }
        },
        recentTrends: ratingData.recentTrends || {
          change: ratingData.recentChange || 0,
          direction: ratingData.recentChange > 0 ? 'up' : ratingData.recentChange < 0 ? 'down' : 'stable',
          matches: ratingData.recentMatches || 0
        },
        strongestArea,
        weakestArea,
        percentile: ratingData.percentile || 50,
        nextTier: nextTier ? {
          name: nextTier.name,
          pointsNeeded: nextTier.minRating - ratingData.rating,
          colorCode: nextTier.colorCode
        } : undefined
      };
    },
    enabled: enabled && !!userId
  });
}