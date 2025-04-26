/**
 * PKL-278651-PROF-0028-HOOK - Media Query Hook
 * 
 * A custom hook for responsive design, detecting if a media query matches.
 * Used for conditional rendering based on screen size.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * 
 * @param query - CSS media query string
 * @returns Boolean indicating if the query matches
 * 
 * @example
 * // Check if device is mobile
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * // Check if device is in dark mode
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set the initial value
      setMatches(media.matches);
      
      // Define the change handler
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add the listener
      media.addEventListener('change', listener);
      
      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);
  
  return matches;
}