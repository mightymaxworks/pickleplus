/**
 * PKL-278651-BOUNCE-0006-MOBILE - Mobile Optimization
 * 
 * A React hook for using media queries in components
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { useState, useEffect } from 'react';

/**
 * Hook for using media queries in React components
 * @param query CSS media query string (e.g. "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if available
  const getMatches = (query: string): boolean => {
    // Check for window to handle SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Update the state initially and on changes
    const updateMatches = (): void => {
      setMatches(mediaQuery.matches);
    };
    
    // Set up listeners for changes
    mediaQuery.addEventListener('change', updateMatches);
    
    // Call once initially to set the state correctly
    updateMatches();
    
    // Clean up on unmount
    return () => {
      mediaQuery.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;