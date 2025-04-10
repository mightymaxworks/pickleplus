/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Context
 * 
 * This file provides the context for the gamification module.
 */

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  getActiveCampaigns, 
  getUserDiscoveries,
} from '../api/gamificationAPI';
import type { 
  GamificationState, 
  DiscoveryEvent,
  DiscoveryNotification,
  DiscoveryPoint,
  Reward,
  CampaignStatus
} from '../api/types';

// Define actions
type GamificationAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: Partial<GamificationState> }
  | { type: 'INITIALIZE_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_DISCOVERY'; payload: { code: string; status: { discovered: boolean; discoveredAt: string; rewardClaimed: boolean; rewardClaimedAt?: string } } }
  | { type: 'UPDATE_CAMPAIGN_PROGRESS'; payload: { campaignId: number; progress: CampaignStatus } }
  | { type: 'SHOW_NOTIFICATION'; payload: DiscoveryNotification }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'CLAIM_REWARD'; payload: { code: string, rewardId: number } };

// Define context interface
interface GamificationContextValue {
  state: GamificationState;
  triggerDiscovery: (code: string, context?: Record<string, any>) => Promise<boolean>;
  checkDiscovery: (code: string) => boolean;
  claimReward: (rewardId: number) => Promise<Reward | null>;
  showNotification: (notification: DiscoveryNotification) => void;
  hideNotification: () => void;
  getActiveCampaignIds: () => number[];
  getCampaignProgress: (campaignId: number) => CampaignStatus | null;
  resetState: () => void;
}

// Initial state
const initialState: GamificationState = {
  initialized: false,
  activeCampaigns: [],
  userDiscoveries: {},
  campaignProgress: {},
  currentNotification: null,
  isLoading: false,
  error: null
};

// Create context
export const GamificationContext = createContext<GamificationContextValue | null>(null);

// Reducer function
function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
  switch (action.type) {
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        ...action.payload,
        initialized: true,
        isLoading: false,
        error: null
      };
    case 'INITIALIZE_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'ADD_DISCOVERY':
      return {
        ...state,
        userDiscoveries: {
          ...state.userDiscoveries,
          [action.payload.code]: action.payload.status
        }
      };
    case 'UPDATE_CAMPAIGN_PROGRESS':
      return {
        ...state,
        campaignProgress: {
          ...state.campaignProgress,
          [action.payload.campaignId]: action.payload.progress
        }
      };
    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        currentNotification: action.payload
      };
    case 'HIDE_NOTIFICATION':
      return {
        ...state,
        currentNotification: null
      };
    case 'CLAIM_REWARD':
      return {
        ...state,
        userDiscoveries: {
          ...state.userDiscoveries,
          [action.payload.code]: {
            ...state.userDiscoveries[action.payload.code],
            rewardClaimed: true,
            rewardClaimedAt: new Date().toISOString()
          }
        }
      };
    default:
      return state;
  }
}

// Provider component
export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const [discoveryEvents, setDiscoveryEvents] = useState<DiscoveryEvent[]>([]);

  // Fetch active campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['/api/gamification/campaigns'],
    queryFn: getActiveCampaigns,
    enabled: !!user && !state.initialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user discoveries
  const { data: userDiscoveriesData } = useQuery({
    queryKey: ['/api/gamification/user/discoveries'],
    queryFn: getUserDiscoveries,
    enabled: !!user && !state.initialized,
    staleTime: 60 * 1000, // 1 minute
  });

  // Initialize state when data is loaded
  useEffect(() => {
    if (campaigns && userDiscoveriesData && !state.initialized) {
      // Process discoveries
      const userDiscoveries: Record<string, { discovered: boolean; discoveredAt: string; rewardClaimed: boolean; rewardClaimedAt?: string }> = {};
      const campaignProgress: Record<number, CampaignStatus> = {};
      
      // Process user discoveries
      userDiscoveriesData.discoveries.forEach(discovery => {
        userDiscoveries[discovery.discoveryDetails.code] = {
          discovered: true,
          discoveredAt: discovery.discoveredAt,
          rewardClaimed: discovery.rewardClaimed,
          rewardClaimedAt: discovery.rewardClaimedAt
        };
      });
      
      // Process campaign progress
      userDiscoveriesData.campaigns.forEach(campaign => {
        campaignProgress[campaign.campaignId] = {
          campaignId: campaign.campaignId,
          name: campaign.campaignDetails.name,
          totalDiscoveries: 0, // Will be calculated below
          discoveredCount: campaign.discoveries,
          completionPercentage: campaign.progress.percentage,
          isComplete: !!campaign.completedAt,
          completedAt: campaign.completedAt,
          totalPoints: campaign.totalPoints,
          progress: campaign.progress
        };
      });
      
      // Count total discoveries per campaign
      campaigns.forEach(campaign => {
        if (campaignProgress[campaign.id]) {
          // If we have progress for this campaign, update total discoveries
          // This is a placeholder since we don't have the actual count yet
          campaignProgress[campaign.id].totalDiscoveries = campaignProgress[campaign.id].discoveredCount * 2; // Just an estimate
        }
      });
      
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: {
          activeCampaigns: campaigns,
          userDiscoveries,
          campaignProgress
        }
      });
    }
  }, [campaigns, userDiscoveriesData, state.initialized]);

  // Process discovery events
  useEffect(() => {
    const processDiscoveryEvents = async () => {
      if (discoveryEvents.length > 0 && user) {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Process the first event
        const event = discoveryEvents[0];
        
        try {
          // In a real implementation, we would call the API:
          // const result = await recordDiscovery(event);
          // 
          // For now, we'll simulate success
          const simulatedResult = {
            success: true,
            isNew: true,
            discovery: {
              id: 123,
              code: event.code,
              name: `Discovery ${event.code}`,
              content: {
                title: `You found ${event.code}!`,
                message: "You've unlocked an easter egg!",
                imageUrl: ""
              }
            } as DiscoveryPoint,
            reward: null
          };
          
          if (simulatedResult.success) {
            // Add the discovery to state
            dispatch({
              type: 'ADD_DISCOVERY',
              payload: {
                code: event.code,
                status: {
                  discovered: true,
                  discoveredAt: event.timestamp,
                  rewardClaimed: false
                }
              }
            });
            
            // Show notification
            dispatch({
              type: 'SHOW_NOTIFICATION',
              payload: {
                title: simulatedResult.discovery.content.title,
                message: simulatedResult.discovery.content.message,
                level: 'success',
                imageUrl: simulatedResult.discovery.content.imageUrl,
                reward: simulatedResult.reward || undefined,
                autoHide: true,
                duration: 5000
              }
            });
            
            // TODO: Update campaign progress
          }
        } catch (error) {
          console.error('Error processing discovery event:', error);
        }
        
        // Remove the processed event
        setDiscoveryEvents(prevEvents => prevEvents.slice(1));
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    processDiscoveryEvents();
  }, [discoveryEvents, user]);
  
  // Functions to expose via context
  const triggerDiscovery = async (code: string, context?: Record<string, any>): Promise<boolean> => {
    if (!user) return false;
    
    // Check if already discovered
    if (state.userDiscoveries[code]?.discovered) {
      return false; // Already discovered
    }
    
    // Queue the discovery event
    setDiscoveryEvents(prev => [
      ...prev,
      {
        code,
        timestamp: new Date().toISOString(),
        context
      }
    ]);
    
    return true;
  };
  
  const checkDiscovery = (code: string): boolean => {
    return !!state.userDiscoveries[code]?.discovered;
  };
  
  const claimReward = async (rewardId: number): Promise<Reward | null> => {
    if (!user) return null;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // In a real implementation, we would call the API:
      // const result = await claimRewardApi(rewardId);
      //
      // For now, we'll simulate success
      // TODO: Implement actual API call
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    } catch (error) {
      console.error('Error claiming reward:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    }
  };
  
  const showNotification = (notification: DiscoveryNotification) => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: notification });
    
    // Auto-hide if specified
    if (notification.autoHide && notification.duration) {
      setTimeout(() => {
        hideNotification();
      }, notification.duration);
    }
  };
  
  const hideNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };
  
  const getActiveCampaignIds = () => {
    return state.activeCampaigns.map(campaign => campaign.id);
  };
  
  const getCampaignProgress = (campaignId: number) => {
    return state.campaignProgress[campaignId] || null;
  };
  
  const resetState = () => {
    dispatch({ 
      type: 'INITIALIZE_SUCCESS', 
      payload: initialState 
    });
  };
  
  // Context value
  const contextValue: GamificationContextValue = {
    state,
    triggerDiscovery,
    checkDiscovery,
    claimReward,
    showNotification,
    hideNotification,
    getActiveCampaignIds,
    getCampaignProgress,
    resetState
  };
  
  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
};

// Custom hook for using the gamification context
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};