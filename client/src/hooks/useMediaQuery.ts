/**
 * PKL-278651-ADMIN-0009-MOBILE
 * useMediaQuery Hook
 * 
 * Custom React hook for detecting if a media query matches.
 * This is used by the device detection utility to determine the current device type.
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Initialize with the match state if window is available (client-side)
  // Otherwise, default to false (server-side rendering)
  const getMatches = (): boolean => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    // Exit early if window is not available (server-side rendering)
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Update the state with the current value
    const handler = (): void => setMatches(mediaQuery.matches);
    
    // Add event listener for subsequent changes
    mediaQuery.addEventListener('change', handler);
    
    // Clean up function
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}