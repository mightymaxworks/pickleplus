/**
 * PKL-278651-SRCH-0001-UNIFD
 * Shared Player Search Type Definitions
 * 
 * This file contains common type definitions used across server and client
 * for the unified player search functionality, ensuring type consistency.
 */

/**
 * Player search result interface - core definition used across API layers
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
 * Player search options for configuring search requests
 */
export interface PlayerSearchOptions {
  query: string;
  limit?: number;
  excludeUserIds?: number[];
}

/**
 * Player search response with results and optional error
 */
export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
  error?: string;
}