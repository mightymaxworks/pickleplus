/**
 * PKL-278651-UI-0005-HOOK - useMediaQuery Hook
 * 
 * Custom hook for responsive media queries that updates when viewport changes.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect } from 'react';

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with current match state or false if SSR
  const getMatches = (): boolean => {
    // Check if window is available (browser environment)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  // Update matches state whenever the media query result changes
  useEffect(() => {
    // Get initial match
    const matchMedia = window.matchMedia(query);
    setMatches(matchMedia.matches);

    // Create handler to update state
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add event listener for changes
    if (matchMedia.addEventListener) {
      // Modern browsers
      matchMedia.addEventListener('change', handleChange);
      return () => {
        matchMedia.removeEventListener('change', handleChange);
      };
    } else {
      // Fallback for older browsers
      matchMedia.addListener(handleChange);
      return () => {
        matchMedia.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
}