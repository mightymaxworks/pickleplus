/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component
 * 
 * This file contains the API client functions for player search.
 */

// Import the PlayerSearchResult type from the component for now
import { PlayerSearchResult } from '../components/match/PlayerSearchInput';

/**
 * Player search options interface
 */
export interface PlayerSearchOptions {
  query: string;
  limit?: number;
  excludeUserIds?: number[];
}

/**
 * Player search response interface
 */
export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
  error?: string;
}

/**
 * Searches for players using the unified player search API
 * 
 * @param options Search options including query and limit
 * @returns Promise with search results or error
 */
export async function searchPlayers(
  options: PlayerSearchOptions
): Promise<PlayerSearchResponse> {
  const { query, limit = 15, excludeUserIds = [] } = options;
  
  try {
    // Don't search if query is too short
    if (!query || query.length < 2) {
      return { results: [] };
    }
    
    // Build the query URL with parameters
    const url = `/api/player/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`;
    
    // Make the API request
    const response = await fetch(url);
    
    // Handle non-ok responses
    if (!response.ok) {
      console.error(`[PlayerSearch] API error: ${response.status}`);
      return { 
        results: [],
        error: `API error: ${response.status}` 
      };
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Filter out excluded user IDs if provided
    const filteredResults = excludeUserIds.length > 0
      ? data.filter((user: PlayerSearchResult) => !excludeUserIds.includes(user.id))
      : data;
    
    return { 
      results: filteredResults
    };
  } catch (error) {
    console.error('[PlayerSearch] Error searching players:', error);
    return { 
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error searching for players'
    };
  }
}