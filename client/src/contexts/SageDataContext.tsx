/**
 * PKL-278651-SAGE-0029-API - SAGE Data Context
 * 
 * This context provider makes SAGE data available throughout the application
 * for integration with dashboard components and the SAGE chat interface.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useSageUserProfile, 
  useCourtIQDetails, 
  useSubscriptionStatus,
  useDrillRecommendations,
  useMatchHistory,
  UserProfileResponse,
  CourtIQDetailsResponse,
  SubscriptionStatusResponse,
  DrillRecommendationsResponse,
  MatchHistoryResponse
} from '@/hooks/useSageData';
import { DimensionCode } from '@shared/schema/courtiq';

// Context state interface
interface SageDataContextState {
  // Profile data
  profile: UserProfileResponse | undefined;
  isProfileLoading: boolean;
  profileError: Error | null;
  
  // CourtIQ data
  courtIQ: CourtIQDetailsResponse | undefined;
  isCourtIQLoading: boolean;
  courtIQError: Error | null;

  // Subscription data
  subscription: SubscriptionStatusResponse | undefined;
  isSubscriptionLoading: boolean;
  subscriptionError: Error | null;
  
  // Drill recommendations
  drillRecommendations: DrillRecommendationsResponse | undefined;
  isDrillsLoading: boolean;
  drillsError: Error | null;
  
  // Match history
  matchHistory: MatchHistoryResponse[] | undefined;
  isMatchHistoryLoading: boolean;
  matchHistoryError: Error | null;
  
  // Is any data loading?
  isLoading: boolean;
  
  // Helpers
  getStrongestDimension: () => DimensionCode | undefined;
  getWeakestDimension: () => DimensionCode | undefined;
  isPremiumUser: () => boolean;
  getRatingForDimension: (dimension: DimensionCode) => number | undefined;
}

const SageDataContext = createContext<SageDataContextState | undefined>(undefined);

export function SageDataProvider({ children }: { children: ReactNode }) {
  // Load all required data
  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useSageUserProfile();
  
  const { 
    data: courtIQ, 
    isLoading: isCourtIQLoading, 
    error: courtIQError 
  } = useCourtIQDetails();
  
  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading, 
    error: subscriptionError 
  } = useSubscriptionStatus();
  
  const { 
    data: drillRecommendations, 
    isLoading: isDrillsLoading, 
    error: drillsError 
  } = useDrillRecommendations();
  
  const { 
    data: matchHistory, 
    isLoading: isMatchHistoryLoading, 
    error: matchHistoryError 
  } = useMatchHistory(5); // Fetch last 5 matches by default
  
  // Helper functions
  const getStrongestDimension = (): DimensionCode | undefined => {
    return courtIQ?.strongestDimension;
  };
  
  const getWeakestDimension = (): DimensionCode | undefined => {
    return courtIQ?.weakestDimension;
  };
  
  const isPremiumUser = (): boolean => {
    return subscription?.isPremium || false;
  };
  
  const getRatingForDimension = (dimension: DimensionCode): number | undefined => {
    return courtIQ?.ratings[dimension];
  };
  
  // Determine if any data is loading
  const isLoading = 
    isProfileLoading || 
    isCourtIQLoading || 
    isSubscriptionLoading || 
    isDrillsLoading || 
    isMatchHistoryLoading;
  
  // Create context value
  const contextValue: SageDataContextState = {
    profile,
    isProfileLoading,
    profileError,
    
    courtIQ,
    isCourtIQLoading,
    courtIQError,
    
    subscription,
    isSubscriptionLoading,
    subscriptionError,
    
    drillRecommendations,
    isDrillsLoading,
    drillsError,
    
    matchHistory,
    isMatchHistoryLoading,
    matchHistoryError,
    
    isLoading,
    
    getStrongestDimension,
    getWeakestDimension,
    isPremiumUser,
    getRatingForDimension
  };
  
  return (
    <SageDataContext.Provider value={contextValue}>
      {children}
    </SageDataContext.Provider>
  );
}

// Custom hook for accessing the context
export function useSageData() {
  const context = useContext(SageDataContext);
  
  if (context === undefined) {
    throw new Error('useSageData must be used within a SageDataProvider');
  }
  
  return context;
}

// Re-export types from the hook file
export type {
  UserProfileResponse,
  CourtIQDetailsResponse,
  SubscriptionStatusResponse,
  DrillRecommendationsResponse,
  MatchHistoryResponse
};