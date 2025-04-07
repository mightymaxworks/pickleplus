/**
 * Player SDK
 * 
 * Provides a consistent interface for player-related operations
 * This SDK layer abstracts the API calls and handles errors gracefully
 */

import { User } from "@shared/schema";
import { apiRequest } from "../queryClient";

interface UserSearchResult {
  id: number;
  username: string;
  displayName: string | null;
  avatarInitials?: string;
  avatarUrl?: string | null;
  passportId?: string | null;
}

/**
 * Search for players by name or username
 * @param query Search query string (min 2 characters)
 * @param excludeUserId Optional user ID to exclude from results
 * @returns Array of matching players
 */
export async function searchPlayers(
  query: string, 
  excludeUserId?: number
): Promise<UserSearchResult[]> {
  try {
    // Client-side validation
    if (!query || query.length < 2) {
      console.log("PlayerSDK: Query too short, returning empty results");
      return [];
    }
    
    // Build the query parameters
    const params = new URLSearchParams({ q: query });
    if (excludeUserId !== undefined) {
      params.append("exclude", excludeUserId.toString());
    }
    
    // Log the API call
    console.log(`PlayerSDK: Searching players with query: ${query}`);
    
    try {
      // First try the dedicated player search endpoint
      const response = await apiRequest(
        "GET", 
        `/api/player/search?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const results = await response.json();
      console.log(`PlayerSDK: Found ${results.length} players matching "${query}"`);
      return results;
    } catch (apiError) {
      console.error("PlayerSDK: Error with player search API:", apiError);
      
      // Fallback to social module if available
      try {
        const { getModuleAPI } = await import("@/modules/moduleRegistration");
        
        if (typeof getModuleAPI === "function") {
          const socialModule = getModuleAPI("social");
          if (socialModule && typeof socialModule.searchPlayers === "function") {
            console.log("PlayerSDK: Falling back to social module searchPlayers");
            const results = await socialModule.searchPlayers(query);
            return results;
          }
        }
      } catch (moduleError) {
        console.error("PlayerSDK: Module fallback error:", moduleError);
      }
      
      // If all else fails, return empty results instead of throwing
      return [];
    }
  } catch (error) {
    console.error("PlayerSDK: Unexpected error in searchPlayers:", error);
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