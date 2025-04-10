/**
 * PKL-278651-GAME-0001-MOD
 * Gamification API Service
 * 
 * This file provides the API interface for the gamification module.
 */

import { apiRequest } from '@/lib/queryClient';
import type { 
  Campaign, 
  DiscoveryPoint, 
  UserDiscoveriesResponse,
  DiscoveryEvent,
  Reward
} from './types';

const API_BASE = '/api/gamification';

/**
 * Get active campaigns
 */
export const getActiveCampaigns = async (): Promise<Campaign[]> => {
  const response = await apiRequest('GET', `${API_BASE}/campaigns`);
  return response.json();
};

/**
 * Get discovery points for a campaign
 */
export const getCampaignDiscoveries = async (campaignId: number): Promise<DiscoveryPoint[]> => {
  const response = await apiRequest('GET', `${API_BASE}/campaigns/${campaignId}/discoveries`);
  return response.json();
};

/**
 * Get user's discoveries and progress
 */
export const getUserDiscoveries = async (): Promise<UserDiscoveriesResponse> => {
  const response = await apiRequest('GET', `${API_BASE}/user/discoveries`);
  return response.json();
};

/**
 * Record a new discovery
 */
export const recordDiscovery = async (discoveryEvent: DiscoveryEvent): Promise<{
  success: boolean;
  discovery: DiscoveryPoint;
  isNew: boolean;
  reward?: Reward;
}> => {
  const response = await apiRequest('POST', `${API_BASE}/user/discoveries`, discoveryEvent);
  return response.json();
};

/**
 * Get discovery by code
 */
export const getDiscoveryByCode = async (code: string): Promise<DiscoveryPoint | null> => {
  try {
    const response = await apiRequest('GET', `${API_BASE}/discoveries/code/${code}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching discovery:', error);
    return null;
  }
};

/**
 * Claim a reward
 */
export const claimReward = async (rewardId: number): Promise<{
  success: boolean;
  message: string;
  reward: Reward;
  redemptionCode?: string;
}> => {
  const response = await apiRequest('POST', `${API_BASE}/user/rewards/${rewardId}/claim`);
  return response.json();
};

/**
 * Get user rewards
 */
export const getUserRewards = async (claimed: boolean = false): Promise<Reward[]> => {
  const response = await apiRequest('GET', `${API_BASE}/user/rewards?claimed=${claimed}`);
  return response.json();
};

/**
 * Get campaign progress
 */
export const getCampaignProgress = async (campaignId: number): Promise<{
  completionPercentage: number;
  discoveredCount: number;
  totalDiscoveries: number;
  isComplete: boolean;
  totalPoints: number;
}> => {
  const response = await apiRequest('GET', `${API_BASE}/user/campaigns/${campaignId}/progress`);
  return response.json();
};