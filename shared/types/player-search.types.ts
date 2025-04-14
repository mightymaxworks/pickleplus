/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component
 * 
 * This file contains the TypeScript types for the player search functionality.
 */

/**
 * Player search result interface
 * Used for consistent typing across the application
 */
export interface PlayerSearchResult {
  id: number;
  username: string;
  displayName: string;
  fullName?: string | null;
  avatarUrl?: string;
  avatarInitials?: string;
  isFoundingMember?: boolean;
  passportId?: string;
  rating?: number | null;
}

/**
 * Player search options interface
 * Used to configure search parameters
 */
export interface PlayerSearchOptions {
  query: string;
  limit?: number;
  excludeUserIds?: number[];
}

/**
 * Player search response interface 
 * Used to handle successful and error responses consistently
 */
export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
  error?: string;
}