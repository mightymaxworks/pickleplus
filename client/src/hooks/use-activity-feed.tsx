/**
 * PKL-278651-COMM-0022-FEED
 * useActivityFeed Hook and Context Provider
 * 
 * This module provides a context and hook for accessing the real-time activity feed.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useWebSocket } from './use-websocket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for activity feed items
export interface ActivityFeedItem {
  id: number;
  type: string;
  userId: number;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  content: string;
  timestamp: string;
  communityId?: number | null;
  communityName?: string | null;
  metadata?: Record<string, any> | null;
  relatedEntityId?: number | null;
  relatedEntityType?: string | null;
  isRead: boolean;
}

// Activity feed context type
interface ActivityFeedContextType {
  activities: ActivityFeedItem[];
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  markAsRead: (activityId: number) => Promise<void>;
  hasMore: boolean;
  refreshActivities: () => Promise<void>;
}

// Create context with a default value
const ActivityFeedContext = createContext<ActivityFeedContextType | null>(null);

// Default page size for activity feed pagination
const DEFAULT_PAGE_SIZE = 10;

// ActivityFeedProvider component props
interface ActivityFeedProviderProps {
  children: ReactNode;
  communityId?: number;
  maxActivities?: number;
}

/**
 * Activity Feed Provider component
 */
export function ActivityFeedProvider({
  children,
  communityId,
  maxActivities = 50
}: ActivityFeedProviderProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // We'll use a simpler implementation for now since we're not using auth in this component yet
  const user = { id: 1 }; // Simplified user object
  const { toast } = useToast();
  
  // WebSocket topics to subscribe to
  const topics = [
    'community:activities', // Global activity feed
    ...(communityId ? [`community:${communityId}:activities`] : []) // Community-specific feed
  ];
  
  // Initialize WebSocket connection
  const ws = useWebSocket({
    subscribeTopics: topics,
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });
  
  /**
   * Fetch activities from the API
   */
  const fetchActivities = useCallback(async (pageNum: number, replace: boolean = false) => {
    try {
      setLoading(true);
      
      // Build API endpoint URL
      let url = `/api/activities?limit=${DEFAULT_PAGE_SIZE}&offset=${(pageNum - 1) * DEFAULT_PAGE_SIZE}`;
      
      // Add community filter if provided
      if (communityId) {
        url += `&communityId=${communityId}`;
      }
      
      // Make API request
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }
      
      // Parse response data
      const data = await response.json();
      
      // Update activities state
      setActivities(prevActivities => {
        if (replace) {
          return data;
        } else {
          // Filter out duplicates by ID
          const newActivities = data.filter(
            (activity: ActivityFeedItem) => !prevActivities.some(a => a.id === activity.id)
          );
          
          // Merge with existing activities
          const merged = [...prevActivities, ...newActivities];
          
          // Sort by timestamp (newest first)
          merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Limit to maxActivities
          return merged.slice(0, maxActivities);
        }
      });
      
      // Update pagination state
      setHasMore(data.length === DEFAULT_PAGE_SIZE);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: 'Error',
        description: 'Failed to load activity feed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [communityId, maxActivities, toast]);
  
  /**
   * Load more activities
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    await fetchActivities(nextPage, false);
    setPage(nextPage);
  }, [fetchActivities, hasMore, loading, page]);
  
  /**
   * Refresh activities from the beginning
   */
  const refreshActivities = useCallback(async () => {
    setPage(1);
    await fetchActivities(1, true);
  }, [fetchActivities]);
  
  /**
   * Mark an activity as read
   */
  const markAsRead = useCallback(async (activityId: number) => {
    try {
      const response = await apiRequest('POST', `/api/activities/${activityId}/read`);
      
      if (!response.ok) {
        throw new Error(`Failed to mark activity as read: ${response.statusText}`);
      }
      
      // Update the local state to mark the activity as read
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, isRead: true } 
            : activity
        )
      );
    } catch (err) {
      console.error('Error marking activity as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark activity as read',
        variant: 'destructive'
      });
    }
  }, [toast]);
  
  /**
   * Handle new activities from WebSocket
   */
  const handleNewActivity = useCallback((data: ActivityFeedItem) => {
    setActivities(prevActivities => {
      // Check if this activity already exists
      const exists = prevActivities.some(a => a.id === data.id);
      
      if (exists) {
        return prevActivities;
      }
      
      // Add new activity to the beginning of the list
      const newActivities = [data, ...prevActivities];
      
      // Sort by timestamp (newest first)
      newActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Limit to maxActivities
      return newActivities.slice(0, maxActivities);
    });
  }, [maxActivities]);
  
  // Subscribe to WebSocket topics
  useEffect(() => {
    // Global activity feed
    const globalUnsubscribe = ws.addTopicListener('community:activities', handleNewActivity);
    
    // Community-specific feed (if applicable)
    let communityUnsubscribe: (() => void) | undefined;
    if (communityId) {
      communityUnsubscribe = ws.addTopicListener(`community:${communityId}:activities`, handleNewActivity);
    }
    
    // Fetch initial activities
    fetchActivities(1, true);
    
    // Clean up subscriptions
    return () => {
      globalUnsubscribe();
      if (communityUnsubscribe) {
        communityUnsubscribe();
      }
    };
  }, [communityId, fetchActivities, handleNewActivity, ws]);
  
  // Create context value
  const contextValue: ActivityFeedContextType = {
    activities,
    loading,
    error,
    loadMore,
    markAsRead,
    hasMore,
    refreshActivities
  };
  
  return (
    <ActivityFeedContext.Provider value={contextValue}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

/**
 * Hook to access the activity feed context
 */
export function useActivityFeed() {
  const context = useContext(ActivityFeedContext);
  
  if (!context) {
    throw new Error('useActivityFeed must be used within an ActivityFeedProvider');
  }
  
  return context;
}

export default useActivityFeed;