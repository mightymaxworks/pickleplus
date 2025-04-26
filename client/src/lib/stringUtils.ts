/**
 * PKL-278651-PROF-0018-UTIL - String Utilities
 * 
 * Helper functions for string manipulations needed by the profile page.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

/**
 * Generates initials from user's name (display name, first/last, or username)
 * 
 * @param displayName - The user's display name
 * @param firstName - The user's first name
 * @param lastName - The user's last name
 * @param username - The user's username (fallback)
 * @returns A string with the user's initials (1-2 characters)
 */
export function getAvatarInitials(
  displayName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  username?: string
): string {
  // If display name is available, use it
  if (displayName && displayName.trim() !== '') {
    const nameParts = displayName.trim().split(/\s+/);
    
    if (nameParts.length >= 2) {
      // Take first letter of first and last parts
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else {
      // Just use the first letter
      return nameParts[0][0].toUpperCase();
    }
  }
  
  // If first and last name are available, use those
  if (firstName && firstName.trim() !== '') {
    if (lastName && lastName.trim() !== '') {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else {
      return firstName[0].toUpperCase();
    }
  }
  
  // Fall back to username
  if (username) {
    return username[0].toUpperCase();
  }
  
  // Last resort: just return 'U' for user
  return 'U';
}

/**
 * Truncates a string to a maximum length and adds ellipsis if needed
 * 
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength) + '...';
}

/**
 * Formats a date string to a human-readable format
 * 
 * @param dateString - Date string to format
 * @param format - Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'medium':
      default:
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
}