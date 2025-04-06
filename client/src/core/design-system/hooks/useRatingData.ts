/**
 * useRatingData Hook
 * 
 * Custom hook for fetching and managing player rating data from the CourtIQ™ Rating System.
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface RatingData {
  id: number;
  userId: number;
  rating: number;
  format: string;
  tier: string;
  confidenceLevel: number;
  matchesPlayed: number;
  lastMatchDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RatingTier {
  id: number;
  order: number;
  name: string;
  description: string | null;
  minRating: number;
  maxRating: number;
  badgeUrl: string | null;
  colorCode: string | null;
  protectionLevel: number;
}

export interface RatingWithHistory extends Omit<RatingData, 'tier'> {
  history: {
    id: number;
    userId: number;
    ratingId: number;
    previousRating: number;
    newRating: number;
    matchId: number;
    ratingChange: number;
    format: string;
    opponentRating: number;
    createdAt: string;
  }[];
  tier: RatingTier;
}

/**
 * Fetches a player's rating data for a specific format
 */
export function useRatingData(userId: number, format?: string) {
  return useQuery({
    queryKey: ['user-rating', userId, format],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId.toString());
      if (format) params.append('format', format);
      
      const response = await apiRequest(
        'GET', 
        `/api/user/ratings?${params.toString()}`
      );
      const data = await response.json();
      return data as RatingData[];
    },
    enabled: !!userId,
  });
}

/**
 * Fetches detailed rating data including history
 */
export function useRatingDetail(userId: number, format?: string) {
  return useQuery({
    queryKey: ['user-rating-detail', userId, format],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId.toString());
      if (format) params.append('format', format);
      
      const response = await apiRequest(
        'GET', 
        `/api/user/rating-detail?${params.toString()}`
      );
      const data = await response.json();
      return data as RatingWithHistory;
    },
    enabled: !!userId,
  });
}

/**
 * Fetches all rating tiers
 */
export function useRatingTiers() {
  return useQuery({
    queryKey: ['rating-tiers'],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        '/api/courtiq/tiers'
      );
      const data = await response.json();
      return data as RatingTier[];
    },
  });
}