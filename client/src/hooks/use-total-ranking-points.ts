/**
 * Hook for fetching total ranking points across all categories
 * This provides the aggregated ranking points that users see on their dashboard
 */
import { useQuery } from "@tanstack/react-query";

interface CategoryRankingPoints {
  format: string;
  division: string;
  rankingPoints: number;
  breakdown: {
    tournamentPoints: number;
    matchPoints: number;
    total: number;
  };
  pointHistory: Array<{
    type: string;
    event: string;
    points: number;
  }>;
  milestone: {
    current: number;
    next: number;
    needed: number;
    description: string;
  };
}

interface TotalRankingPointsResponse {
  userId: number;
  rankingPoints: number; // The API returns this at root level
  totalRankingPoints?: number; // Calculated value
  allCategories: CategoryRankingPoints[];
  totalCategories: number;
  system: string;
  userAge: number;
  tiers?: Array<{
    id: number;
    name: string;
    minRating: number;
    maxRating?: number;
    colorCode: string;
  }>;
}

/**
 * Fetch total ranking points across all categories for a user
 */
export function useTotalRankingPoints(userId?: number) {
  return useQuery<TotalRankingPointsResponse>({
    queryKey: ['/api/pcp-ranking', userId, Date.now()], // Force fresh data
    enabled: !!userId,
    staleTime: 0, // No caching for now
    gcTime: 0, // No background cache (TanStack Query v5)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    select: (data) => {
      // Use the pre-calculated total from API
      return {
        ...data,
        totalRankingPoints: data.rankingPoints
      };
    }
  });
}