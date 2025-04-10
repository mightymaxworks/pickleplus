/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Context
 * 
 * This context provides state management and API access for the gamification module.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as gamificationAPI from '../api/gamificationAPI';
import {
  Campaign,
  CampaignProgress,
  DiscoveryPoint,
  UserDiscovery,
  Reward,
  DiscoveryEvent,
  DiscoveryContext
} from '../api/types';

// Define the gamification state
interface GamificationState {
  // User's discoveries
  userDiscoveries: Record<string, {
    discovered: boolean;
    discoveredAt: string;
    rewardClaimed: boolean;
  }>;
  
  // Active campaigns
  campaigns: Campaign[];
  
  // Campaign progress
  campaignProgress: Record<number, CampaignProgress>;
  
  // User's rewards
  rewards: Reward[];
  
  // Discovery events
  events: DiscoveryEvent[];
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: string | null;
}

// Define the gamification context
interface GamificationContextValue {
  // Current state
  state: GamificationState;
  
  // API actions
  triggerDiscovery: (code: string, context?: Record<string, any>) => Promise<boolean>;
  checkDiscovery: (code: string) => boolean;
  claimReward: (rewardId: number) => Promise<boolean>;
  
  // Helper functions
  getActiveCampaignIds: () => number[];
  getCampaignProgress: (campaignId: number) => {
    completionPercentage: number;
    discoveredCount: number;
    totalDiscoveries: number;
    isComplete: boolean;
    totalPoints: number;
  } | null;
  
  // Reset state (for testing)
  resetState: () => void;
}

// Initial state
const initialState: GamificationState = {
  userDiscoveries: {},
  campaigns: [],
  campaignProgress: {},
  rewards: [],
  events: [],
  isLoading: false,
  error: null
};

// Create the context
const GamificationContext = createContext<GamificationContextValue | null>(null);

// Custom hook to use the gamification context
function useGamification(): GamificationContextValue {
  const context = useContext(GamificationContext);
  
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  
  return context;
}

// Gamification provider component
interface GamificationProviderProps {
  children: React.ReactNode;
  initialData?: Partial<GamificationState>;
  simulationMode?: boolean;
}

function GamificationProvider({
  children,
  initialData,
  simulationMode = false
}: GamificationProviderProps): JSX.Element {
  // State
  const [state, setState] = useState<GamificationState>({
    ...initialState,
    ...initialData
  });
  
  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      if (simulationMode) {
        // In simulation mode, just set some dummy data
        setState(prev => ({
          ...prev,
          campaigns: [
            {
              id: 1,
              name: 'Platform Discovery',
              description: 'Discover hidden features and learn about the platform',
              isActive: true,
              startDate: new Date().toISOString(),
              config: {
                theme: 'discovery',
                showInList: true
              }
            }
          ],
          campaignProgress: {
            1: {
              campaignId: 1,
              discoveries: 0,
              totalPoints: 0,
              progress: {
                percentage: 0,
                milestones: {},
                lastActivity: new Date().toISOString()
              }
            }
          }
        }));
        return;
      }
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Load campaigns
        const campaigns = await gamificationAPI.getCampaigns();
        
        // Load user discoveries
        const userDiscoveriesResponse = await gamificationAPI.getUserDiscoveries();
        
        // Format user discoveries
        const userDiscoveries: Record<string, {
          discovered: boolean;
          discoveredAt: string;
          rewardClaimed: boolean;
        }> = {};
        
        // Process user discoveries
        userDiscoveriesResponse.discoveries.forEach(discovery => {
          const discoveryDetails = discovery.discoveryDetails;
          if (discoveryDetails) {
            userDiscoveries[discoveryDetails.code] = {
              discovered: true,
              discoveredAt: discovery.discoveredAt,
              rewardClaimed: discovery.rewardClaimed
            };
          }
        });
        
        // Process campaign progress
        const campaignProgress: Record<number, CampaignProgress> = {};
        userDiscoveriesResponse.campaigns.forEach(campaign => {
          campaignProgress[campaign.campaignId] = {
            campaignId: campaign.campaignId,
            discoveries: campaign.discoveries,
            totalPoints: campaign.totalPoints,
            progress: campaign.progress || {
              percentage: 0,
              milestones: {},
              lastActivity: new Date().toISOString()
            }
          };
        });
        
        // Load rewards
        const rewards = await gamificationAPI.getUserRewards();
        
        // Update state
        setState(prev => ({
          ...prev,
          campaigns,
          userDiscoveries,
          campaignProgress,
          rewards,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error loading gamification data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error loading gamification data. Please try again later.'
        }));
      }
    }
    
    loadInitialData();
  }, [simulationMode]);
  
  // Check if a discovery has been found
  const checkDiscovery = useCallback((code: string) => {
    return !!state.userDiscoveries[code]?.discovered;
  }, [state.userDiscoveries]);
  
  // Trigger a discovery
  const triggerDiscovery = useCallback(async (
    code: string,
    context?: Record<string, any>
  ): Promise<boolean> => {
    // Check if the discovery has already been found
    if (checkDiscovery(code)) {
      return false;
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Trigger the discovery
      let result;
      
      if (simulationMode) {
        result = await gamificationAPI.simulateDiscovery(code, context);
      } else {
        result = await gamificationAPI.recordDiscovery(code, context);
      }
      
      if (!result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to trigger discovery. Code may be invalid.'
        }));
        return false;
      }
      
      // Update state with new discovery
      setState(prev => {
        // Update user discoveries
        const userDiscoveries = {
          ...prev.userDiscoveries,
          [code]: {
            discovered: true,
            discoveredAt: new Date().toISOString(),
            rewardClaimed: false
          }
        };
        
        // Update campaign progress
        let campaignProgress = { ...prev.campaignProgress };
        if (result.discovery) {
          const campaignId = result.discovery.campaignId;
          const campaign = campaignProgress[campaignId] || {
            campaignId,
            discoveries: 0,
            totalPoints: 0,
            progress: {
              percentage: 0,
              milestones: {},
              lastActivity: new Date().toISOString()
            }
          };
          
          campaignProgress[campaignId] = {
            ...campaign,
            discoveries: campaign.discoveries + 1,
            totalPoints: campaign.totalPoints + (result.discovery.pointValue || 0)
          };
        }
        
        // Update rewards if needed
        let rewards = [...prev.rewards];
        if (result.reward) {
          rewards = [result.reward, ...rewards];
        }
        
        // Add to events log
        const events = [...prev.events, {
          code,
          timestamp: new Date().toISOString(),
          context: context || {},
          discoveryId: result.discovery?.id || 0
        }];
        
        return {
          ...prev,
          userDiscoveries,
          campaignProgress,
          rewards,
          events,
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error triggering discovery:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error triggering discovery. Please try again later.'
      }));
      return false;
    }
  }, [checkDiscovery, simulationMode]);
  
  // Claim a reward
  const claimReward = useCallback(async (rewardId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Claim the reward
      const result = await gamificationAPI.claimReward(rewardId);
      
      if (!result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Failed to claim reward'
        }));
        return false;
      }
      
      // Update reward status
      setState(prev => {
        // Update the rewards list
        const rewards = prev.rewards.map(reward => {
          if (reward.id === rewardId) {
            return {
              ...reward,
              claimed: true,
              claimedAt: new Date().toISOString()
            };
          }
          return reward;
        });
        
        // Handle discovery reward claims
        const userDiscoveries = { ...prev.userDiscoveries };
        
        // Find the discovery associated with this reward (simplistic approach)
        // In a real app, we'd have a proper mapping
        Object.keys(userDiscoveries).forEach(code => {
          if (userDiscoveries[code].discovered && !userDiscoveries[code].rewardClaimed) {
            userDiscoveries[code] = {
              ...userDiscoveries[code],
              rewardClaimed: true
            };
          }
        });
        
        return {
          ...prev,
          rewards,
          userDiscoveries,
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error claiming reward. Please try again later.'
      }));
      return false;
    }
  }, []);
  
  // Get active campaign IDs
  const getActiveCampaignIds = useCallback(() => {
    return state.campaigns
      .filter(campaign => campaign.isActive)
      .map(campaign => campaign.id);
  }, [state.campaigns]);
  
  // Get campaign progress
  const getCampaignProgress = useCallback((campaignId: number) => {
    if (!state.campaignProgress[campaignId]) {
      return null;
    }
    
    // Get total discoveries for this campaign
    // In a real app, we'd fetch this from the API or have it in state already
    const totalDiscoveries = 10; // Placeholder
    
    const progress = state.campaignProgress[campaignId];
    const completionPercentage = Math.min(
      100,
      Math.round((progress.discoveries / totalDiscoveries) * 100)
    );
    
    return {
      completionPercentage,
      discoveredCount: progress.discoveries,
      totalDiscoveries,
      isComplete: completionPercentage >= 100,
      totalPoints: progress.totalPoints
    };
  }, [state.campaignProgress]);
  
  // Reset state (for testing)
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);
  
  // Context value
  const value: GamificationContextValue = {
    state,
    triggerDiscovery,
    checkDiscovery,
    claimReward,
    getActiveCampaignIds,
    getCampaignProgress,
    resetState
  };
  
  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export { GamificationContext, GamificationProvider, useGamification };