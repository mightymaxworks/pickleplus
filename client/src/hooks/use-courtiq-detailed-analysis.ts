import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export type CourtIQDimension = {
  score: number;
  history?: {
    date: string;
    value: number;
  }[];
};

export type CourtIQSourceRating = {
  technique: number;
  strategy: number;
  consistency: number;
  focus: number;
  power: number;
  speed: number;
};

export type CourtIQDetailedAnalysis = {
  userId: number;
  overallRating: number;
  tierName: string;
  tierColorCode: string;
  dimensions: {
    technique: CourtIQDimension;
    strategy: CourtIQDimension;
    consistency: CourtIQDimension;
    focus: CourtIQDimension;
    power: CourtIQDimension;
    speed: CourtIQDimension;
  };
  skills: {
    power: number;
    speed: number;
    precision: number;
    strategy: number;
    control: number;
    consistency: number;
  };
  recentTrends: {
    change: number;
    direction: 'up' | 'down' | 'stable';
    matches: number;
  };
  strongestArea: string;
  weakestArea: string;
  percentile: number;
  nextTier?: {
    name: string;
    pointsNeeded: number;
    colorCode: string;
  };
  sourceRatings?: {
    self?: CourtIQSourceRating;
    opponent?: CourtIQSourceRating;
    coach?: CourtIQSourceRating;
  };
};

export function useCourtIQDetailedAnalysis(userId?: number, format: string = 'singles', division: string = 'open') {
  // Build query key with segments to allow for proper cache invalidation
  const queryKey = ['/api/courtiq/performance', userId, format, division];
  
  return useQuery<CourtIQDetailedAnalysis, Error>({
    queryKey,
    queryFn: async () => {
      // Build URL with query parameters
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId.toString());
      params.append('format', format);
      params.append('division', division);
      params.append('includeSourceTypes', 'true');
      
      const url = `/api/courtiq/performance?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch CourtIQ data');
      }
      
      return response.json();
    },
    // Don't refetch on window focus for performance data
    refetchOnWindowFocus: false,
    // Keep the data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
}

// Hook to get historical performance data
export function useCourtIQHistoricalData(userId?: number) {
  return useQuery<any[], Error>({
    queryKey: ['/api/courtiq/history', userId],
    queryFn: async () => {
      // This would be a real API endpoint in the implementation
      // We'll return a reasonable fallback pattern in case the API fails
      
      const url = `/api/courtiq/history${userId ? `?userId=${userId}` : ''}`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        // If the endpoint doesn't exist yet, we'll fall back to the current data
        // and synthesize a history pattern in the component
        if (response.status === 404) {
          return [];
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch CourtIQ history');
      }
      
      return response.json();
    },
    // Don't refetch on window focus for performance data
    refetchOnWindowFocus: false,
    // Keep the data fresh for 10 minutes
    staleTime: 1000 * 60 * 10,
  });
}

// Helper function to get dimension name for display
export function getDimensionDisplayName(dimension: string): string {
  const displayNames: Record<string, string> = {
    technique: 'Technical Skills',
    strategy: 'Tactical Awareness',
    consistency: 'Consistency',
    focus: 'Mental Toughness',
    power: 'Power',
    speed: 'Speed',
  };
  
  return displayNames[dimension] || dimension;
}

// Helper function to get dimension descriptions
export function getDimensionDescription(dimension: string): string {
  const descriptions: Record<string, string> = {
    technique: 'Technical skills include shot execution, form, and mechanical abilities.',
    strategy: 'Tactical awareness reflects your ability to read the game, make decisions, and outsmart opponents.',
    consistency: 'Consistency measures your ability to execute shots reliably and maintain steady performance.',
    focus: 'Mental toughness shows your concentration, resilience, and ability to handle pressure.',
    power: 'Power rating indicates your ability to generate force in shots and serves.',
    speed: 'Speed reflects your court movement, reaction time, and overall agility.',
  };
  
  return descriptions[dimension] || '';
}

// Helper function to get improvement recommendations
export function getDimensionRecommendations(dimension: string): string[] {
  const recommendations: Record<string, string[]> = {
    technique: [
      'Focus on proper paddle grip and stance fundamentals',
      'Practice dinking with consistent, controlled touch',
      'Work on third-shot drops with proper form',
      'Add spin variety to your shots',
      'Develop a consistent, reliable serve technique'
    ],
    strategy: [
      'Study game footage to identify patterns',
      'Practice strategic shot selection in different scenarios',
      'Develop awareness of court positioning',
      'Work on setting up offensive opportunities',
      'Learn to identify and exploit opponent weaknesses'
    ],
    consistency: [
      'Focus on controlled rallies with partners',
      'Set up consistency drills with targets',
      'Practice maintaining the same technique under pressure',
      'Work on error reduction in your weakest shots',
      'Develop a pre-shot routine for important points'
    ],
    focus: [
      'Establish pre-match and between-point routines',
      'Practice visualization techniques',
      'Work on breathing exercises for high-pressure moments',
      'Develop positive self-talk strategies',
      'Practice maintaining focus during distractions'
    ],
    power: [
      'Incorporate weight training focused on core and legs',
      'Practice proper weight transfer in shots',
      'Work on generating power from proper technique, not just arm strength',
      'Develop explosive movement patterns',
      'Practice controlled power in game-like scenarios'
    ],
    speed: [
      'Add footwork ladder drills to your training',
      'Practice rapid direction changes on court',
      'Incorporate plyometrics for explosive movement',
      'Work on split-step timing at the kitchen line',
      'Focus on recovery positioning after each shot'
    ],
  };
  
  return recommendations[dimension] || [];
}