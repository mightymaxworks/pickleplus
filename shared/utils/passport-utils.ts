/**
 * PKL-278651-SEC-0002-TESTVIS - Passport ID Utilities
 * 
 * Utility functions for handling passport ID formatting and search
 */

/**
 * Generates a random 7-character alphanumeric passport ID
 * Format: 7 random alphanumeric characters (letters and numbers only)
 * 
 * @returns A new random 7-character passport ID
 */
export function generatePassportId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters (I, O, 0, 1)
  let result = '';
  
  // Generate 7 random characters
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Normalizes a passport ID for search purposes
 * Removes any prefixes, dashes, or formatting to create a clean 7-character string
 * 
 * @param passportId The passport ID to normalize
 * @returns The normalized passport ID for search purposes
 */
export function normalizePassportId(passportId: string | null | undefined): string {
  if (!passportId) return '';
  
  // Remove PKL- prefix, dashes, and any non-alphanumeric characters, then convert to uppercase
  const normalized = passportId
    .replace(/^PKL-/, '')
    .replace(/-/g, '')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase();
  
  // Limit to 7 characters
  return normalized.substring(0, 7);
}

/**
 * Extracts a clean 7-character passport ID from any format
 * 
 * @param passportId The passport ID in any format
 * @returns A clean 7-character passport ID
 */
export function extractPassportCode(passportId: string | null | undefined): string | null {
  if (!passportId) return null;
  
  const normalized = normalizePassportId(passportId);
  
  // Ensure exactly 7 characters by padding if needed
  if (normalized.length < 7) {
    return normalized.padEnd(7, '0');
  }
  
  return normalized;
}

/**
 * Checks if a search term matches a passport ID
 * Supports partial matching of the passport ID
 * 
 * @param passportId The passport ID to check against
 * @param searchTerm The search term to look for
 * @returns True if the search term matches any part of the passport ID
 */
export function isPassportIdMatch(passportId: string | null | undefined, searchTerm: string): boolean {
  if (!passportId || !searchTerm || searchTerm.length < 2) return false;
  
  // Normalize both the passport ID and the search term
  const normalizedPassportId = normalizePassportId(passportId);
  const normalizedSearchTerm = searchTerm.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Check if the search term is contained in the normalized passport ID
  return normalizedPassportId.includes(normalizedSearchTerm);
}