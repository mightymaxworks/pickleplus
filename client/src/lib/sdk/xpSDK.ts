/**
 * XP SDK
 * 
 * Functions for interacting with XP data
 */
import { useQuery } from "@tanstack/react-query";

export interface XPBreakdown {
  dailyMatchNumber: number;
  baseAmount: number;
  cooldownReduction: boolean;
  cooldownAmount: number | null;
  tournamentMultiplier: number | null;
  victoryBonus: number | null;
  winStreakBonus: number | null;
  closeMatchBonus: number | null;
  skillBonus: number | null;
  foundingMemberBonus: number | null;
  weeklyCapReached: boolean;
}

export interface XPTransaction {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  source: string;
  timestamp: string;
}

export interface XPSummary {
  totalXP: number;
  level: number;
  nextLevelXP: number;
  previousLevelXP: number;
  nextLevelDelta: number;
  progress: number;
}

export interface PaginatedTransactions {
  transactions: XPTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Get the XP summary for the current authenticated user
 * 
 * @returns Promise with XP summary
 */
export async function getXPSummary(): Promise<XPSummary> {
  const response = await fetch('/api/xp/total');
  if (!response.ok) {
    throw new Error('Failed to fetch XP summary');
  }
  return await response.json();
}

/**
 * Get the XP summary for a specific user
 * 
 * @param userId User ID
 * @returns Promise with XP summary
 */
export async function getUserXPSummary(userId: number): Promise<XPSummary> {
  const response = await fetch(`/api/xp/total/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch XP summary for user ${userId}`);
  }
  return await response.json();
}

/**
 * Get XP transactions for the current authenticated user
 * 
 * @param limit Number of transactions to return (default: 10)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise with paginated XP transactions
 */
export async function getXPTransactions(limit = 10, offset = 0): Promise<PaginatedTransactions> {
  const response = await fetch(`/api/xp/transactions?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch XP transactions');
  }
  return await response.json();
}

/**
 * Get XP transactions for a specific user
 * 
 * @param userId User ID
 * @param limit Number of transactions to return (default: 10)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise with paginated XP transactions
 */
export async function getUserXPTransactions(userId: number, limit = 10, offset = 0): Promise<PaginatedTransactions> {
  const response = await fetch(`/api/xp/${userId}/transactions?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch XP transactions for user ${userId}`);
  }
  return await response.json();
}

/**
 * React hook for getting XP data for a user
 * 
 * @param userId User ID (defaults to current user if not provided)
 * @returns Query result with XP summary
 */
export function useUserXP(userId?: number) {
  const queryKey = userId ? [`/api/xp/total/${userId}`] : ['/api/xp/total'];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (userId) {
        return await getUserXPSummary(userId);
      } else {
        return await getXPSummary();
      }
    }
  });
}