/**
 * PKL-278651-SEC-0002-TESTVIS - Passport ID Utilities
 * 
 * Utility functions for handling passport ID formatting and search
 */

/**
 * Normalizes a passport ID for search purposes
 * Removes the PKL- prefix and any dashes to create a standardized search format
 * 
 * @param passportId The passport ID to normalize
 * @returns The normalized passport ID for search purposes
 */
export function normalizePassportId(passportId: string | null | undefined): string {
  if (!passportId) return '';
  
  // Remove PKL- prefix and all dashes, and convert to uppercase
  return passportId.replace(/^PKL-/, '').replace(/-/g, '').toUpperCase();
}

/**
 * Extracts the 7-digit core passport code from a full passport ID
 * This is the format used for search and display in the UI
 * 
 * @param passportId The full passport ID (e.g., "PKL-1000-MM7")
 * @returns The 7-digit core passport code (e.g., "1000MM7")
 */
export function extractPassportCode(passportId: string | null | undefined): string | null {
  if (!passportId) return null;
  
  // For the newer format with more segments (PKL-YK876-5432-109)
  // Extract appropriate segments to form a 7-digit code
  const segments = passportId.replace(/^PKL-/, '').split('-');
  
  if (segments.length >= 2) {
    // For newer format with multiple segments
    // Take the first 3-5 characters from the first segment and
    // enough characters from the second segment to make 7 total
    const firstPart = segments[0].substring(0, 5);
    const secondPartLength = Math.min(7 - firstPart.length, segments[1].length);
    const secondPart = segments[1].substring(0, secondPartLength);
    
    return (firstPart + secondPart).toUpperCase();
  }
  
  // For the original format (PKL-1000-MM7)
  const normalized = normalizePassportId(passportId);
  return normalized.length > 7 ? normalized.substring(0, 7) : normalized;
}

/**
 * Checks if a search term matches a passport ID
 * Supports partial matching of any segment of the passport ID
 * 
 * @param passportId The full passport ID to check against
 * @param searchTerm The search term to look for
 * @returns True if the search term matches any part of the passport ID
 */
export function isPassportIdMatch(passportId: string | null | undefined, searchTerm: string): boolean {
  if (!passportId || !searchTerm || searchTerm.length < 2) return false;
  
  // Normalize both the passport ID and the search term
  const normalizedPassportId = normalizePassportId(passportId);
  const normalizedSearchTerm = searchTerm.replace(/-/g, '').toUpperCase();
  
  // Check if the search term is contained in the normalized passport ID
  return normalizedPassportId.includes(normalizedSearchTerm);
}