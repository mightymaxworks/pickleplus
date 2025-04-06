/**
 * Rating Data Hook
 * 
 * Custom hooks for accessing user rating data from the CourtIQ™ system.
 */

import { useQuery } from "@tanstack/react-query";

// Types
export interface RatingTier {
  id: number;
  name: string;
  order: number;
  description: string | null;
  minRating: number;
  maxRating: number;
  badgeUrl: string | null;
  colorCode: string | null;
  protectionLevel: number;
}

export interface RatingData {
  id: number;
  userId: number;
  format: string;
  rating: number;
  tier: string;
  confidenceLevel: number;
  matchesPlayed: number;
  lastMatchDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  peakRating: number | null;
  allTimeHighRating: number | null;
  currentSeasonHighRating: number | null;
  currentSeasonLowRating: number | null;
}

export interface RatingWithHistory extends RatingData {
  history: {
    date: string;
    rating: number;
    change: number;
    matchId?: number;
  }[];
}

/**
 * Hook to fetch all ratings for the current user
 */
export function useRatingData() {
  return useQuery<RatingData[]>({
    queryKey: ['/api/user/ratings'],
    retry: false,
  });
}

/**
 * Hook to fetch detailed rating info with history for a specific format
 */
export function useRatingDetail(format: string) {
  return useQuery<RatingWithHistory>({
    queryKey: ['/api/user/rating-detail', format],
    queryFn: async () => {
      const response = await fetch(`/api/user/rating-detail?format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rating detail');
      }
      return response.json();
    },
    enabled: !!format,
    retry: false,
  });
}

/**
 * Hook to fetch all available rating tiers
 */
export function useRatingTiers() {
  return useQuery<RatingTier[]>({
    queryKey: ['/api/courtiq/tiers'],
    retry: false,
  });
}