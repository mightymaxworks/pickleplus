import { apiRequest } from "@/lib/queryClient";

// Define types for match data
export interface MatchPlayer {
  userId: number;
  partnerId?: number;
  score: string | number; // Can be string or number, server expects string
  isWinner: boolean;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  isFoundingMember?: boolean;
}

export interface MatchData {
  formatType: "singles" | "doubles" | "mixed";
  scoringSystem: "traditional" | "rally";
  pointsToWin: number;
  players: MatchPlayer[];
  gameScores: { playerOneScore: number; playerTwoScore: number }[];
  location?: string;
  notes?: string;
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
}

export interface RecordedMatch extends MatchData {
  id: number;
  date: string;
  validationStatus?: 'pending' | 'confirmed' | 'disputed' | 'validated'; 
  validatedBy?: number[];
  feedback?: {
    enjoymentRating?: number;
    skillMatchRating?: number;
    comments?: string;
  };
  matchType: 'casual' | 'competitive' | 'tournament' | 'league';
  playerNames?: {
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

/**
 * Validate a match result
 * @param matchId The ID of the match to validate
 * @param status "confirmed" or "disputed"
 * @param notes Optional notes, especially important for disputes
 * @returns The validation result
 */
export async function validateMatch(
  matchId: number,
  status: "confirmed" | "disputed",
  notes?: string
): Promise<{ id: number; status: string }> {
  try {
    const response = await apiRequest("POST", `/api/match/validate/${matchId}`, {
      status,
      notes
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("matchSDK: Error validating match:", error);
    throw error;
  }
}

/**
 * Provide feedback on a match
 * @param matchId The ID of the match
 * @param enjoymentRating Rating for match enjoyment (1-5)
 * @param skillMatchRating Rating for skill match level (1-5)
 * @param comments Optional comments about the match
 * @returns The feedback result
 */
export async function provideMatchFeedback(
  matchId: number,
  enjoymentRating: number,
  skillMatchRating: number,
  comments?: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiRequest("POST", `/api/match/feedback/${matchId}`, {
      enjoymentRating,
      skillMatchRating,
      comments
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("matchSDK: Error providing match feedback:", error);
    throw error;
  }
}

/**
 * Get daily match limits for the current user
 * @returns Daily match limits and usage for different XP tiers
 */
export async function getDailyMatchLimits(): Promise<{
  currentTier: string;
  remainingMatches: number;
  tier1: { multiplier: number; unlimited: boolean };
  tier2: { multiplier: number; unlimited: boolean };
  tier3: { multiplier: number; unlimited: boolean };
  tier4: { multiplier: number; unlimited: boolean };
}> {
  try {
    const response = await apiRequest("GET", "/api/match/daily-limits");
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("matchSDK: Error getting daily match limits:", error);
    throw error;
  }
}

// Export as a single SDK object
export const matchSDK = {
  recordMatch,
  getRecentMatches,
  getMatchStats,
  validateMatch,
  provideMatchFeedback,
  getDailyMatchLimits
};