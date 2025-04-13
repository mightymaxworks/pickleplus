/**
 * PKL-278651-PERF-0001.3-MEMO
 * Component Render Optimization Utilities
 * 
 * This file provides utilities for optimizing component renders with memoization
 * and efficient props comparison.
 */

import React, { memo, useCallback, useMemo } from 'react';

// Types for comparing functions
type CompareFunction<T> = (prev: T, next: T) => boolean;

// Default shallow comparison for primitive props and arrays
function defaultPropsAreEqual<P extends object>(prevProps: P, nextProps: P): boolean {
  if (Object.is(prevProps, nextProps)) return true;
  
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  return prevKeys.every(key => {
    const prevValue = prevProps[key as keyof P];
    const nextValue = nextProps[key as keyof P];
    
    // Handle arrays (shallow comparison of elements)
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) return false;
      return prevValue.every((val, i) => Object.is(val, nextValue[i]));
    }
    
    // Handle functions (always consider them equal to prevent re-renders)
    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      return true;
    }
    
    // Simple equality check for other types
    return Object.is(prevValue, nextValue);
  });
}

/**
 * Enhanced memo HOC with configurable comparison
 */
export function memoWithConfig<P extends object>(
  Component: React.ComponentType<P>,
  areEqual: CompareFunction<P> = defaultPropsAreEqual,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> {
  const MemoizedComponent = memo(Component, areEqual);
  
  if (displayName) {
    MemoizedComponent.displayName = `Memo(${displayName})`;
  } else if (Component.displayName || Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  }
  
  return MemoizedComponent;
}

/**
 * HOC to optimize a component with default memoization
 */
export function optimizeComponent<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memoWithConfig(Component, defaultPropsAreEqual, displayName);
}

/**
 * HOC to optimize a component that only needs to render once
 */
export function renderOnce<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> {
  // Always return true to prevent re-renders
  const neverRerender = () => true;
  return memoWithConfig(Component, neverRerender, displayName || 'RenderOnce');
}

/**
 * Optimized version of creating callback functions
 * This wrapper ensures the callback is wrapped in useCallback automatically
 */
export function createOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // @ts-ignore - required to make this work with generics
  return useCallback(callback, deps);
}

/**
 * Optimized version of computing derived values
 * This wrapper ensures the value is wrapped in useMemo automatically
 */
export function createOptimizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}