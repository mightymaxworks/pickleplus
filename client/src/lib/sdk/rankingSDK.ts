/**
 * Ranking SDK
 * 
 * Functions for interacting with ranking data
 */

export interface RankingTransaction {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  source: string;
  timestamp: string;
}

export interface RankingSummary {
  tier: string;
  points: number;
  nextTier: string;
  nextTierPoints: number;
  previousTier: string;
  previousTierPoints: number;
  progress: number;
}

export interface PaginatedRankingTransactions {
  transactions: RankingTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Get the ranking summary for the current authenticated user
 * 
 * @returns Promise with ranking summary
 */
export async function getRankingSummary(): Promise<RankingSummary> {
  const response = await fetch('/api/ranking');
  if (!response.ok) {
    throw new Error('Failed to fetch ranking summary');
  }
  return await response.json();
}

/**
 * Get the ranking summary for a specific user
 * 
 * @param userId User ID
 * @returns Promise with ranking summary
 */
export async function getUserRankingSummary(userId: number): Promise<RankingSummary> {
  const response = await fetch(`/api/ranking/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ranking summary for user ${userId}`);
  }
  return await response.json();
}

/**
 * Get ranking transactions for the current authenticated user
 * 
 * @param limit Number of transactions to return (default: 10)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise with paginated ranking transactions
 */
export async function getRankingTransactions(limit = 10, offset = 0): Promise<PaginatedRankingTransactions> {
  const response = await fetch(`/api/ranking/transactions?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ranking transactions');
  }
  return await response.json();
}

/**
 * Get ranking transactions for a specific user
 * 
 * @param userId User ID
 * @param limit Number of transactions to return (default: 10)
 * @param offset Offset for pagination (default: 0)
 * @returns Promise with paginated ranking transactions
 */
export async function getUserRankingTransactions(userId: number, limit = 10, offset = 0): Promise<PaginatedRankingTransactions> {
  const response = await fetch(`/api/ranking/${userId}/transactions?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ranking transactions for user ${userId}`);
  }
  return await response.json();
}