/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Context and Hook
 * 
 * This provides a context and hook for consuming the real-time activity feed data.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { useWebSocket } from './use-websocket';
import { useAuth } from './use-auth';
import { apiRequest } from '@/lib/queryClient';

interface ActivityItem {
  id: number;
  type: string;
  userId: number;
  username?: string;
  displayName?: string;
  avatar?: string;
  content: string;
  timestamp: string;
  communityId?: number;
  communityName?: string;
  metadata?: Record<string, any>;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

interface ActivityFeedContextValue {
  activities: ActivityItem[];
  loading: boolean;
  error: Error | null;
  fetchActivities: (options?: FetchOptions) => Promise<void>;
  markAsRead: (activityId: number) => Promise<void>;
  hasMoreActivities: boolean;
  loadMoreActivities: () => Promise<void>;
}

interface FetchOptions {
  communityId?: number;
  limit?: number;
  reset?: boolean;
}

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null);

interface ActivityFeedProviderProps {
  children: ReactNode;
  initialCommunityId?: number;
}

// Initial page size for activity feed
const PAGE_SIZE = 10;

export function ActivityFeedProvider({ children, initialCommunityId }: ActivityFeedProviderProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [currentCommunityId, setCurrentCommunityId] = useState<number | undefined>(initialCommunityId);
  
  const { user } = useAuth();
  const { subscribe, status } = useWebSocket();
  
  // Fetch activities from the API
  const fetchActivities = useCallback(async (options?: FetchOptions) => {
    try {
      setLoading(true);
      
      // Update community filter if specified
      if (options?.communityId !== undefined) {
        setCurrentCommunityId(options.communityId);
      }
      
      // Reset page counter if requested
      if (options?.reset) {
        setPage(1);
      }
      
      // Construct query parameters
      const limit = options?.limit || PAGE_SIZE;
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('page', page.toString());
      
      if (currentCommunityId !== undefined) {
        queryParams.append('communityId', currentCommunityId.toString());
      }
      
      // Fetch activities from the API
      const response = await apiRequest(
        'GET', 
        `/api/community/activities?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched activities
      setActivities(prev => {
        if (options?.reset) {
          return data.activities;
        } else {
          // Filter out duplicates
          const existingIds = new Set(prev.map(a => a.id));
          const newActivities = data.activities.filter(
            (activity: ActivityItem) => !existingIds.has(activity.id)
          );
          return [...prev, ...newActivities];
        }
      });
      
      // Check if there are more activities
      setHasMore(data.hasMore || false);
      
      setError(null);
    } catch (err) {
      console.error('[ActivityFeed] Error fetching activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [currentCommunityId, page]);
  
  // Load more activities
  const loadMoreActivities = useCallback(async () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);
  
  // Mark an activity as read
  const markAsRead = useCallback(async (activityId: number) => {
    try {
      await apiRequest('POST', `/api/community/activities/${activityId}/read`);
      
      // Update local state to mark as read
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, isRead: true } 
            : activity
        )
      );
    } catch (err) {
      console.error('[ActivityFeed] Error marking activity as read:', err);
    }
  }, []);
  
  // Initial fetch of activities
  useEffect(() => {
    if (user) {
      fetchActivities({ reset: true });
    }
  }, [user, fetchActivities]);
  
  // Fetch activities when page changes
  useEffect(() => {
    if (page > 1) {
      fetchActivities();
    }
  }, [page, fetchActivities]);
  
  // Subscribe to real-time activity updates
  useEffect(() => {
    if (status === 'connected' && user) {
      const topic = currentCommunityId 
        ? `community:${currentCommunityId}:activities` 
        : 'community:activities';
        
      // Subscribe to activities for the current community or all activities
      const unsubscribe = subscribe(topic, (newActivity) => {
        setActivities(prev => {
          // Check if the activity already exists
          if (prev.some(activity => activity.id === newActivity.id)) {
            return prev;
          }
          // Add new activity at the beginning of the list
          return [newActivity, ...prev];
        });
      });
      
      return unsubscribe;
    }
  }, [status, user, currentCommunityId, subscribe]);
  
  const contextValue: ActivityFeedContextValue = {
    activities,
    loading,
    error,
    fetchActivities,
    markAsRead,
    hasMoreActivities: hasMore,
    loadMoreActivities
  };
  
  return (
    <ActivityFeedContext.Provider value={contextValue}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

export function useActivityFeed() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeed must be used within an ActivityFeedProvider');
  }
  return context;
}