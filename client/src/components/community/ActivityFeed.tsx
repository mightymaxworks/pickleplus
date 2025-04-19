/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Component
 * 
 * This component displays the activity feed with real-time updates via WebSocket.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import ActivityItem from './ActivityItem';
import { apiRequest } from '@/lib/queryClient';

// Activity type from schema
interface Activity {
  id: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  content: string;
  type: string;
  communityId: number | null;
  relatedEntityId: number | null;
  relatedEntityType: string | null;
  metadata: any | null;
  timestamp: string;
  isRead?: boolean; // Additional client-side property
  isNew?: boolean; // Additional client-side property for highlighting new items
}

interface ActivityFeedProps {
  communityId?: number;
  limit?: number;
  maxHeight?: number;
  showRefreshButton?: boolean;
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  communityId,
  limit = 10,
  maxHeight = 400,
  showRefreshButton = false,
  emptyMessage = "No activities to display"
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewActivities, setHasNewActivities] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // WebSocket subscription for real-time updates
  const websocket = useWebSocket({
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });
  
  const [lastMessage, setLastMessage] = useState<any>(null);
  const isConnected = websocket.connectionState === websocket.WebSocketState.OPEN;
  
  // Set up event subscriptions when connected
  useEffect(() => {
    if (isConnected) {
      // Subscribe to global activity feed
      websocket.subscribe(['community:activities']);
      
      // Subscribe to community-specific activity feed if communityId is provided
      if (communityId) {
        websocket.subscribe([`community:${communityId}:activities`]);
      }
      
      // Add topic listeners
      const removeGlobalListener = websocket.addTopicListener('community:activities', (message) => {
        setLastMessage(message);
      });
      
      let removeCommunityListener: (() => void) | null = null;
      if (communityId) {
        removeCommunityListener = websocket.addTopicListener(`community:${communityId}:activities`, (message) => {
          setLastMessage(message);
        });
      }
      
      // Clean up listeners when component unmounts or dependencies change
      return () => {
        removeGlobalListener();
        if (removeCommunityListener) {
          removeCommunityListener();
        }
      };
    }
  }, [isConnected, communityId, websocket]);
  
  // Fetch activities from the API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/activities', communityId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (communityId) {
        params.append('communityId', communityId.toString());
      }
      
      const response = await fetch(`/api/activities?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      return response.json();
    },
    enabled: !!user
  });
  
  // Initialize activities state from query data
  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);
  
  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'message') {
      try {
        const newActivity = JSON.parse(lastMessage.data);
        
        // Only process if it's an activity
        if (newActivity && newActivity.type) {
          // Add isNew flag to highlight new activities
          newActivity.isNew = true;
          
          // Add to the top of the list
          setActivities(prevActivities => {
            // Check if the activity already exists to avoid duplicates
            const existingActivity = prevActivities.find(a => a.id === newActivity.id);
            if (existingActivity) {
              return prevActivities;
            }
            
            return [newActivity, ...prevActivities];
          });
          
          // Set flag to show "New activities" notification if user has scrolled down
          if (feedRef.current) {
            if (feedRef.current.scrollTop > 50) {
              setHasNewActivities(true);
            }
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage]);
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setHasNewActivities(false);
      
      // Scroll to top after refresh
      if (feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
      
      toast({
        title: 'Refreshed',
        description: 'Activity feed has been updated',
        duration: 2000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh activity feed',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle marking an activity as read
  const handleMarkAsRead = async (activityId: number) => {
    try {
      const response = await apiRequest('POST', `/api/activities/${activityId}/read`);
      
      if (!response.ok) {
        throw new Error('Failed to mark activity as read');
      }
      
      // Update local state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, isRead: true } 
            : activity
        )
      );
      
      // Invalidate unread count query if it exists
      queryClient.invalidateQueries({ queryKey: ['/api/activities/unread-count'] });
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };
  
  // Scroll to top and reset new activities flag
  const scrollToTop = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setHasNewActivities(false);
    }
  };
  
  // Handle scroll event to remove the new activities indicator when user scrolls to top
  const handleScroll = () => {
    if (feedRef.current && feedRef.current.scrollTop < 10) {
      setHasNewActivities(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading activities</p>
        <p className="text-sm text-gray-500 mb-4">{error?.message || 'An unknown error occurred'}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  
  // Render empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <BellOff className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No activities yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        {showRefreshButton && (
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="mt-4"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* New activities indicator */}
      {hasNewActivities && (
        <div 
          className="sticky top-0 z-10 bg-primary text-white text-center py-2 rounded-t-md cursor-pointer shadow-md"
          onClick={scrollToTop}
        >
          New activities available. Click to view.
        </div>
      )}
      
      {/* Optional refresh button */}
      {showRefreshButton && (
        <div className="mb-3 flex justify-end">
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Activities feed */}
      <div 
        ref={feedRef}
        style={{ maxHeight: `${maxHeight}px` }}
        className="overflow-y-auto pr-1 space-y-4"
        onScroll={handleScroll}
      >
        {activities.map((activity) => (
          <ActivityItem 
            key={activity.id}
            activity={activity}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
      
      {/* WebSocket connection status indicator (only in development, hidden in production) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 text-xs text-right text-gray-500">
          WebSocket: {isConnected ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;