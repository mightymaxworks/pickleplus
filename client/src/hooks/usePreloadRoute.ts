/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Route Preloading Hook
 * 
 * This hook preloads code and data for routes before they are navigated to,
 * significantly improving perceived performance.
 */

import { useCallback, useEffect } from 'react';
import { useBatchedQueries } from '@/hooks/useBatchedQueries';
import { preloadCriticalAssets } from '@/utils/assetOptimizer';
import { deviceCapabilities } from '@/utils/assetOptimizer';

// Define route-specific preloading configuration
type PreloadConfig = {
  routePath: string;
  lazyComponents: Array<() => Promise<any>>;
  apiCalls?: Array<string>; // API endpoints to prefetch
  assetPaths?: Array<string>; // Critical assets to preload
};

// Route preload configuration mapping
// This should be expanded as new routes are added to the application
const routePreloadMap: Record<string, PreloadConfig> = {
  '/profile': {
    routePath: '/profile',
    lazyComponents: [
      () => import('@/pages/Profile'),
      () => import('@/components/profile/PersonalInformationCard'),
      () => import('@/components/profile/AchievementsCard'),
    ],
    apiCalls: ['/api/me', '/api/profile/completion', '/api/achievements/recent'],
    assetPaths: ['/src/assets/profile-background.png'],
  },
  '/tournaments': {
    routePath: '/tournaments',
    lazyComponents: [
      () => import('@/pages/Tournaments'),
      () => import('@/components/tournaments/TournamentList'),
    ],
    apiCalls: ['/api/tournaments/upcoming', '/api/tournaments/active'],
  },
  '/matches': {
    routePath: '/matches',
    lazyComponents: [
      () => import('@/pages/Matches'),
      () => import('@/components/matches/MatchHistory'),
    ],
    apiCalls: ['/api/match/recent'],
  },
  '/leaderboard': {
    routePath: '/leaderboard',
    lazyComponents: [
      () => import('@/pages/Leaderboard'),
      () => import('@/components/leaderboard/LeaderboardTable'),
    ],
    apiCalls: ['/api/multi-rankings/leaderboard'],
  },
  '/events': {
    routePath: '/events',
    lazyComponents: [
      () => import('@/pages/Events'),
      () => import('@/components/events/EventsList'),
      () => import('@/components/events/UniversalPassport'),
    ],
    apiCalls: ['/api/events/upcoming'],
  },
};

/**
 * Hook to preload components, data, and assets for a specific route
 * 
 * @param targetRoute The route path to preload (e.g., '/profile')
 * @param options Configuration options for preloading
 * @returns An object with the preloading status
 */
export function usePreloadRoute(
  targetRoute: string,
  options: {
    priority?: 'high' | 'medium' | 'low';
    triggerImmediately?: boolean;
    timeout?: number;
  } = {}
) {
  const { 
    priority = 'medium',
    triggerImmediately = false,
    timeout = 10000 
  } = options;
  
  const { get, prefetchQuery } = useBatchedQueries();
  
  // Flag to track if we're on a slow connection and should limit preloading
  const isSlowConnection = deviceCapabilities.connectionType === 'slow';
  
  // Preload function - this does the actual preloading work
  const preloadRoute = useCallback(async () => {
    // Find preload configuration for this route
    const preloadConfig = routePreloadMap[targetRoute];
    if (!preloadConfig) {
      console.warn(`No preload configuration found for route: ${targetRoute}`);
      return;
    }
    
    try {
      // Start preloading components
      const componentPromises = preloadConfig.lazyComponents.map(importFn => {
        return importFn().catch(err => {
          console.error(`Failed to preload component for route ${targetRoute}:`, err);
          // Swallow the error to prevent it from breaking preloading
        });
      });
      
      // For high priority routes or if not on a slow connection, preload API data
      if ((priority === 'high' || !isSlowConnection) && preloadConfig.apiCalls) {
        preloadConfig.apiCalls.forEach(apiPath => {
          prefetchQuery(apiPath).catch(err => {
            console.error(`Failed to prefetch data for ${apiPath}:`, err);
            // Swallow the error to prevent it from breaking preloading
          });
        });
      }
      
      // For high priority routes or if not on a slow connection, preload assets
      if ((priority === 'high' || !isSlowConnection) && preloadConfig.assetPaths) {
        preloadCriticalAssets(preloadConfig.assetPaths);
      }
      
      // Wait for component imports to complete
      await Promise.all(componentPromises);
      
      console.log(`[Route Preloader] Preloaded route: ${targetRoute}`);
    } catch (error) {
      console.error(`[Route Preloader] Error preloading route ${targetRoute}:`, error);
    }
  }, [targetRoute, priority, isSlowConnection, prefetchQuery]);
  
  // Trigger preloading either immediately or when the component mounts
  useEffect(() => {
    if (triggerImmediately) {
      preloadRoute();
    }
    
    // We can also use IdleCallback for low priority preloading
    if (!triggerImmediately && priority === 'low' && 'requestIdleCallback' in window) {
      const idleCallbackId = (window as any).requestIdleCallback(
        () => preloadRoute(),
        { timeout }
      );
      
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleCallbackId);
        }
      };
    }
    
    // For medium/high priority or browsers without IdleCallback, use regular timeouts
    if (!triggerImmediately && priority !== 'low') {
      const timeoutDelay = priority === 'high' ? 100 : 500;
      const timeoutId = setTimeout(preloadRoute, timeoutDelay);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    return undefined;
  }, [preloadRoute, triggerImmediately, priority, timeout]);
  
  return {
    triggerPreload: preloadRoute,
    preloadConfig: routePreloadMap[targetRoute],
  };
}

export default usePreloadRoute;