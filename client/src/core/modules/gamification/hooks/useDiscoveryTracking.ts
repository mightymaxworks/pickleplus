/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTracking Hook
 * 
 * A hook that provides tracking functionality for user discoveries and campaign progress.
 */

import { useState, useEffect, useCallback } from 'react';
import { useGamification } from '../context/GamificationContext';
import { Campaign, CampaignProgress, UserDiscovery, Reward } from '../api/types';

interface DiscoveryStats {
  totalDiscovered: number;
  totalPoints: number;
  campaigns: {
    id: number;
    name: string;
    progress: number;
    discovered: number;
    total: number;
  }[];
  recentDiscoveries: {
    code: string;
    timestamp: string;
    rewardClaimed: boolean;
  }[];
  rewards: {
    id: number;
    name: string;
    description: string;
    rarity: string;
    claimed: boolean;
    claimedAt?: string;
  }[];
}

/**
 * A hook that provides tracking functionality for user discoveries and campaign progress.
 * 
 * @returns {Object} - Discovery tracking information and functions
 * @returns {DiscoveryStats} - Current discovery statistics
 * @returns {function} - refreshStats - Function to refresh the statistics
 * @returns {function} - getCompletionPercentage - Function to get the completion percentage for a campaign
 */
export default function useDiscoveryTracking() {
  // Get gamification context
  const { 
    state, 
    getCampaignProgress 
  } = useGamification();
  
  // State for discovery statistics
  const [stats, setStats] = useState<DiscoveryStats>({
    totalDiscovered: 0,
    totalPoints: 0,
    campaigns: [],
    recentDiscoveries: [],
    rewards: []
  });
  
  // Function to refresh statistics
  const refreshStats = useCallback(() => {
    const { campaigns, userDiscoveries, campaignProgress, rewards } = state;
    
    // Calculate total discoveries
    const totalDiscovered = Object.keys(userDiscoveries).length;
    
    // Calculate total points
    const totalPoints = Object.values(campaignProgress).reduce(
      (sum, campaign) => sum + campaign.totalPoints, 
      0
    );
    
    // Process campaign progress
    const campaignStats = campaigns
      .filter(campaign => campaign.isActive)
      .map(campaign => {
        const progress = getCampaignProgress(campaign.id);
        return {
          id: campaign.id,
          name: campaign.name,
          progress: progress?.completionPercentage || 0,
          discovered: progress?.discoveredCount || 0,
          total: progress?.totalDiscoveries || 10 // Default to 10 if unknown
        };
      });
    
    // Process recent discoveries
    const recentDiscoveries = Object.entries(userDiscoveries)
      .map(([code, data]) => ({
        code,
        timestamp: data.discoveredAt,
        rewardClaimed: data.rewardClaimed
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5); // Get only the 5 most recent
    
    // Process rewards
    const rewardStats = rewards.map(reward => ({
      id: reward.id || 0,
      name: reward.name,
      description: reward.description,
      rarity: reward.rarity,
      claimed: Boolean((reward as any).claimed), // Type cast to access potential dynamic property
      claimedAt: (reward as any).claimedAt // Type cast to access potential dynamic property
    }));
    
    // Update statistics
    setStats({
      totalDiscovered,
      totalPoints,
      campaigns: campaignStats,
      recentDiscoveries,
      rewards: rewardStats
    });
  }, [state, getCampaignProgress]);
  
  // Get completion percentage for a specific campaign
  const getCompletionPercentage = useCallback((campaignId: number): number => {
    const progress = getCampaignProgress(campaignId);
    return progress?.completionPercentage || 0;
  }, [getCampaignProgress]);
  
  // Initialize and update statistics when state changes
  useEffect(() => {
    refreshStats();
  }, [refreshStats, state]);
  
  return {
    stats,
    refreshStats,
    getCompletionPercentage
  };
}