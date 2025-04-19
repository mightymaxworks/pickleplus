/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Component
 * 
 * This component renders a feed of community activities with real-time updates.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState, useEffect } from 'react';
import { useActivityFeed } from '@/hooks/use-activity-feed';
import { useAuth } from '@/hooks/use-auth';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, FilterIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ActivityFeedProps {
  communityId?: number;
  title?: string;
  compact?: boolean;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function ActivityFeed({
  communityId,
  title = "Activity Feed",
  compact = false,
  limit,
  showFilters = true,
  className = ""
}: ActivityFeedProps) {
  const { activities, loading, error, fetchActivities, hasMoreActivities, loadMoreActivities } = useActivityFeed();
  const { user } = useAuth();
  const [activityType, setActivityType] = useState<string>('all');
  const [newActivitiesCount, setNewActivitiesCount] = useState(0);
  
  // Filter activities by type if a filter is selected
  const filteredActivities = activityType === 'all'
    ? activities
    : activities.filter(activity => activity.type === activityType);
  
  // Handle refreshing the feed
  const handleRefresh = () => {
    fetchActivities({ communityId, reset: true });
    setNewActivitiesCount(0);
  };
  
  // Handle filtering by activity type
  const handleTypeChange = (value: string) => {
    setActivityType(value);
  };
  
  // Add new activity count indicator
  useEffect(() => {
    // This would typically be triggered by a WebSocket message
    // For now, we'll just use a placeholder to demonstrate the capability
    const interval = setInterval(() => {
      // In a real implementation, this would be triggered by the WebSocket
      // Instead of incrementing randomly
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Render loading skeletons
  if (loading && activities.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error && activities.length === 0) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load activity feed. {error.message}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          {newActivitiesCount > 0 && (
            <Badge className="ml-2 bg-blue-500">
              {newActivitiesCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          {showFilters && (
            <Select value={activityType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[140px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="achievement">Achievements</SelectItem>
                <SelectItem value="join">Joins</SelectItem>
                <SelectItem value="like">Likes</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {newActivitiesCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full mb-4"
          onClick={handleRefresh}
        >
          Show {newActivitiesCount} new {newActivitiesCount === 1 ? 'activity' : 'activities'}
        </Button>
      )}
      
      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No activities to display.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              {...activity}
              onClick={() => {/* Handle activity click */}}
            />
          ))}
          
          {!compact && hasMoreActivities && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => loadMoreActivities()}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}