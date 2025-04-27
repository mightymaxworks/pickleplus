/**
 * PKL-278651-PERF-0001-OPT
 * Performance Integration Example
 * 
 * This file demonstrates how to use the performance optimization utilities
 * in a React application.
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  initializePerformanceOptimizations, 
  usePreloadRoute,
  trackMetric
} from '@/utils/performance';
import { deviceCapabilities } from '@/utils/assetOptimizer';
import { QueryClient } from '@tanstack/react-query';
import { configureBatchedQueries } from '@/utils/apiRequestBatcher';

// Setup QueryClient with batched API requests
export function setupQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: !deviceCapabilities.connectionType.includes('slow'),
        retry: deviceCapabilities.connectionType === 'fast' ? 3 : 1,
      },
    },
  });
  
  // Configure batched API requests
  configureBatchedQueries(queryClient);
  
  return queryClient;
}

/**
 * Component to initialize performance optimizations
 * Should be used near the root of the application
 */
export function PerformanceOptimizer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    // Track the initial render time
    trackMetric('initial-render-start');
    
    // On component mount, mark the end of initial render
    return () => {
      trackMetric('initial-render-end');
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * Component to preload the next route as the user navigates
 * This should be included in layout components where navigation happens
 */
export function RoutePreloader() {
  const [location] = useLocation();
  
  // Preload common routes when entering the application
  useEffect(() => {
    // On app load, preload the most common routes
    const commonRoutes = ['/profile', '/matches', '/leaderboard'];
    
    commonRoutes.forEach(route => {
      // Don't preload the current route
      if (route !== location) {
        // Use a lower priority for routes that aren't the current one
        usePreloadRoute(route, { priority: 'low', triggerImmediately: true });
      }
    });
  }, [location]);
  
  return null;
}

/**
 * Hook for tracking route transition performance
 */
export function useRouteTransitionMetrics() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Mark the start of a route transition
    trackMetric(`route-transition-${location}-start`);
    
    // Cleanup function to mark the end of the transition
    return () => {
      trackMetric(`route-transition-${location}-end`);
    };
  }, [location]);
}

/**
 * Example of a navigation link that preloads the target route on hover
 */
export function PreloadingLink({ 
  to, 
  children, 
  className 
}: { 
  to: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const [currentLocation, navigate] = useLocation();
  const { triggerPreload } = usePreloadRoute(to, { priority: 'high' });
  
  // Current route highlighting
  const isActive = currentLocation === to;
  
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      onMouseEnter={triggerPreload}
      onTouchStart={triggerPreload}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </a>
  );
}

/**
 * Navigation menu with route preloading
 */
export function OptimizedNavMenu() {
  return (
    <nav className="flex space-x-4 py-2">
      <PreloadingLink 
        to="/" 
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Home
      </PreloadingLink>
      <PreloadingLink 
        to="/profile/modern" 
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Profile
      </PreloadingLink>
      <PreloadingLink 
        to="/matches" 
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Matches
      </PreloadingLink>
      <PreloadingLink 
        to="/leaderboard" 
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Leaderboard
      </PreloadingLink>
      <PreloadingLink 
        to="/events" 
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Events
      </PreloadingLink>
    </nav>
  );
}