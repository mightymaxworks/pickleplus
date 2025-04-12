/**
 * PKL-278651-TOURN-0013-API / PKL-278651-TOURN-0003.1-API
 * Tournament Bracket API Client
 * 
 * This module provides a client for the tournament bracket API endpoints.
 * Enhanced with better typing and error handling.
 */
import { apiRequest } from '@/lib/queryClient';
import { BracketData, MatchResult, TournamentBracket, TournamentError, TournamentErrorCode } from '../types';

/**
 * Get a single bracket with all its matches and rounds
 * @param id The bracket ID
 * @returns A Promise containing the bracket data
 */
export async function getBracket(id: number): Promise<BracketData> {
  console.log(`[API][PKL-278651-TOURN-0003.1-API] Fetching bracket with ID ${id}`);
  try {
    const response = await apiRequest('GET', `/api/brackets/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API][PKL-278651-TOURN-0003.1-API] Server error fetching bracket ${id}:`, errorData);
      throw createTournamentError(
        TournamentErrorCode.BRACKET_NOT_FOUND,
        `Failed to fetch bracket with ID ${id}`,
        errorData
      );
    }
    
    const data = await response.json();
    console.log(`[API][PKL-278651-TOURN-0003.1-API] Successfully fetched bracket ${id}`);
    return data as BracketData;
  } catch (error) {
    console.error(`[API][PKL-278651-TOURN-0003.1-API] Error fetching bracket ${id}:`, error);
    if ((error as TournamentError).code) {
      throw error;
    }
    throw createTournamentError(
      TournamentErrorCode.SERVER_ERROR,
      `Failed to fetch bracket with ID ${id}`,
      error
    );
  }
}

/**
 * Get all brackets for a tournament
 * @param tournamentId The tournament ID
 * @returns A Promise containing an array of tournament brackets
 */
export async function getTournamentBrackets(tournamentId: number): Promise<TournamentBracket[]> {
  console.log(`[API][PKL-278651-TOURN-0003.1-API] Fetching brackets for tournament ${tournamentId}`);
  try {
    const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/brackets`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API][PKL-278651-TOURN-0003.1-API] Server error fetching brackets for tournament ${tournamentId}:`, errorData);
      throw createTournamentError(
        TournamentErrorCode.TOURNAMENT_NOT_FOUND,
        `Failed to fetch brackets for tournament with ID ${tournamentId}`,
        errorData
      );
    }
    
    const data = await response.json();
    console.log(`[API][PKL-278651-TOURN-0003.1-API] Successfully fetched ${data.length} brackets for tournament ${tournamentId}`);
    return data as TournamentBracket[];
  } catch (error) {
    console.error(`[API][PKL-278651-TOURN-0003.1-API] Error fetching brackets for tournament ${tournamentId}:`, error);
    if ((error as TournamentError).code) {
      throw error;
    }
    throw createTournamentError(
      TournamentErrorCode.SERVER_ERROR,
      `Failed to fetch brackets for tournament with ID ${tournamentId}`,
      error
    );
  }
}

/**
 * Create a bracket for a tournament
 * @param tournamentId The tournament ID
 * @param bracketData The bracket data to create
 * @returns A Promise containing the created bracket
 */
export async function createBracket(tournamentId: number, bracketData: Partial<TournamentBracket>): Promise<TournamentBracket> {
  console.log(`[API][PKL-278651-TOURN-0003.1-API] Creating bracket for tournament ${tournamentId}`);
  try {
    const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/brackets`, bracketData);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API][PKL-278651-TOURN-0003.1-API] Server error creating bracket for tournament ${tournamentId}:`, errorData);
      throw createTournamentError(
        TournamentErrorCode.VALIDATION_ERROR,
        `Failed to create bracket for tournament with ID ${tournamentId}`,
        errorData
      );
    }
    
    const data = await response.json();
    console.log(`[API][PKL-278651-TOURN-0003.1-API] Successfully created bracket for tournament ${tournamentId}`);
    return data as TournamentBracket;
  } catch (error) {
    console.error(`[API][PKL-278651-TOURN-0003.1-API] Error creating bracket for tournament ${tournamentId}:`, error);
    if ((error as TournamentError).code) {
      throw error;
    }
    throw createTournamentError(
      TournamentErrorCode.SERVER_ERROR,
      `Failed to create bracket for tournament with ID ${tournamentId}`,
      error
    );
  }
}

/**
 * Record a match result
 * @param matchId The match ID
 * @param resultData The match result data
 * @returns A Promise containing the updated match data
 */
export async function recordMatchResult(matchId: number, resultData: MatchResult): Promise<any> {
  console.log(`[API][PKL-278651-TOURN-0003.1-API] Recording result for match ${matchId}`, resultData);
  try {
    // Update the API endpoint to use proper REST format
    const response = await apiRequest('POST', `/api/matches/${matchId}/result`, resultData);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API][PKL-278651-TOURN-0003.1-API] Server error recording result for match ${matchId}:`, errorData);
      
      // Determine the appropriate error code based on the response
      let errorCode = TournamentErrorCode.SERVER_ERROR;
      if (response.status === 404) {
        errorCode = TournamentErrorCode.MATCH_NOT_FOUND;
      } else if (response.status === 400) {
        errorCode = TournamentErrorCode.VALIDATION_ERROR;
      } else if (response.status === 409) {
        errorCode = TournamentErrorCode.MATCH_ALREADY_COMPLETED;
      }
      
      throw createTournamentError(
        errorCode,
        `Failed to record result for match with ID ${matchId}`,
        errorData
      );
    }
    
    const data = await response.json();
    console.log(`[API][PKL-278651-TOURN-0003.1-API] Successfully recorded result for match ${matchId}`);
    return data;
  } catch (error) {
    console.error(`[API][PKL-278651-TOURN-0003.1-API] Error recording result for match ${matchId}:`, error);
    if ((error as TournamentError).code) {
      throw error;
    }
    throw createTournamentError(
      TournamentErrorCode.SERVER_ERROR,
      `Failed to record result for match with ID ${matchId}`,
      error
    );
  }
}

/**
 * Helper function to create a standardized tournament error
 */
function createTournamentError(
  code: TournamentErrorCode,
  message: string,
  details?: any
): TournamentError {
  return {
    code,
    message,
    details
  };
}