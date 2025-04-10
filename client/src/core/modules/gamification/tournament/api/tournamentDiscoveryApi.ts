/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Discovery API Service
 * 
 * This service provides methods for interacting with the tournament discovery API endpoints.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Types for tournament discovery API responses
 */
export interface DiscoveryPoint {
  id: string;
  name: string;
  description: string;
  points: number;
  tier: 'scout' | 'strategist' | 'pioneer';
}

export interface UserDiscoveryProgress {
  discoveries: string[];
  discoveredDetails: DiscoveryPoint[];
  totalPoints: number;
  completionPercentage: number;
  currentTier: 'none' | 'scout' | 'strategist' | 'pioneer';
  isComplete: boolean;
}

export interface DiscoveryResponse {
  success: boolean;
  isNew: boolean;
  message: string;
  discovery: DiscoveryPoint;
  reward?: {
    type: string;
    amount: number;
    name: string;
  };
  prizeDrawingEntry?: any;
  isComplete: boolean;
}

/**
 * Get all tournament discovery points
 */
export async function getDiscoveryPoints(): Promise<DiscoveryPoint[]> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/tournament-discovery/points'
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching discovery points: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch discovery points:', error);
    return [];
  }
}

/**
 * Get a specific discovery point
 */
export async function getDiscoveryPoint(pointId: string): Promise<DiscoveryPoint> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/tournament-discovery/points/${pointId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching discovery point: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to fetch discovery point ${pointId}:`, error);
    throw error;
  }
}

/**
 * Get the current user's discovery progress
 */
export async function getUserDiscoveryProgress(): Promise<UserDiscoveryProgress> {
  try {
    const response = await apiRequest(
      'GET',
      '/api/tournament-discovery/my-discoveries'
    );
    
    if (response.status === 401) {
      // Not authenticated, return default empty progress
      return {
        discoveries: [],
        discoveredDetails: [],
        totalPoints: 0,
        completionPercentage: 0,
        currentTier: 'none',
        isComplete: false
      };
    }
    
    if (!response.ok) {
      throw new Error(`Error fetching user discoveries: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to fetch user discoveries:', error);
    // Return default empty progress on error
    return {
      discoveries: [],
      discoveredDetails: [],
      totalPoints: 0,
      completionPercentage: 0,
      currentTier: 'none',
      isComplete: false
    };
  }
}

/**
 * Record a new discovery
 */
export async function recordDiscovery(pointId: string): Promise<DiscoveryResponse> {
  try {
    const response = await apiRequest(
      'POST',
      '/api/tournament-discovery/discover',
      { pointId }
    );
    
    if (!response.ok) {
      throw new Error(`Error recording discovery: ${response.status}`);
    }
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to record discovery ${pointId}:`, error);
    throw error;
  }
}