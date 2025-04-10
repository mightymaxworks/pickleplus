/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Discovery Context
 * 
 * This context provides state management for the tournament discovery feature.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DiscoveryPoint, UserDiscoveryProgress, getDiscoveryPoints, getUserDiscoveryProgress, recordDiscovery } from '../api/tournamentDiscoveryApi';
import { useToast } from '@hooks/use-toast';

interface TournamentDiscoveryContextType {
  // Data
  discoveryPoints: DiscoveryPoint[];
  userProgress: UserDiscoveryProgress | null;
  
  // Loading states
  isLoading: boolean;
  isRecording: boolean;
  
  // Actions
  discoverPoint: (pointId: string) => Promise<void>;
  refreshProgress: () => void;
  
  // Helper functions
  isDiscovered: (pointId: string) => boolean;
  getCurrentTier: () => 'none' | 'scout' | 'strategist' | 'pioneer';
  getCompletionPercentage: () => number;
  hasCompletedTier: (tier: 'scout' | 'strategist' | 'pioneer') => boolean;
}

const TournamentDiscoveryContext = createContext<TournamentDiscoveryContextType | null>(null);

export function TournamentDiscoveryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all discovery points
  const { 
    data: discoveryPoints = [],
    isLoading: isLoadingPoints
  } = useQuery({
    queryKey: ['/api/tournament-discovery/points'],
    queryFn: getDiscoveryPoints,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Get user's discovery progress
  const { 
    data: userProgress,
    isLoading: isLoadingProgress,
    refetch: refreshProgress
  } = useQuery({
    queryKey: ['/api/tournament-discovery/my-discoveries'],
    queryFn: getUserDiscoveryProgress,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Mutation for recording discoveries
  const { mutateAsync: mutateDiscovery, isPending: isRecording } = useMutation({
    mutationFn: recordDiscovery,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/tournament-discovery/my-discoveries'] });
      
      // Show reward toast if it's a new discovery
      if (data.isNew) {
        toast({
          title: "New Discovery!",
          description: `You discovered ${data.discovery.name} and earned ${data.reward?.amount || 0} XP!`,
          variant: "success",
          duration: 5000
        });
        
        // If completed all discoveries, show additional toast
        if (data.isComplete) {
          toast({
            title: "Tournament Explorer Complete!",
            description: "You've been entered into the prize drawing pool for early access to tournaments!",
            variant: "success",
            duration: 7000
          });
        }
      }
    },
    onError: (error) => {
      console.error("Failed to record discovery:", error);
      toast({
        title: "Discovery Failed",
        description: "Unable to record your discovery. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Helper function to check if a point is discovered
  const isDiscovered = useCallback((pointId: string) => {
    if (!userProgress) return false;
    return userProgress.discoveries.includes(pointId);
  }, [userProgress]);
  
  // Get current tier
  const getCurrentTier = useCallback(() => {
    return userProgress?.currentTier || 'none';
  }, [userProgress]);
  
  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    return userProgress?.completionPercentage || 0;
  }, [userProgress]);
  
  // Check if a tier is completed
  const hasCompletedTier = useCallback((tier: 'scout' | 'strategist' | 'pioneer') => {
    if (!userProgress) return false;
    
    // If current tier is higher than the requested tier, then requested tier is completed
    const tierOrder = ['none', 'scout', 'strategist', 'pioneer'];
    const currentTierIndex = tierOrder.indexOf(userProgress.currentTier);
    const requestedTierIndex = tierOrder.indexOf(tier);
    
    return currentTierIndex >= requestedTierIndex;
  }, [userProgress]);
  
  // Discover a point
  const discoverPoint = useCallback(async (pointId: string) => {
    if (isDiscovered(pointId)) {
      // If already discovered, just show a toast
      toast({
        title: "Already Discovered",
        description: "You've already found this tournament feature.",
      });
      return;
    }
    
    await mutateDiscovery(pointId);
  }, [isDiscovered, mutateDiscovery, toast]);
  
  const value = {
    discoveryPoints,
    userProgress: userProgress || null,
    isLoading: isLoadingPoints || isLoadingProgress,
    isRecording,
    discoverPoint,
    refreshProgress,
    isDiscovered,
    getCurrentTier,
    getCompletionPercentage,
    hasCompletedTier
  };
  
  return (
    <TournamentDiscoveryContext.Provider value={value}>
      {children}
    </TournamentDiscoveryContext.Provider>
  );
}

export function useTournamentDiscovery() {
  const context = useContext(TournamentDiscoveryContext);
  
  if (!context) {
    throw new Error('useTournamentDiscovery must be used within a TournamentDiscoveryProvider');
  }
  
  return context;
}