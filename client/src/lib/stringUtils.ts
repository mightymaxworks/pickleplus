/**
 * PKL-278651-UTIL-0001-STR - String Utility Functions
 * 
 * A collection of helper functions for string manipulation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

/**
 * Extracts initials from a name
 * 
 * @param name - Full name or display name
 * @param maxLength - Maximum number of initials to return (default: 2)
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';
  
  // Split the name by spaces
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '';
  
  // For single names or usernames, use the first two characters
  if (parts.length === 1) {
    return parts[0].substring(0, maxLength).toUpperCase();
  }
  
  // For multiple name parts, get the first character of each part
  const initials = parts
    .slice(0, maxLength)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
  
  return initials;
}

/**
 * Truncates a string to a maximum length with ellipsis
 * 
 * @param text - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formats a name for display
 * 
 * @param firstName - First name
 * @param lastName - Last name
 * @param fallback - Fallback name if both first and last are empty
 * @returns Formatted full name or fallback
 */
export function formatName(firstName?: string, lastName?: string, fallback: string = ''): string {
  if (!firstName && !lastName) return fallback;
  if (!firstName) return lastName || '';
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
}