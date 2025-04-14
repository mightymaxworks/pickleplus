/**
 * PKL-278651-SRCH-0001-UNIFD
 * Player Search API Client
 * 
 * This file contains the SDK layer for the unified player search component.
 * It provides consistent interfaces for player search operations.
 */

/**
 * Player search options interface
 */
export interface PlayerSearchOptions {
  query: string;
  limit?: number;
  excludeUserIds?: number[];
}

/**
 * Player search result interface
 */
export interface PlayerSearchResult {
  id: number;
  username: string;
  displayName: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  avatarInitials?: string | null;
  isFoundingMember?: boolean;
  passportId?: string | null;
  rating?: number | null;
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
  try {
    const { query, limit = 15, excludeUserIds = [] } = options;
    
    // Don't search if query is too short
    if (!query || query.length < 2) {
      return { results: [] };
    }
    
    // Build search URL with parameters
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    // Make the API request to the non-authenticated endpoint
    const response = await fetch(`/api/player/search?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Player search error:', errorData);
      return { 
        results: [],
        error: errorData.error || 'Error searching for players' 
      };
    }
    
    // Parse the response and handle data
    const data = await response.json();
    
    // Filter out excluded user IDs if provided
    const results = excludeUserIds.length > 0 
      ? data.filter((user: PlayerSearchResult) => !excludeUserIds.includes(user.id))
      : data;
    
    return { results };
  } catch (error) {
    console.error('Player search failed:', error);
    return { 
      results: [],
      error: error instanceof Error ? error.message : 'Search failed' 
    };
  }
}