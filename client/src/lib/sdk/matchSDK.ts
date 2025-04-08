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
  validationStatus?: 'pending' | 'confirmed' | 'disputed'; 
  validatedBy?: number[];
  feedback?: {
    enjoymentRating?: number;
    skillMatchRating?: number;
    comments?: string;
  };
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
 * Provide feedback for a match
 * @param matchId The ID of the match to provide feedback for
 * @param feedback The feedback data
 * @returns The feedback result
 */
export async function provideMatchFeedback(
  matchId: number,
  feedback: {
    enjoymentRating?: number;
    skillMatchRating?: number;
    comments?: string;
  }
): Promise<{ id: number }> {
  try {
    const response = await apiRequest("POST", `/api/match/${matchId}/feedback`, feedback);
    
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
 * Get the user's daily match limits
 * @returns Daily match limit information with enhanced anti-binge measures
 */
export interface DailyMatchLimitsResponse {
  dailyMatchCount: number;
  currentBaseMultiplier: number;
  currentEffectiveMultiplier: number;
  timeWeightedFactor: number;
  timeConstraintMessage: string | null;
  recentMatchCount: number;
  dailyMatchLimit: {
    tier1: { multiplier: number; remaining: number };
    tier2: { multiplier: number; remaining: number };
    tier3: { multiplier: number; remaining: number };
    tier4: { multiplier: number; unlimited: boolean };
  }
}

export async function getDailyMatchLimits(): Promise<DailyMatchLimitsResponse> {
  try {
    const response = await apiRequest("GET", "/api/match/daily-limits");
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("matchSDK: Error getting daily match limits:", error);
    
    // Return a fallback value for error cases to avoid breaking the UI
    // This maintains backwards compatibility with old data structure
    const fallback: DailyMatchLimitsResponse = {
      dailyMatchCount: 0,
      currentBaseMultiplier: 100,
      currentEffectiveMultiplier: 100,
      timeWeightedFactor: 100,
      timeConstraintMessage: null,
      recentMatchCount: 0,
      dailyMatchLimit: {
        tier1: { multiplier: 100, remaining: 3 },
        tier2: { multiplier: 75, remaining: 3 },
        tier3: { multiplier: 50, remaining: 4 },
        tier4: { multiplier: 25, unlimited: true }
      }
    };
    
    throw error;
  }
}

// Export all functions as a named object
export const matchSDK = {
  recordMatch,
  getRecentMatches,
  getMatchStats,
  // VALMAT functions
  validateMatch,
  provideMatchFeedback,
  getDailyMatchLimits
};

export default matchSDK;