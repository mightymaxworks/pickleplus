/**
 * PKL-278651-GAME-0003-DISC
 * Tournament Discovery API Service
 * 
 * This service provides methods for interacting with the tournament discovery API endpoints.
 */

import { apiRequest } from '@lib/queryClient';

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
  return apiRequest<DiscoveryPoint[]>({
    url: '/api/tournament-discovery/points',
    method: 'GET'
  });
}

/**
 * Get a specific discovery point
 */
export async function getDiscoveryPoint(pointId: string): Promise<DiscoveryPoint> {
  return apiRequest<DiscoveryPoint>({
    url: `/api/tournament-discovery/points/${pointId}`,
    method: 'GET'
  });
}

/**
 * Get the current user's discovery progress
 */
export async function getUserDiscoveryProgress(): Promise<UserDiscoveryProgress> {
  return apiRequest<UserDiscoveryProgress>({
    url: '/api/tournament-discovery/my-discoveries',
    method: 'GET'
  });
}

/**
 * Record a new discovery
 */
export async function recordDiscovery(pointId: string): Promise<DiscoveryResponse> {
  return apiRequest<DiscoveryResponse>({
    url: '/api/tournament-discovery/discover',
    method: 'POST',
    data: { pointId }
  });
}