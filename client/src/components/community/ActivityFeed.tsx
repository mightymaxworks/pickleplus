/**
 * PKL-278651-COMM-0022-FEED
 * ActivityFeed Component
 * 
 * This component displays a list of activity feed items with infinite scrolling
 * and provides a way to mark items as read.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useRef, useEffect, useState } from 'react';
import { useActivityFeed, ActivityFeedProvider } from '@/hooks/use-activity-feed';
import ActivityItem from './ActivityItem';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  communityId?: number;
  maxHeight?: string | number;
  className?: string;
  maxActivities?: number;
  showRefreshButton?: boolean;
  emptyMessage?: string;
}

/**
 * ActivityFeedContent Component (Internal)
 * This component handles the actual display of activities
 */
const ActivityFeedContent: React.FC<Omit<ActivityFeedProps, 'maxActivities'>> = ({
  maxHeight = '400px',
  className,
  showRefreshButton = true,
  emptyMessage = 'No activities yet'
}) => {
  const { 
    activities, 
    loading, 
    error, 
    loadMore, 
    hasMore, 
    markAsRead,
    refreshActivities
  } = useActivityFeed();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Handle scroll to load more activities
  const handleScroll = () => {
    if (!scrollRef.current || loading || isLoadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // If user scrolled to the bottom (with a 50px buffer), load more
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setIsLoadingMore(true);
      loadMore().finally(() => setIsLoadingMore(false));
    }
  };
  
  // Set up scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loading, isLoadingMore]);
  
  // Show loading state
  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary/70" />
        <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
      </div>
    );
  }
  
  // Show error state
  if (error && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-destructive mb-2">Failed to load activities</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refreshActivities()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }
  
  // Show empty state
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={cn("relative", className)}>
      {/* Refresh button */}
      {showRefreshButton && (
        <div className="absolute top-0 right-0 z-10 p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refreshActivities()}
            className="h-8 w-8 p-0"
            aria-label="Refresh activities"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Activity list */}
      <ScrollArea 
        className={cn("pr-4", typeof maxHeight === 'string' ? maxHeight : `${maxHeight}px`)} 
        ref={scrollRef}
      >
        <div className="space-y-2 py-2">
          {activities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              activity={activity}
              onMarkAsRead={markAsRead}
            />
          ))}
          
          {/* Loading more indicator */}
          {(isLoadingMore || (loading && activities.length > 0)) && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary/70" />
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && activities.length > 0 && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              No more activities to load
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * ActivityFeed Component (Public)
 * This is a wrapper component that provides the ActivityFeedProvider context
 */
const ActivityFeed: React.FC<ActivityFeedProps> = (props) => {
  return (
    <ActivityFeedProvider 
      communityId={props.communityId}
      maxActivities={props.maxActivities}
    >
      <ActivityFeedContent {...props} />
    </ActivityFeedProvider>
  );
};

export default ActivityFeed;