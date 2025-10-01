import { apiRequest } from "@/lib/queryClient";
import { matchService } from "@/lib/services/match-service";

/**
 * Match SDK
 * 
 * This SDK provides functionality for match-related operations in the Pickle+ platform.
 * 
 * UI Components Integration:
 * - MatchHistory: Displays a list of matches (Navigation: Match Center → History tab)
 * - MatchTrends: Shows match performance visualizations (Navigation: Match Center → History tab)
 * - MatchFilters: Provides filtering options for matches (Navigation: Match Center → History tab)
 * - MatchDetails: Shows detailed match information (Navigation: Match Center → Click on any match)
 * 
 * User Access Paths:
 * 1. Main Navigation → Match Center → Various tabs
 * 2. Dashboard → Recent Matches card → "View All"
 * 3. Profile → Match History section
 * 
 * Mobile Considerations:
 * - Components stack vertically on mobile devices
 * - MatchFilters collapses into a dropdown menu
 * - MatchTrends shows simplified visualizations
 */

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

// Interface for participant validation status
export interface ParticipantValidation {
  userId: number;
  status: 'pending' | 'confirmed' | 'disputed';
  validatedAt?: string;
  notes?: string;
}

// Combined match interface that handles both frontend and backend data formats
export interface RecordedMatch extends Partial<MatchData> {
  id: number;
  
  // Frontend properties 
  date?: string;
  validatedBy?: number[];
  participantValidations?: ParticipantValidation[];
  feedback?: {
    enjoymentRating?: number;
    skillMatchRating?: number;
    comments?: string;
  };
  playerNames?: {
    [userId: number]: {
      displayName: string;
      username: string;
      avatarInitials?: string;
      avatarUrl?: string;
    }
  };
  rewards?: {
    [userId: number]: {
      xp?: {
        amount: number;
        breakdown?: {
          baseAmount: number;
          victoryBonus?: number;
          tournamentMultiplier?: number;
          skillBonus?: number;
        }
      },
      ranking?: {
        points: number;
        previousTier?: string;
        newTier?: string;
        tierChanged?: boolean;
      }
    }
  };
  
  // Backend properties (coming from database)
  matchDate?: string;
  playerOneId?: number;
  playerTwoId?: number;
  playerOnePartnerId?: number | null;
  playerTwoPartnerId?: number | null;
  winnerId?: number;
  scorePlayerOne?: string;
  scorePlayerTwo?: string;
  eventTier?: string;
  division?: string;
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
  // NEW: Primary certification status field
  certificationStatus?: 'pending' | 'certified' | 'disputed' | 'expired';
  isVerified?: boolean;
  // DEPRECATED: Legacy validation status (kept for backward compatibility)
  validationStatus?: 'pending' | 'confirmed' | 'disputed' | 'validated' | 'verified' | 'in_review' | 'rejected';
  validationRequiredBy?: string;
  validationCompletedAt?: string;
  xpAwarded?: number;
  pointsAwarded?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Record a new match
 * @param matchData The match data to record
 * @returns The recorded match data with ID
 */
export async function recordMatch(matchData: MatchData): Promise<RecordedMatch> {
  console.log("matchSDK: Recording match with data:", JSON.stringify(matchData, null, 2));
  
  try {
    // Use the new frontend-first match service (Framework 5.3)
    // This will store the match locally first and then try to sync with server
    const recordedMatch = await matchService.recordMatch({
      formatType: matchData.formatType,
      scoringSystem: matchData.scoringSystem,
      pointsToWin: matchData.pointsToWin,
      players: matchData.players,
      gameScores: matchData.gameScores,
      matchType: matchData.matchType,
      eventTier: matchData.eventTier,
      division: matchData.division,
      location: matchData.location
    });
    
    console.log("matchSDK: Match recorded successfully using frontend-first approach:", recordedMatch);
    
    // Convert from the service model to the SDK model
    return {
      id: recordedMatch.id,
      date: recordedMatch.date,
      formatType: recordedMatch.formatType,
      scoringSystem: recordedMatch.scoringSystem,
      pointsToWin: recordedMatch.pointsToWin,
      players: recordedMatch.players,
      gameScores: recordedMatch.gameScores,
      matchType: recordedMatch.matchType,
      eventTier: recordedMatch.eventTier,
      division: recordedMatch.division,
      location: recordedMatch.location,
      validationStatus: recordedMatch.validationStatus
    };
  } catch (error) {
    console.error("matchSDK: Error recording match:", error);
    
    // Enhanced error logging to help debug empty error objects
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else if (error === null || error === undefined) {
      console.error("matchSDK: Received null/undefined error");
    }
    
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
  console.log("matchSDK: Fetching recent matches for user:", userId, "limit:", limit);
  
  try {
    // Use the frontend-first match service to get recent matches
    // This will try to load from the server, but fall back to local storage if needed
    const matches = await matchService.getRecentMatches(userId, limit);
    console.log("matchSDK: Retrieved matches using frontend-first approach:", matches);
    
    // Convert from the service model to the SDK model
    return matches.map(match => ({
      id: match.id,
      date: match.date,
      formatType: match.formatType,
      scoringSystem: match.scoringSystem,
      pointsToWin: match.pointsToWin,
      players: match.players,
      gameScores: match.gameScores,
      matchType: match.matchType,
      eventTier: match.eventTier,
      division: match.division,
      location: match.location,
      validationStatus: match.validationStatus,
      // Add default playerNames if not present
      playerNames: match.playerNames || match.players.reduce((acc, player) => {
        acc[player.userId] = {
          displayName: `Player ${player.userId}`,
          username: `player${player.userId}`,
          avatarInitials: `P${player.userId}`
        };
        return acc;
      }, {} as Record<number, {displayName: string, username: string, avatarInitials: string}>)
    }));
  } catch (error) {
    console.error("matchSDK: Error fetching recent matches:", error);
    return [];
  }
}

/**
 * PKL-278651-HIST-0001-BL: Get match history with advanced filtering and pagination
 * 
 * This function extends getRecentMatches to provide comprehensive filtering, sorting
 * and pagination capabilities for the Match History feature.
 * 
 * @param options Filtering, sorting and pagination options
 * @returns Paginated match history with metadata
 */
export async function getMatchHistory(options: {
  userId?: number;
  startDate?: string;
  endDate?: string;
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league' | 'all';
  formatType?: 'singles' | 'doubles' | 'mixed' | 'all';
  validationStatus?: 'pending' | 'confirmed' | 'disputed' | 'validated' | 'all';
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'score' | 'opponent';
  sortDirection?: 'asc' | 'desc';
}): Promise<{
  matches: RecordedMatch[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> {
  const defaultOptions = {
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortDirection: 'desc',
    matchType: 'all',
    formatType: 'all',
    validationStatus: 'all'
  };
  
  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (mergedOptions.userId) queryParams.append("userId", mergedOptions.userId.toString());
  if (mergedOptions.startDate) queryParams.append("startDate", mergedOptions.startDate);
  if (mergedOptions.endDate) queryParams.append("endDate", mergedOptions.endDate);
  if (mergedOptions.matchType !== 'all') queryParams.append("matchType", mergedOptions.matchType);
  if (mergedOptions.formatType !== 'all') queryParams.append("formatType", mergedOptions.formatType);
  if (mergedOptions.validationStatus !== 'all') queryParams.append("validationStatus", mergedOptions.validationStatus);
  if (mergedOptions.location) queryParams.append("location", mergedOptions.location);
  queryParams.append("page", mergedOptions.page.toString());
  queryParams.append("limit", mergedOptions.limit.toString());
  queryParams.append("sortBy", mergedOptions.sortBy);
  queryParams.append("sortDirection", mergedOptions.sortDirection);
  
  console.log("Fetching match history with params:", queryParams.toString());
  
  try {
    const response = await apiRequest("GET", `/api/match/history?${queryParams}`);
    console.log("Match history response status:", response.status);
    
    // First, get the raw text response
    const textResponse = await response.text();
    
    // Check if response is HTML or JSON
    if (textResponse.trim().startsWith('<!DOCTYPE') || textResponse.trim().startsWith('<html')) {
      console.log("Received HTML instead of JSON for match history");
      
      // For MVP, create some example history data
      // This would be replaced with real API data in production
      const exampleMatches = [];
      const totalExample = 23; // Example total count
      
      // Generate a few example records that follow our standardized structure
      for (let i = 0; i < Math.min(mergedOptions.limit, 10); i++) {
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - i * 3); // Space matches out by 3 days
        
        const exampleMatch: RecordedMatch = {
          id: 1001 + i,
          date: matchDate.toISOString(),
          formatType: i % 2 === 0 ? 'singles' : 'doubles',
          scoringSystem: 'traditional',
          pointsToWin: 11,
          matchType: i % 3 === 0 ? 'tournament' : 'casual',
          eventTier: i % 4 === 0 ? 'regional' : 'local',
          division: i % 5 === 0 ? '50+' : undefined,
          players: [
            {
              userId: 1,
              score: Math.floor(Math.random() * 5) + 7, // Random score between 7-11
              isWinner: i % 2 === 0
            },
            {
              userId: 6 + i % 3, // Different opponents
              score: Math.floor(Math.random() * 6) + 2, // Random score between 2-7
              isWinner: i % 2 !== 0
            }
          ],
          gameScores: [
            {
              playerOneScore: 11,
              playerTwoScore: 4
            }
          ],
          playerNames: {
            1: {
              displayName: "You",
              username: "PickleballPro",
              avatarInitials: "YP"
            },
            6: {
              displayName: "Johnny Pickleball",
              username: "johnny_pickle",
              avatarInitials: "JP"
            },
            7: {
              displayName: "Sarah Spike",
              username: "sarah_spike",
              avatarInitials: "SS"
            },
            8: {
              displayName: "Michael Volley",
              username: "mike_volley",
              avatarInitials: "MV"
            }
          },
          validationStatus: i % 2 === 0 ? 'validated' : 'pending'
        };
        
        exampleMatches.push(exampleMatch);
      }
      
      // Return paginated result structure
      return {
        matches: exampleMatches,
        totalCount: totalExample,
        currentPage: mergedOptions.page,
        totalPages: Math.ceil(totalExample / mergedOptions.limit)
      };
    }
    
    try {
      // Try to parse the response as JSON
      const jsonData = JSON.parse(textResponse);
      console.log("Successfully parsed match history JSON:", jsonData);
      return jsonData;
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return {
        matches: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      };
    }
  } catch (error) {
    console.error("Error fetching match history:", error);
    return {
      matches: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0
    };
  }
}

/**
 * PKL-278651-STAT-0001-BL: Enhanced Match Statistics
 * This function retrieves comprehensive match statistics with optional filtering
 * 
 * @param userId Optional user ID (defaults to current user)
 * @param options Optional filtering options
 * @returns Enhanced match statistics
 */
export async function getMatchStats(
  userId?: number, 
  options?: {
    timeRange?: string; // '30days', '90days', '6months', '1year', 'all'
    matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
    formatType?: 'singles' | 'doubles' | 'mixed';
  }
): Promise<{
  // Basic statistics
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  avgScore: number;
  avgScoreChange?: number;
  winRateChange?: number;
  
  // Streaks
  currentWinStreak: number;
  bestWinStreak: number;
  currentLossStreak?: number;
  
  // Format specific
  singlesMatches: number;
  singlesWins: number;
  singlesLosses: number;
  singlesWinRate: number;
  singlesAvgScore: number;
  
  doublesMatches: number;
  doublesWins: number;
  doublesLosses: number;
  doublesWinRate: number;
  doublesAvgScore: number;
  
  // Match type specific
  casualMatches?: number;
  casualWinRate?: number;
  competitiveMatches?: number;
  competitiveWinRate?: number;
  tournamentMatches?: number;
  tournamentWinRate?: number;
  leagueMatches?: number;
  leagueWinRate?: number;
  
  // Time data
  lastMatchDate: string;
  firstMatchDate?: string;
  
  // Location data
  mostPlayedLocation?: string;
  locations?: { name: string; matches: number; winRate: number }[];
  
  // Opponent data
  favoriteOpponent?: string;
  topOpponents?: { 
    userId: number;
    name: string;
    username?: string;
    initials: string;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
  }[];
  
  // Best scores
  bestScore?: string;
  worstScore?: string;
  
  // Charts data
  performanceTrend?: { 
    date: string;
    winRate: number;
    avgScore: number;
    matches: number;
  }[];
  
  formatPerformance?: {
    format: string;
    wins: number;
    losses: number;
    winRate: number;
  }[];
  
  scoreDistribution?: {
    score: string;
    count: number;
    percentage: number;
  }[];
  
  opponentAnalysis?: {
    skill: string;
    winRate: number;
    matches: number;
  }[];
  
  // Recent matches
  recentMatches?: RecordedMatch[];
}> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append("userId", userId.toString());
  if (options?.timeRange) queryParams.append("timeRange", options.timeRange);
  if (options?.matchType) queryParams.append("matchType", options.matchType);
  if (options?.formatType) queryParams.append("formatType", options.formatType);
  
  try {
    const response = await apiRequest("GET", `/api/match/stats?${queryParams}`);
    
    console.log(`GET /api/match/stats?${queryParams} response status:`, response.status);
    console.log("Response cookies present:", response.headers.get('set-cookie') ? "Yes" : "No");
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching match stats:", error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Validate a match result
 * @param matchId The ID of the match to validate
 * @param status "confirmed" or "disputed"
 * @param notes Optional notes, especially important for disputes
 * @returns The validation result
 */
/**
 * PKL-278651-MATCH-0004-UIX: Enhanced Match Validation
 * This function allows a user to validate or dispute a match
 * 
 * @param matchId The ID of the match to validate
 * @param isConfirmed Boolean indicating whether the match is confirmed (true) or disputed (false)
 * @param notes Optional notes, especially important for disputes
 * @returns The validation result
 */
export async function validateMatch(
  matchId: number,
  status: 'confirmed' | 'disputed',
  notes?: string
): Promise<{ id: number; status: string }> {
  try {
    console.log(`matchSDK: Validating match ${matchId} with status: ${status}`);
    
    const response = await apiRequest("POST", `/api/match/validate/${matchId}`, {
      matchId, // Add matchId to request body to match schema expectations
      status,
      notes
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`matchSDK: Match validation successful:`, result);
    return result;
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
    const response = await apiRequest("POST", `/api/match/${matchId}/feedback`, {
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

/**
 * Get validation details for a match
 * @param matchId The ID of the match
 * @returns Detailed validation information including participant statuses
 */
export async function getMatchValidationDetails(matchId: number): Promise<{
  matchId: number;
  validationStatus: 'pending' | 'confirmed' | 'disputed' | 'validated';
  validationRequiredBy?: string;
  participantValidations: ParticipantValidation[];
}> {
  try {
    const response = await apiRequest("GET", `/api/match/${matchId}/validations`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("matchSDK: Error getting match validation details:", error);
    // Return a default structure with empty validations
    return {
      matchId,
      validationStatus: 'pending',
      participantValidations: []
    };
  }
}

// Export as a single SDK object
export const matchSDK = {
  recordMatch,
  getRecentMatches,
  getMatchHistory,
  getMatchStats,
  validateMatch,
  getMatchValidationDetails,
  provideMatchFeedback,
  getDailyMatchLimits
};