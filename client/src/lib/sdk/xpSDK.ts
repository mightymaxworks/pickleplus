/**
 * XP SDK - Client SDK for the XP Transaction System
 * 
 * This file implements the client-side SDK for interacting with the XP system API
 * It provides functions for retrieving XP information and performing related operations.
 */
import { 
  XpTransaction,
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
    const response = await apiRequest("GET", `/api/xp/total/${userId}`);
    const data = await response.json();
    return data.totalXP;
  } catch (error) {
    console.error("Error fetching user XP:", error);
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

// React Query Hooks

/**
 * Hook to get a user's XP information
 */
export function useUserXP(userId: number | undefined) {
  return {
    queryKey: ['/api/xp/total', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest("GET", `/api/xp/total/${userId}`);
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