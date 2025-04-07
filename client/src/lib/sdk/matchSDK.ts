import { apiRequest } from "@/lib/queryClient";

// Define types for match data
export interface MatchPlayer {
  userId: number;
  partnerId?: number;
  score: string | number; // Can be string or number, server expects string
  isWinner: boolean;
}

export interface MatchData {
  formatType: "singles" | "doubles";
  scoringSystem: "traditional" | "rally";
  pointsToWin: number;
  players: MatchPlayer[];
  gameScores: { playerOneScore: number; playerTwoScore: number }[];
  location?: string;
  notes?: string;
}

export interface RecordedMatch extends MatchData {
  id: number;
  date: string;
  playerNames: {
    [userId: number]: {
      displayName: string;
      username: string;
      avatarInitials?: string;
      avatarUrl?: string;
    }
  };
}

/**
 * Record a new match
 * @param matchData The match data to record
 * @returns The recorded match data with ID
 */
export async function recordMatch(matchData: MatchData): Promise<RecordedMatch> {
  console.log("matchSDK: Recording match with data:", JSON.stringify(matchData, null, 2));
  
  try {
    const response = await apiRequest("POST", "/api/match/record", matchData);
    console.log("matchSDK: Received API response status:", response.status);
    
    if (!response.ok) {
      // Try to extract more specific error info from response
      try {
        const errorData = await response.json();
        console.error("matchSDK: Error response data:", errorData);
        throw new Error(errorData.error || `Server returned ${response.status}`);
      } catch (jsonError) {
        // If we can't parse the error JSON, throw a generic error with status
        throw new Error(`Failed to record match: Server returned ${response.status}`);
      }
    }
    
    const recordedMatch = await response.json();
    console.log("matchSDK: Match recorded successfully:", recordedMatch);
    return recordedMatch;
  } catch (error) {
    console.error("matchSDK: Error recording match:", error);
    throw error;
  }
}

/**
 * Get user's recent matches
 * @param userId Optional user ID (defaults to current user)
 * @param limit Maximum number of matches to return
 * @returns List of recent matches
 */
export async function getRecentMatches(userId?: number, limit: number = 10): Promise<RecordedMatch[]> {
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append("userId", userId.toString());
  if (limit) queryParams.append("limit", limit.toString());
  
  const response = await apiRequest("GET", `/api/match/recent?${queryParams}`);
  return await response.json();
}

/**
 * Get match statistics for a user
 * @param userId Optional user ID (defaults to current user)
 * @returns Match statistics
 */
export async function getMatchStats(userId?: number): Promise<{
  totalMatches: number;
  matchesWon: number;
  winRate: number;
  recentMatches: RecordedMatch[];
}> {
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append("userId", userId.toString());
  
  const response = await apiRequest("GET", `/api/match/stats?${queryParams}`);
  return await response.json();
}

// Export all functions as a named object
export const matchSDK = {
  recordMatch,
  getRecentMatches,
  getMatchStats
};

export default matchSDK;