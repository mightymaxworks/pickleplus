/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Lazy Loading Utils for Code Splitting
 * 
 * This file provides utilities for lazy loading components with a standardized
 * loading fallback to improve user experience when components are loading.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { lazy, ComponentType, Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component shown during component loading
export const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/**
 * Wraps a lazy loaded component with Suspense and a loading fallback
 * 
 * @param factory Factory function that imports the component
 * @returns Wrapped component
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): T & { preload: () => void } {
  const LazyComponent = lazy(factory);
  
  // Create the wrapper component with Suspense
  const Component = ((props: any) => (
    <Suspense fallback={<LazyLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )) as T;
  
  // Add preload function
  (Component as T & { preload: () => void }).preload = () => {
    factory();
  };
  
  return Component as T & { preload: () => void };
}