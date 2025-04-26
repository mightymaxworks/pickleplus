/**
 * PKL-278651-CALC-0002-CONTEXT - Frontend Derived Data Context
 * 
 * This context provides frontend-calculated data to components
 * and manages caching and data synchronization.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataCalculationService,
  UserStats,
  CalculatedUserMetrics,
  CourtIQMetrics
} from '@/services/DataCalculationService';

// Define context state interface
interface DerivedDataContextState {
  // Raw data
  userStats: UserStats | null;
  
  // Derived metrics
  calculatedMetrics: CalculatedUserMetrics | null;
  
  // Status
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshData: () => void;
  setUserStats: (stats: Partial<UserStats>) => void;
}

// Create context with default values
const DerivedDataContext = createContext<DerivedDataContextState | undefined>(undefined);

// Provider component props
interface DerivedDataProviderProps {
  children: ReactNode;
}

/**
 * Provider for derived data context
 * This component fetches raw data and calculates derived metrics
 */
export function DerivedDataProvider({ children }: DerivedDataProviderProps) {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch user data
  const {
    data: userData,
    isLoading: isUserDataLoading,
    error: userDataError,
    refetch: refetchUserData
  } = useQuery<any>({
    queryKey: ['/api/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch match data
  const {
    data: matchStats,
    isLoading: isMatchStatsLoading,
    error: matchStatsError,
    refetch: refetchMatchStats
  } = useQuery<any>({
    queryKey: ['/api/match/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch CourtIQ data
  const {
    data: courtIQData,
    isLoading: isCourtIQLoading,
    error: courtIQError,
    refetch: refetchCourtIQ
  } = useQuery<any>({
    queryKey: ['/api/courtiq/performance'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Combine raw data
  const [userStats, setUserStatsState] = useState<UserStats | null>(null);
  
  // Update raw data when queries complete
  useEffect(() => {
    if (!isUserDataLoading && !isMatchStatsLoading && userData) {
      // Define courtIQMetrics if courtIQ data exists
      const courtIQMetrics: CourtIQMetrics | undefined = courtIQData && courtIQData.skills ? {
        technical: courtIQData.skills.technical || 0,
        tactical: courtIQData.skills.tactical || 0,
        physical: courtIQData.skills.physical || 0,
        mental: courtIQData.skills.mental || 0,
        consistency: courtIQData.skills.consistency || 0
      } : undefined;
      
      // Create user stats object from available data
      setUserStatsState({
        xp: userData.xp || 0,
        totalMatches: matchStats?.totalMatches || userData.totalMatches || 0,
        matchesWon: matchStats?.matchesWon || userData.matchesWon || 0,
        matchesLost: matchStats?.matchesLost || userData.matchesLost || 0,
        recentMatches: matchStats?.recentMatches || [],
        courtIQMetrics
      });
      
      setLastUpdated(new Date());
    }
  }, [userData, matchStats, courtIQData, isUserDataLoading, isMatchStatsLoading, isCourtIQLoading]);
  
  // Function to update user stats
  const setUserStats = (stats: Partial<UserStats>) => {
    setUserStatsState(prev => {
      if (!prev) return stats as UserStats;
      return { ...prev, ...stats };
    });
    setLastUpdated(new Date());
  };
  
  // Calculate derived metrics
  const calculatedMetrics = useMemo(() => {
    if (!userStats) return null;
    return DataCalculationService.calculateAllMetrics(userStats);
  }, [userStats]);
  
  // Refresh all data
  const refreshData = () => {
    refetchUserData();
    refetchMatchStats();
    refetchCourtIQ();
  };
  
  // Combine errors and loading states
  const isLoading = isUserDataLoading || isMatchStatsLoading;
  const error = userDataError || matchStatsError || courtIQError;
  
  // Build context value
  const contextValue: DerivedDataContextState = {
    userStats,
    calculatedMetrics,
    isLoading,
    error: error as Error | null,
    lastUpdated,
    refreshData,
    setUserStats
  };
  
  return (
    <DerivedDataContext.Provider value={contextValue}>
      {children}
    </DerivedDataContext.Provider>
  );
}

/**
 * Hook to use the derived data context
 * @returns Context state and actions
 */
export function useDerivedData() {
  const context = useContext(DerivedDataContext);
  
  if (context === undefined) {
    throw new Error('useDerivedData must be used within a DerivedDataProvider');
  }
  
  return context;
}

/**
 * Hook to get only the calculated metrics
 * @returns Calculated metrics object
 */
export function useCalculatedMetrics() {
  const { calculatedMetrics, isLoading, error } = useDerivedData();
  
  return { 
    metrics: calculatedMetrics,
    isLoading,
    error
  };
}

/**
 * Hook for accessing specific derived values
 * @param metricKey Key of the metric to extract
 * @returns Specific metric value
 */
export function useDerivedMetric<K extends keyof CalculatedUserMetrics>(metricKey: K) {
  const { calculatedMetrics, isLoading, error } = useDerivedData();
  
  const value = calculatedMetrics ? calculatedMetrics[metricKey] : undefined;
  
  return {
    value,
    isLoading,
    error
  };
}