/**
 * PKL-278651-PERF-0001.1-CACHE
 * User Data Caching System
 * 
 * This context provides a centralized cache for user data to reduce redundant API calls.
 * Features:
 * - Global cache for current user data
 * - Intelligent cache invalidation
 * - Predicate-based selective refreshing
 * - Expiry timeouts for stale data
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getQueryFn } from '@/lib/queryClient';
import { EnhancedUser } from '@/types/enhanced-user';

// Cache timeout (15 minutes)
const CACHE_EXPIRY_MS = 15 * 60 * 1000;

interface UserDataContextType {
  userData: EnhancedUser | null;
  isLoading: boolean;
  error: Error | null;
  refreshUserData: () => Promise<void>;
  invalidateCache: (predicate?: (data: EnhancedUser) => boolean) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [userData, setUserData] = useState<EnhancedUser | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch user data from API
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryFn = getQueryFn({ on401: 'returnNull' });
      const data = await queryFn({ queryKey: ['/api/auth/current-user'] });
      
      if (!data) {
        // This is not necessarily an error - user might be logged out
        setUserData(null);
        setLastFetched(Date.now());
        setError(null);
        return;
      }
      
      console.log('[UserDataContext] User data refreshed from API');
      setUserData(data as EnhancedUser);
      setLastFetched(Date.now());
      setError(null);
    } catch (err) {
      console.error('[UserDataContext] Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data (public method)
  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Invalidate cache based on optional predicate
  const invalidateCache = useCallback((predicate?: (data: EnhancedUser) => boolean) => {
    // If no predicate or predicate returns true, invalidate the cache
    if (!predicate || (userData && predicate(userData))) {
      console.log('[UserDataContext] Cache invalidated', predicate ? 'by predicate' : 'completely');
      setLastFetched(0); // Force a refresh on next check
    }
  }, [userData]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Set up periodic cache validation
  useEffect(() => {
    const checkCacheValidity = () => {
      const now = Date.now();
      if (now - lastFetched > CACHE_EXPIRY_MS) {
        console.log('[UserDataContext] Cache expired, refreshing data');
        fetchUserData();
      }
    };

    // Check every minute
    const interval = setInterval(checkCacheValidity, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchUserData, lastFetched]);

  return (
    <UserDataContext.Provider value={{ 
      userData, 
      isLoading, 
      error, 
      refreshUserData, 
      invalidateCache 
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

// Custom hook for consuming the context
export function useUserData() {
  const context = useContext(UserDataContext);
  
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  
  return context;
}