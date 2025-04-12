/**
 * PKL-278651-TOURN-0013-API
 * Tournament Bracket API Client
 * 
 * This module provides a client for the tournament bracket API endpoints.
 */
import { apiRequest } from '@/lib/queryClient';
import { BracketData } from '../types';

/**
 * Get a single bracket with all its matches and rounds
 */
export async function getBracket(id: number): Promise<BracketData> {
  console.log(`[API][Bracket] Fetching bracket with ID ${id}`);
  try {
    const response = await apiRequest('GET', `/api/brackets/${id}`);
    const data = await response.json();
    console.log(`[API][Bracket] Successfully fetched bracket ${id}`);
    return data as BracketData;
  } catch (error) {
    console.error(`[API][Bracket] Error fetching bracket ${id}:`, error);
    throw error;
  }
}

/**
 * Get all brackets for a tournament
 */
export async function getTournamentBrackets(tournamentId: number) {
  console.log(`[API][Bracket] Fetching brackets for tournament ${tournamentId}`);
  try {
    const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/brackets`);
    const data = await response.json();
    console.log(`[API][Bracket] Successfully fetched ${data.length} brackets for tournament ${tournamentId}`);
    return data;
  } catch (error) {
    console.error(`[API][Bracket] Error fetching brackets for tournament ${tournamentId}:`, error);
    throw error;
  }
}

/**
 * Create a bracket for a tournament
 */
export async function createBracket(tournamentId: number, bracketData: any) {
  console.log(`[API][Bracket] Creating bracket for tournament ${tournamentId}`);
  try {
    const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/brackets`, bracketData);
    const data = await response.json();
    console.log(`[API][Bracket] Successfully created bracket for tournament ${tournamentId}`);
    return data;
  } catch (error) {
    console.error(`[API][Bracket] Error creating bracket for tournament ${tournamentId}:`, error);
    throw error;
  }
}

/**
 * Record a match result
 */
export async function recordMatchResult(matchId: number, resultData: any) {
  console.log(`[API][Bracket] Recording result for match ${matchId}`);
  try {
    const response = await apiRequest('POST', `/api/brackets/matches/${matchId}/result`, resultData);
    const data = await response.json();
    console.log(`[API][Bracket] Successfully recorded result for match ${matchId}`);
    return data;
  } catch (error) {
    console.error(`[API][Bracket] Error recording result for match ${matchId}:`, error);
    throw error;
  }
}