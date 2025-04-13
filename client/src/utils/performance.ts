/**
 * PKL-278651-PERF-0001-OPT
 * Performance Optimization Utilities
 * 
 * This file exports all performance-related utilities for easy access.
 */

// API Optimization
export * from './apiRequestBatcher';

// Asset Optimization
export * from './assetOptimizer';

// Bundle Size Optimization
export * from './bundleOptimizer';

// Component Render Optimization
export * from './optimizeComponent';

// Preloading Utilities for routes
export { usePreloadRoute } from '@/hooks/usePreloadRoute';

// Batched API Queries
export { useBatchedQueries } from '@/hooks/useBatchedQueries';

/**
 * Initialize performance optimizations
 * Call this function early in the application initialization
 */
export function initializePerformanceOptimizations() {
  console.log("[PERF] Initializing performance optimizations");
  
  // Setup performance metrics
  setupPerformanceMetrics();
  
  // Preload critical assets (e.g., fonts, main images)
  import('./assetOptimizer').then(mod => {
    mod.preloadCriticalAssets([
      // Add critical assets here
      '/src/assets/pickle-logo.png',
      '/src/assets/fonts/main.woff2',
    ]);
  });
  
  // Report performance metrics to console
  reportInitialMetrics();
}

/**
 * Setup performance metrics monitoring
 */
function setupPerformanceMetrics() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Mark the application initialization start
    performance.mark('app-init-start');
    
    // Listen for first contentful paint
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log(`[PERF] ${entry.name}: ${Math.round(entry.startTime)}ms`);
      });
    });
    
    observer.observe({ type: 'paint', buffered: true });
    
    // Track long tasks
    const longTaskObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.warn(`[PERF] Long task detected: ${Math.round(entry.duration)}ms`);
      });
    });
    
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    }
  }
}

/**
 * Report initial performance metrics
 */
function reportInitialMetrics() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Wait for the app to be fully loaded
    window.addEventListener('load', () => {
      // Mark the end of initialization
      performance.mark('app-init-end');
      
      // Measure the initialization time
      performance.measure('app-initialization', 'app-init-start', 'app-init-end');
      
      // Get the navigation timing
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        const metrics = {
          // Time to first byte (server response time)
          ttfb: Math.round(navigationTiming.responseStart),
          
          // DOM Content Loaded (initial HTML parsed)
          dcl: Math.round(navigationTiming.domContentLoadedEventEnd),
          
          // Load event (all resources loaded)
          loadComplete: Math.round(navigationTiming.loadEventEnd),
          
          // App initialization time
          appInit: Math.round(performance.getEntriesByName('app-initialization')[0]?.duration || 0),
        };
        
        console.log('[PERF] Initial metrics:', metrics);
      }
    });
  }
}

/**
 * Track a custom performance metric
 */
export function trackMetric(name: string, value?: number) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // If value is provided, log it directly
    if (value !== undefined) {
      console.log(`[PERF] ${name}: ${value}ms`);
      return;
    }
    
    // Otherwise use performance marks
    const markName = `${name}-start`;
    const measureName = name;
    
    // If we already have a mark with this name, measure the time since it was created
    if (performance.getEntriesByName(markName).length > 0) {
      performance.measure(measureName, markName);
      const duration = performance.getEntriesByName(measureName)[0].duration;
      console.log(`[PERF] ${name}: ${Math.round(duration)}ms`);
      
      // Clear the marks and measures to avoid memory leaks
      performance.clearMarks(markName);
      performance.clearMeasures(measureName);
    } else {
      // Otherwise, create a new mark
      performance.mark(markName);
    }
  }
}