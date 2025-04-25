/**
 * PKL-278651-SAGE-0029-API - SAGE Data Hook
 * 
 * This hook provides access to the SAGE API data for integration with
 * the dashboard and other components.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DimensionCode } from '@shared/schema/courtiq';

// Types for SAGE API responses
export interface UserProfileResponse {
  id: number;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  avatarUrl: string;
  passportId: string;
  duprRating: string | number;
  location: string;
  createdAt: string;
  courtIQRatings: Record<DimensionCode, number>;
  profileCompletion: number;
  isAdmin: boolean;
  roles: string[];
  preferredPlayStyle: string | null;
  focusAreas: string[];
}

export interface CourtIQDetailsResponse {
  ratings: Record<DimensionCode, number>;
  strongestDimension: DimensionCode;
  weakestDimension: DimensionCode;
  detailedAttributes?: Record<string, any>;
}

export interface SubscriptionStatusResponse {
  tier: 'FREE' | 'BASIC' | 'POWER';
  isPremium: boolean;
  expiresAt: string | null;
  features: {
    unlimitedDrills: boolean;
    personalizedPlans: boolean;
    videoAnalysis: boolean;
    coachingAccess: boolean;
  };
}

export interface DrillRecommendationsResponse {
  drills: Array<{
    id: number;
    name: string;
    description: string;
    difficultyLevel: number;
    dimension: DimensionCode;
    videoUrl?: string;
  }>;
  subscriptionTier: 'FREE' | 'BASIC' | 'POWER';
  isPremium: boolean;
  dimension: DimensionCode;
  level: number;
}

export interface MatchHistoryResponse {
  id: number;
  userId: number;
  opponentId: number;
  date: string;
  score: string;
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  location: string;
  notes?: string;
  statistics?: any;
  performanceImpacts?: Record<DimensionCode, number>;
}

/**
 * React hook for accessing SAGE user profile data
 */
export function useSageUserProfile() {
  const { toast } = useToast();
  
  return useQuery<{ success: boolean; data: UserProfileResponse }, Error, UserProfileResponse>({
    queryKey: ['/api/sage/user-profile'],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiRequest('GET', '/api/sage/user-profile', undefined, signal);
        return await response.json();
      } catch (error) {
        console.error('Error fetching SAGE user profile:', error);
        toast({
          title: 'Error fetching profile',
          description: 'Could not load your SAGE profile data',
          variant: 'destructive',
        });
        throw error;
      }
    },
    select: (data) => data.data,
  });
}

/**
 * React hook for accessing CourtIQ details
 */
export function useCourtIQDetails() {
  const { toast } = useToast();
  
  return useQuery<{ success: boolean; data: CourtIQDetailsResponse }, Error, CourtIQDetailsResponse>({
    queryKey: ['/api/sage/courtiq-details'],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiRequest('GET', '/api/sage/courtiq-details', undefined, signal);
        return await response.json();
      } catch (error) {
        console.error('Error fetching CourtIQ details:', error);
        toast({
          title: 'Error fetching CourtIQ data',
          description: 'Could not load your CourtIQ ratings',
          variant: 'destructive',
        });
        throw error;
      }
    },
    select: (data) => data.data,
  });
}

/**
 * React hook for accessing subscription status
 */
export function useSubscriptionStatus() {
  const { toast } = useToast();
  
  return useQuery<{ success: boolean; data: SubscriptionStatusResponse }, Error, SubscriptionStatusResponse>({
    queryKey: ['/api/sage/subscription-status'],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiRequest('GET', '/api/sage/subscription-status', undefined, signal);
        return await response.json();
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        toast({
          title: 'Error fetching subscription',
          description: 'Could not load your subscription information',
          variant: 'destructive',
        });
        throw error;
      }
    },
    select: (data) => data.data,
  });
}

/**
 * React hook for accessing drill recommendations
 * @param dimension Optional dimension to focus on
 * @param count Number of drills to request
 */
export function useDrillRecommendations(dimension?: DimensionCode, count?: number) {
  const { toast } = useToast();
  
  let queryParams = '';
  if (dimension) {
    queryParams += `dimension=${dimension}`;
  }
  if (count) {
    queryParams += queryParams ? `&count=${count}` : `count=${count}`;
  }
  
  const endpoint = `/api/sage/drill-recommendations${queryParams ? `?${queryParams}` : ''}`;
  
  return useQuery<{ success: boolean; data: DrillRecommendationsResponse }, Error, DrillRecommendationsResponse>({
    queryKey: ['/api/sage/drill-recommendations', { dimension, count }],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiRequest('GET', endpoint, undefined, signal);
        return await response.json();
      } catch (error) {
        console.error('Error fetching drill recommendations:', error);
        toast({
          title: 'Error fetching drills',
          description: 'Could not load drill recommendations',
          variant: 'destructive',
        });
        throw error;
      }
    },
    select: (data) => data.data,
  });
}

/**
 * React hook for accessing match history
 * @param limit Number of matches to fetch
 */
export function useMatchHistory(limit?: number) {
  const { toast } = useToast();
  
  const endpoint = `/api/sage/match-history${limit ? `?limit=${limit}` : ''}`;
  
  return useQuery<{ success: boolean; data: MatchHistoryResponse[] }, Error, MatchHistoryResponse[]>({
    queryKey: ['/api/sage/match-history', { limit }],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiRequest('GET', endpoint, undefined, signal);
        return await response.json();
      } catch (error) {
        console.error('Error fetching match history:', error);
        toast({
          title: 'Error fetching matches',
          description: 'Could not load your match history',
          variant: 'destructive',
        });
        throw error;
      }
    },
    select: (data) => data.data,
  });
}