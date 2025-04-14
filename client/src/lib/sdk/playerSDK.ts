/**
 * Player SDK
 * 
 * Provides a consistent interface for player-related operations
 * This SDK layer abstracts the API calls and handles errors gracefully
 */

import { User } from "@shared/schema";
import { apiRequest } from "../queryClient";
import { SocialModuleAPI } from "@/modules/types";
import { 
  PlayerSearchResult, 
  PlayerSearchOptions, 
  PlayerSearchResponse 
} from "@shared/types/player-search.types";
import { searchPlayers as unifiedSearchPlayers } from "@/api/playerSearchApi";

// Re-export the Player Search types to maintain compatibility
export type UserSearchResult = PlayerSearchResult;

/**
 * Search for players by name or username
 * 
 * This function is for backward compatibility with existing code.
 * All new code should use the unified player search component from 
 * @/api/playerSearchApi directly.
 * 
 * @param query Search query string (min 2 characters)
 * @param excludeUserId Optional user ID to exclude from results
 * @returns Array of matching players
 */
export async function searchPlayers(
  query: string, 
  excludeUserId?: number
): Promise<UserSearchResult[]> {
  // Convert the legacy parameters to the new format
  const searchOptions: PlayerSearchOptions = {
    query,
    excludeUserIds: excludeUserId ? [excludeUserId] : undefined
  };
  
  try {
    // Use the unified search component
    const response: PlayerSearchResponse = await unifiedSearchPlayers(searchOptions);
    
    if (response.error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("PlayerSDK: Search error:", response.error);
      }
      return [];
    }
    
    return response.results;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("PlayerSDK: Unexpected error in searchPlayers:", error);
    }
    return []; // Return empty array instead of throwing to prevent UI breakage
  }
}

/**
 * Get player by ID
 * @param id Player ID
 * @returns Player object or null if not found
 */
export async function getPlayer(id: number): Promise<User | null> {
  try {
    const response = await apiRequest("GET", `/api/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("PlayerSDK: Error fetching player:", error);
    return null;
  }
}