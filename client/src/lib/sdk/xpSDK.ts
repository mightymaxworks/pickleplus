/**
 * XP SDK - Client SDK for the XP Transaction System
 * 
 * This file implements the client-side SDK for interacting with the XP system API
 * It provides functions for retrieving XP information and performing related operations.
 */
import { 
  XpTransaction, 
  RankingTransaction, 
  RankingTierHistory,
  User
} from "@shared/schema";
import { apiRequest, queryClient } from "../queryClient";

/**
 * Gets total XP for a user.
 * 
 * @param userId The ID of the user to get XP for
 * @returns Promise with the total XP amount or undefined if not found
 */
export async function getUserXP(userId: number): Promise<number | undefined> {
  try {
    const response = await apiRequest("GET", `/api/xp/${userId}`);
    const data = await response.json();
    return data.totalXP;
  } catch (error) {
    console.error("Error fetching user XP:", error);
    throw error;
  }
}

/**
 * Gets ranking points for a user.
 * 
 * @param userId The ID of the user to get ranking points for
 * @returns Promise with the ranking points or undefined if not found
 */
export async function getUserRankingPoints(userId: number): Promise<number | undefined> {
  try {
    const response = await apiRequest("GET", `/api/ranking/${userId}`);
    const data = await response.json();
    return data.rankingPoints;
  } catch (error) {
    console.error("Error fetching user ranking points:", error);
    throw error;
  }
}

/**
 * Gets ranking tier for a user.
 * 
 * @param userId The ID of the user to get tier for
 * @returns Promise with the tier name or undefined if not found
 */
export async function getUserRankingTier(userId: number): Promise<string | undefined> {
  try {
    const response = await apiRequest("GET", `/api/ranking/${userId}/tier`);
    const data = await response.json();
    return data.tier;
  } catch (error) {
    console.error("Error fetching user ranking tier:", error);
    throw error;
  }
}

/**
 * Gets recent XP transactions for a user.
 * 
 * @param userId The ID of the user to get transactions for
 * @param limit Number of transactions to retrieve (default 10)
 * @returns Promise with an array of XP transactions
 */
export async function getUserXPTransactions(userId: number, limit = 10): Promise<XpTransaction[]> {
  try {
    const response = await apiRequest("GET", `/api/xp/${userId}/transactions?limit=${limit}`);
    const data = await response.json();
    return data.transactions;
  } catch (error) {
    console.error("Error fetching user XP transactions:", error);
    throw error;
  }
}

/**
 * Gets recent ranking transactions for a user.
 * 
 * @param userId The ID of the user to get transactions for
 * @param limit Number of transactions to retrieve (default 10)
 * @returns Promise with an array of ranking transactions
 */
export async function getUserRankingTransactions(userId: number, limit = 10): Promise<RankingTransaction[]> {
  try {
    const response = await apiRequest("GET", `/api/ranking/${userId}/transactions?limit=${limit}`);
    const data = await response.json();
    return data.transactions;
  } catch (error) {
    console.error("Error fetching user ranking transactions:", error);
    throw error;
  }
}

/**
 * Gets tier history for a user.
 * 
 * @param userId The ID of the user to get tier history for
 * @param limit Number of history entries to retrieve (default 10)
 * @returns Promise with an array of tier history entries
 */
export async function getUserRankingTierHistory(userId: number, limit = 10): Promise<RankingTierHistory[]> {
  try {
    const response = await apiRequest("GET", `/api/ranking/${userId}/tier-history?limit=${limit}`);
    const data = await response.json();
    return data.tierHistory;
  } catch (error) {
    console.error("Error fetching user tier history:", error);
    throw error;
  }
}

/**
 * Calculate XP needed for next level for a given user.
 * 
 * @param totalXP Current XP amount
 * @returns Object with information about the next level
 */
export function calculateXPProgress(totalXP: number): { 
  currentLevel: number; 
  nextLevel: number; 
  currentLevelXP: number; 
  nextLevelXP: number; 
  xpNeeded: number; 
  progress: number;
} {
  // Level formula: Level = 1 + floor(0.1 * sqrt(XP))
  const currentLevel = Math.floor(1 + 0.1 * Math.sqrt(totalXP));
  const nextLevel = currentLevel + 1;
  
  // XP required for a specific level: XP = 100 * (Level - 1)^2
  const currentLevelXP = 100 * Math.pow(currentLevel - 1, 2);
  const nextLevelXP = 100 * Math.pow(nextLevel - 1, 2);
  
  const xpNeeded = nextLevelXP - totalXP;
  const progress = (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;
  
  return {
    currentLevel,
    nextLevel,
    currentLevelXP,
    nextLevelXP,
    xpNeeded,
    progress
  };
}

/**
 * Get the tier name for a given ranking points value.
 * 
 * @param rankingPoints Current ranking points
 * @returns The tier name
 */
export function getRankingTier(rankingPoints: number): string {
  if (rankingPoints < 250) return 'Bronze';
  if (rankingPoints < 750) return 'Silver';
  if (rankingPoints < 1500) return 'Gold';
  if (rankingPoints < 2500) return 'Platinum';
  if (rankingPoints < 3500) return 'Diamond';
  if (rankingPoints < 5000) return 'Master';
  return 'Grandmaster';
}

/**
 * Get ranking point thresholds for all tiers.
 * 
 * @returns Object with tier thresholds
 */
export function getRankingTierThresholds(): { [key: string]: number } {
  return {
    'Bronze': 0,
    'Silver': 250,
    'Gold': 750,
    'Platinum': 1500,
    'Diamond': 2500,
    'Master': 3500,
    'Grandmaster': 5000
  };
}

/**
 * Calculate points needed for next tier for given ranking points.
 * 
 * @param rankingPoints Current ranking points
 * @returns Object with information about progress to next tier
 */
export function calculateRankingProgress(rankingPoints: number): {
  currentTier: string;
  nextTier: string;
  currentTierThreshold: number;
  nextTierThreshold: number;
  pointsNeeded: number;
  progress: number;
} {
  const tiers = getRankingTierThresholds();
  const tierNames = Object.keys(tiers);
  
  // Find current tier
  const currentTier = getRankingTier(rankingPoints);
  const currentTierIndex = tierNames.indexOf(currentTier);
  
  // If at max tier, there's no next tier
  if (currentTier === 'Grandmaster') {
    return {
      currentTier,
      nextTier: 'Grandmaster',
      currentTierThreshold: tiers['Grandmaster'],
      nextTierThreshold: Infinity,
      pointsNeeded: Infinity,
      progress: 100
    };
  }
  
  const nextTier = tierNames[currentTierIndex + 1];
  const currentTierThreshold = tiers[currentTier];
  const nextTierThreshold = tiers[nextTier];
  
  const pointsNeeded = nextTierThreshold - rankingPoints;
  const progress = (rankingPoints - currentTierThreshold) / (nextTierThreshold - currentTierThreshold) * 100;
  
  return {
    currentTier,
    nextTier,
    currentTierThreshold,
    nextTierThreshold,
    pointsNeeded,
    progress
  };
}

/**
 * Get tier color information for UI display.
 * 
 * @param tier Tier name
 * @returns Object with color information
 */
export function getTierColors(tier: string): {
  primary: string;
  secondary: string;
  text: string;
  border: string;
} {
  switch (tier) {
    case 'Bronze':
      return {
        primary: 'bg-amber-700',
        secondary: 'bg-amber-600',
        text: 'text-amber-700',
        border: 'border-amber-700'
      };
    case 'Silver':
      return {
        primary: 'bg-slate-400',
        secondary: 'bg-slate-300',
        text: 'text-slate-400',
        border: 'border-slate-400'
      };
    case 'Gold':
      return {
        primary: 'bg-yellow-500',
        secondary: 'bg-yellow-400',
        text: 'text-yellow-500',
        border: 'border-yellow-500'
      };
    case 'Platinum':
      return {
        primary: 'bg-emerald-500',
        secondary: 'bg-emerald-400',
        text: 'text-emerald-500',
        border: 'border-emerald-500'
      };
    case 'Diamond':
      return {
        primary: 'bg-sky-500',
        secondary: 'bg-sky-400',
        text: 'text-sky-500',
        border: 'border-sky-500'
      };
    case 'Master':
      return {
        primary: 'bg-purple-600',
        secondary: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-600'
      };
    case 'Grandmaster':
      return {
        primary: 'bg-rose-600',
        secondary: 'bg-rose-500',
        text: 'text-rose-600',
        border: 'border-rose-600'
      };
    default:
      return {
        primary: 'bg-gray-600',
        secondary: 'bg-gray-500',
        text: 'text-gray-600',
        border: 'border-gray-600'
      };
  }
}

// React Query Hooks

/**
 * Hook to get a user's XP information
 */
export function useUserXP(userId: number | undefined) {
  return {
    queryKey: ['/api/xp', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest("GET", `/api/xp/${userId}`);
      return response.json();
    }
  };
}

/**
 * Hook to get a user's ranking information
 */
export function useUserRanking(userId: number | undefined) {
  return {
    queryKey: ['/api/ranking', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest("GET", `/api/ranking/${userId}`);
      return response.json();
    }
  };
}

/**
 * Hook to get a user's XP transactions
 */
export function useUserXPTransactions(userId: number | undefined, limit = 10) {
  return {
    queryKey: ['/api/xp/transactions', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest("GET", `/api/xp/${userId}/transactions?limit=${limit}`);
      return response.json();
    }
  };
}

/**
 * Hook to get a user's ranking transactions
 */
export function useUserRankingTransactions(userId: number | undefined, limit = 10) {
  return {
    queryKey: ['/api/ranking/transactions', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest("GET", `/api/ranking/${userId}/transactions?limit=${limit}`);
      return response.json();
    }
  };
}

/**
 * Hook to get a user's tier history
 */
export function useUserTierHistory(userId: number | undefined, limit = 10) {
  return {
    queryKey: ['/api/ranking/tier-history', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest("GET", `/api/ranking/${userId}/tier-history?limit=${limit}`);
      return response.json();
    }
  };
}