/**
 * PKL-278651-PERF-0001.5-SIZE
 * Bundle Size Reduction Utilities
 * 
 * This file provides utilities and helpers for reducing bundle sizes
 * through dynamic imports, tree-shaking, and optimization techniques.
 */

/**
 * Dynamic import utility for large libraries
 * Only import what's needed when it's needed
 */
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  onProgress?: (status: 'loading' | 'loaded' | 'error') => void
): Promise<T> {
  try {
    if (onProgress) onProgress('loading');
    const module = await importFn();
    if (onProgress) onProgress('loaded');
    return module.default;
  } catch (error) {
    if (onProgress) onProgress('error');
    console.error('Failed to dynamically import module:', error);
    throw error;
  }
}

/**
 * Tree-shakable error tracking
 * Only include essential error tracking functionality
 */
export const errorTracking = {
  captureError: (error: Error, context?: Record<string, any>): void => {
    console.error('[Error Tracking]', error, context);
    // This would be replaced with a real error tracking integration
    // in a production environment that supports tree-shaking
  },
  
  captureMessage: (message: string, context?: Record<string, any>): void => {
    console.warn('[Error Tracking]', message, context);
  }
};

/**
 * Tree-shakable analytics
 * Only include essential analytics functionality
 */
export const analytics = {
  trackEvent: (eventName: string, properties?: Record<string, any>): void => {
    console.log('[Analytics]', eventName, properties);
    // This would be replaced with a real analytics integration
    // in a production environment that supports tree-shaking
  },
  
  trackPageView: (pageName: string, properties?: Record<string, any>): void => {
    console.log('[Analytics] Page View:', pageName, properties);
  }
};

/**
 * Selective component imports 
 * A more efficient way to import only needed components from large libraries
 */
export async function importComponent<T>(path: string, componentName: string): Promise<T> {
  // This simulates a more efficient import approach that only pulls in the needed component
  const module = await import(/* @vite-ignore */ path);
  return module[componentName];
}

// Utility to delay the loading of non-critical resources
let deferredImports: Array<() => Promise<void>> = [];
let isDeferredImportRunning = false;

export function deferImport(importFn: () => Promise<void>): void {
  deferredImports.push(importFn);
  
  if (!isDeferredImportRunning) {
    startDeferredImports();
  }
}

function startDeferredImports(): void {
  isDeferredImportRunning = true;
  
  // Use requestIdleCallback if available, otherwise use setTimeout
  const scheduleNext = typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (window as any).requestIdleCallback
    : setTimeout;
  
  const processNextImport = async () => {
    if (deferredImports.length === 0) {
      isDeferredImportRunning = false;
      return;
    }
    
    const nextImport = deferredImports.shift();
    if (nextImport) {
      try {
        await nextImport();
      } catch (error) {
        console.error('Error in deferred import:', error);
      }
    }
    
    scheduleNext(processNextImport, { timeout: 1000 });
  };
  
  scheduleNext(processNextImport, { timeout: 1000 });
}

/**
 * Load polyfills only when needed
 */
export async function loadPolyfill(feature: string): Promise<void> {
  // Only load polyfills if they're actually needed
  if (typeof window !== 'undefined') {
    switch (feature) {
      case 'IntersectionObserver':
        if (!('IntersectionObserver' in window)) {
          await import('intersection-observer');
        }
        break;
      case 'ResizeObserver':
        if (!('ResizeObserver' in window)) {
          await import('resize-observer-polyfill');
        }
        break;
      // Add more cases as needed
    }
  }
}

/**
 * Optimized SVG loader - only imports the SVG when needed
 */
export function optimizedSvgImport(svgPath: string): () => Promise<string> {
  return async () => {
    try {
      const module = await import(/* @vite-ignore */ svgPath + '?raw');
      return module.default;
    } catch (error) {
      console.error(`Failed to load SVG from ${svgPath}:`, error);
      return '';
    }
  };
}

/**
 * Helper to replace heavy dependencies with lighter alternatives
 * based on the user's device capabilities
 */
export function useOptimizedDependency<T>(
  heavyImport: () => Promise<{ default: T }>,
  lightImport: () => Promise<{ default: T }>,
  shouldUseHeavy: () => boolean
): Promise<T> {
  return dynamicImport(shouldUseHeavy() ? heavyImport : lightImport);
}