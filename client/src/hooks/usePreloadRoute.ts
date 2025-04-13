/**
 * PKL-278651-PERF-0001.2-SPLIT
 * usePreloadRoute Hook
 * 
 * This hook provides utilities for preloading route components when a user
 * hovers over a link, improving perceived performance by loading components
 * before they're actually needed.
 */

import { useCallback } from 'react';
import {
  preloadProfilePages,
  preloadMatchPages,
  preloadTournamentPages,
  preloadEventPages,
  preloadAdminPages
} from '@/lazyComponents';

type RouteType = 
  | 'profile'
  | 'match'
  | 'tournament'
  | 'event'
  | 'admin';

/**
 * A hook that returns a function to preload components for a specific route type
 */
export function usePreloadRoute() {
  const preloadRoute = useCallback((type: RouteType) => {
    // Using a switch statement for easy extensibility
    switch (type) {
      case 'profile':
        preloadProfilePages();
        break;
      case 'match':
        preloadMatchPages();
        break;
      case 'tournament':
        preloadTournamentPages();
        break;
      case 'event':
        preloadEventPages();
        break;
      case 'admin':
        preloadAdminPages();
        break;
      default:
        console.warn(`No preload function defined for route type: ${type}`);
    }
  }, []);

  return preloadRoute;
}

/**
 * A utility that returns props for Link components to preload on hover
 */
export function getPreloadProps(type: RouteType) {
  return {
    onMouseEnter: () => {
      // Small timeout to prevent preloading if user is just passing over the link
      const timer = setTimeout(() => {
        const preload = usePreloadRoute();
        preload(type);
      }, 150);
      return () => clearTimeout(timer);
    },
    onFocus: () => {
      const preload = usePreloadRoute();
      preload(type);
    }
  };
}