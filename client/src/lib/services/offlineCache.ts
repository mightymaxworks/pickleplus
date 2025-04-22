/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * Offline Data Caching Service
 * 
 * This service provides functionality to cache API data locally for offline access,
 * with cache invalidation and synchronization capabilities when connectivity is restored.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { useState, useEffect } from 'react';

// Type definition for cached data
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  queryKey: string | string[];
  expiresAt: number;
}

// Constants
const STORAGE_PREFIX = 'bounce_offline_';
const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper functions
const getCacheKey = (queryKey: string | string[]): string => {
  const key = Array.isArray(queryKey) ? queryKey.join('_') : queryKey;
  return `${STORAGE_PREFIX}${key}`;
};

const isExpired = (entry: CacheEntry<any>): boolean => {
  return Date.now() > entry.expiresAt;
};

// Main cache operations
export const cacheData = <T>(
  queryKey: string | string[],
  data: T,
  expiryMs: number = DEFAULT_EXPIRY
): void => {
  try {
    const cacheKey = getCacheKey(queryKey);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      queryKey,
      expiresAt: Date.now() + expiryMs,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`[OfflineCache] Data cached for key: ${cacheKey}`);
  } catch (error) {
    console.error('[OfflineCache] Error caching data:', error);
  }
};

export const getCachedData = <T>(queryKey: string | string[]): T | null => {
  try {
    const cacheKey = getCacheKey(queryKey);
    const stored = localStorage.getItem(cacheKey);
    
    if (!stored) return null;
    
    const entry: CacheEntry<T> = JSON.parse(stored);
    
    if (isExpired(entry)) {
      localStorage.removeItem(cacheKey);
      console.log(`[OfflineCache] Cache expired for key: ${cacheKey}`);
      return null;
    }
    
    console.log(`[OfflineCache] Cache hit for key: ${cacheKey}`);
    return entry.data;
  } catch (error) {
    console.error('[OfflineCache] Error retrieving cached data:', error);
    return null;
  }
};

export const clearCache = (queryKey?: string | string[]): void => {
  try {
    if (queryKey) {
      // Clear specific cache entry
      const cacheKey = getCacheKey(queryKey);
      localStorage.removeItem(cacheKey);
      console.log(`[OfflineCache] Cleared cache for key: ${cacheKey}`);
    } else {
      // Clear all cache entries with our prefix
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => {
          localStorage.removeItem(key);
        });
      console.log('[OfflineCache] Cleared all cache entries');
    }
  } catch (error) {
    console.error('[OfflineCache] Error clearing cache:', error);
  }
};

// Network status hook for tracking online/offline state
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isOnline) {
        setWasOffline(true);
        // Reset wasOffline after a delay to allow UI to show sync notification
        setTimeout(() => setWasOffline(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return { isOnline, wasOffline };
};

// Hook for managing cached data with real-time updates when online
export function useCachedQuery<T>(
  queryKey: string | string[],
  fetchFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    refetchOnReconnect?: boolean;
    expiryMs?: number;
  } = {}
) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  const { enabled = true, refetchOnReconnect = true, expiryMs = DEFAULT_EXPIRY } = options;

  useEffect(() => {
    const loadData = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to get data from cache first
        const cachedData = getCachedData<T>(queryKey);
        
        if (cachedData) {
          setData(cachedData);
          setIsStale(true);
          setIsLoading(false);
        }

        // If online, fetch fresh data
        if (isOnline) {
          const freshData = await fetchFn();
          setData(freshData);
          setIsStale(false);
          
          // Cache the fresh data
          cacheData(queryKey, freshData, expiryMs);
        } else if (!cachedData) {
          // If offline and no cached data
          setError(new Error('No internet connection and no cached data available'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        
        // If error occurs while fetching, use cached data if available
        if (!data) {
          const cachedData = getCachedData<T>(queryKey);
          if (cachedData) {
            setData(cachedData);
            setIsStale(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Refetch when coming back online after being offline
    if (wasOffline && refetchOnReconnect) {
      loadData();
    }
  }, [queryKey, fetchFn, enabled, isOnline, wasOffline, refetchOnReconnect, expiryMs]);

  return { data, isLoading, error, isStale, isOnline };
}

// Component props for the offline notification
export interface OfflineIndicatorProps {
  isOnline: boolean;
  wasOffline: boolean;
  isStale: boolean;
}

export default {
  cacheData,
  getCachedData,
  clearCache,
  useNetworkStatus,
  useCachedQuery
};