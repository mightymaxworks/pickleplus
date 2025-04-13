/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Code Splitting Utilities
 * 
 * This file provides utilities for implementing code splitting using React.lazy()
 * with appropriate loading states and error handling.
 */

import React, { Suspense } from 'react';

// Loading fallback component shown during lazy loading
export const LazyLoadingFallback = () => (
  <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error boundary component for handling lazy loading errors
export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[LazyErrorBoundary] Error caught:', error);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 rounded-md bg-destructive/10 border border-destructive">
          <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading this component.</p>
          <details className="text-sm mb-4">
            <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
            <pre className="p-4 bg-background rounded border border-border overflow-auto">
              {this.state.error?.toString() || 'Unknown error'}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for lazy-loading components with error boundary
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> & { preload: () => Promise<any> } {
  const LazyComponent = React.lazy(importFunc);
  
  // Add preload function to component
  const componentWithPreload = LazyComponent as React.LazyExoticComponent<T> & { preload: () => Promise<any> };
  componentWithPreload.preload = importFunc;
  
  return componentWithPreload;
}

// Utility to preload a component
export function preloadComponent(component: { preload: () => Promise<any> }) {
  return component.preload();
}