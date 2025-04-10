/**
 * PKL-278651-GAME-0001-MOD
 * Gamification API
 * 
 * API service for the gamification module.
 */

import { apiRequest } from '@/lib/queryClient';
import {
  Campaign,
  CampaignProgress,
  DiscoveryPoint,
  UserDiscovery,
  Reward,
  DiscoveryEvent
} from './types';

/**
 * Fetch all active gamification campaigns
 */
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response = await apiRequest<Campaign[]>('/api/gamification/campaigns');
    return response;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // In a real app, we would handle the error more gracefully and potentially provide retry options
    return [];
  }
}

/**
 * Fetch a specific campaign by ID
 */
export async function getCampaign(id: number): Promise<Campaign | null> {
  try {
    const response = await apiRequest<Campaign>(`/api/gamification/campaigns/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all discovery points for a campaign
 */
export async function getDiscoveryPoints(campaignId: number): Promise<DiscoveryPoint[]> {
  try {
    const response = await apiRequest<DiscoveryPoint[]>(`/api/gamification/campaigns/${campaignId}/discoveries`);
    return response;
  } catch (error) {
    console.error(`Error fetching discoveries for campaign ${campaignId}:`, error);
    return [];
  }
}

/**
 * Fetch a specific discovery point by code
 */
export async function getDiscoveryByCode(code: string): Promise<DiscoveryPoint | null> {
  try {
    const response = await apiRequest<DiscoveryPoint>(`/api/gamification/discoveries/code/${code}`);
    return response;
  } catch (error) {
    console.error(`Error fetching discovery ${code}:`, error);
    return null;
  }
}

/**
 * Fetch all user discoveries
 */
export async function getUserDiscoveries(): Promise<{ discoveries: UserDiscovery[]; campaigns: CampaignProgress[] }> {
  try {
    const response = await apiRequest<{ discoveries: UserDiscovery[]; campaigns: CampaignProgress[] }>(
      '/api/gamification/user/discoveries'
    );
    return response;
  } catch (error) {
    console.error('Error fetching user discoveries:', error);
    return { discoveries: [], campaigns: [] };
  }
}

/**
 * Record a new discovery
 */
export async function recordDiscovery(code: string, context?: Record<string, any>): Promise<{
  success: boolean;
  discovery?: DiscoveryPoint;
  isNew: boolean;
  reward?: Reward;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      discovery?: DiscoveryPoint;
      isNew: boolean;
      reward?: Reward;
    }>('/api/gamification/user/discoveries', {
      method: 'POST',
      body: JSON.stringify({
        code,
        timestamp: new Date().toISOString(),
        context
      })
    });
    return response;
  } catch (error) {
    console.error(`Error recording discovery ${code}:`, error);
    return { success: false, isNew: false };
  }
}

/**
 * Fetch campaign progress
 */
export async function getCampaignProgress(campaignId: number): Promise<{
  completionPercentage: number;
  discoveredCount: number;
  totalDiscoveries: number;
  isComplete: boolean;
  totalPoints: number;
}> {
  try {
    const response = await apiRequest<{
      completionPercentage: number;
      discoveredCount: number;
      totalDiscoveries: number;
      isComplete: boolean;
      totalPoints: number;
    }>(`/api/gamification/user/campaigns/${campaignId}/progress`);
    return response;
  } catch (error) {
    console.error(`Error fetching progress for campaign ${campaignId}:`, error);
    return {
      completionPercentage: 0,
      discoveredCount: 0,
      totalDiscoveries: 0,
      isComplete: false,
      totalPoints: 0
    };
  }
}

/**
 * Fetch user rewards
 */
export async function getUserRewards(claimed = false): Promise<Reward[]> {
  try {
    const response = await apiRequest<Reward[]>(`/api/gamification/user/rewards?claimed=${claimed}`);
    return response;
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return [];
  }
}

/**
 * Claim a reward
 */
export async function claimReward(rewardId: number): Promise<{
  success: boolean;
  message: string;
  reward?: Reward;
  redemptionCode?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      reward?: Reward;
      redemptionCode?: string;
    }>(`/api/gamification/user/rewards/${rewardId}/claim`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error(`Error claiming reward ${rewardId}:`, error);
    return { success: false, message: 'Failed to claim reward. Please try again later.' };
  }
}

/**
 * In-memory simulation for local testing
 * 
 * This function simulates the behavior of the actual API in a development environment.
 * It will be used only when backend API is not available.
 * 
 * In a real production environment, this would be replaced with actual API calls.
 */
export async function simulateDiscovery(code: string, context?: Record<string, any>): Promise<{
  success: boolean;
  discovery?: DiscoveryPoint;
  isNew: boolean;
  reward?: Reward;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate discovery lookup based on code
  const simulatedDiscoveries: Record<string, DiscoveryPoint> = {
    'konami-code': {
      id: 1,
      campaignId: 1,
      name: 'Konami Code',
      code: 'konami-code',
      description: 'Discovered the secret Konami Code easter egg!',
      pointValue: 50,
      content: {
        title: 'The Konami Code',
        details: 'The Konami Code is a cheat code that originated from Konami games in the 1980s. The code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A.',
        imageUrl: 'https://example.com/images/konami-code.jpg',
      },
      config: {
        difficulty: 'medium',
        type: 'hidden',
        triggerAction: 'sequence',
        location: 'global',
      },
      requirements: {
        minUserLevel: 0,
      },
    },
    'pickle-history': {
      id: 2,
      campaignId: 1,
      name: 'Pickle History',
      code: 'pickle-history',
      description: 'Discovered the history of pickleball!',
      pointValue: 30,
      content: {
        title: 'Pickleball History',
        details: 'Pickleball was invented in 1965 by Joel Pritchard, Bill Bell, and Barney McCallum on Bainbridge Island, Washington.',
        imageUrl: 'https://example.com/images/pickleball-history.jpg',
      },
      config: {
        difficulty: 'easy',
        type: 'educational',
        triggerAction: 'click',
        location: 'about-page',
      },
      requirements: {
        minUserLevel: 0,
      },
    },
  };
  
  // Find the discovery
  const discovery = simulatedDiscoveries[code];
  
  if (!discovery) {
    return { success: false, isNew: false };
  }
  
  // Simulate reward based on discovery
  const reward: Reward = {
    id: 1,
    name: 'Code Master',
    description: 'You have discovered a hidden code!',
    type: 'xp',
    rarity: 'rare',
    value: {
      xpAmount: discovery.pointValue,
    },
  };
  
  // Return the simulated response
  return {
    success: true,
    discovery,
    isNew: true,
    reward,
  };
}