/**
 * PKL-278651-COMM-0019-MOBILE
 * Media Query Hook
 * 
 * This hook provides a way to check if a media query matches.
 * It's useful for responsive design in React components.
 */

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Initial check
    handleChange();

    // Listen for changes
    matchMedia.addEventListener("change", handleChange);

    // Clean up
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}