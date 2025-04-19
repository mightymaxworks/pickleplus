/**
 * PKL-278651-COMM-0022-FEED
 * Real-time Community Activity Feed Component
 * 
 * This component displays a feed of community activities and updates in real-time
 * using WebSockets.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, MessageSquare, Calendar, Users, Award, Trophy, ThumbsUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistance } from 'date-fns';

// Activity types and their icons
const activityIcons: Record<string, React.ReactNode> = {
  'post': <MessageSquare className="h-4 w-4" />,
  'comment': <MessageSquare className="h-4 w-4" />,
  'event': <Calendar className="h-4 w-4" />,
  'join': <Users className="h-4 w-4" />,
  'achievement': <Award className="h-4 w-4" />,
  'ranking': <Trophy className="h-4 w-4" />,
  'like': <ThumbsUp className="h-4 w-4" />,
  'default': <Activity className="h-4 w-4" />
};

interface ActivityItem {
  id: string;
  type: string;
  userId: number;
  username?: string;
  displayName?: string;
  avatar?: string;
  content: string;
  timestamp: string;
  communityId?: number;
  communityName?: string;
  metadata?: any;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

interface ActivityFeedProps {
  communityId?: number;
  maxItems?: number;
  className?: string;
  showHeader?: boolean;
  title?: string;
}

export function ActivityFeed({
  communityId,
  maxItems = 10,
  className,
  showHeader = true,
  title = "Activity Feed"
}: ActivityFeedProps) {
  const { user } = useAuth();
  const { isConnected, lastMessage, subscribe } = useWebSocket(user?.id);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to activity topics when connected
  useEffect(() => {
    if (isConnected && user) {
      // Subscribe to general activity feed
      const topics = ['community.activity'];
      
      // Also subscribe to specific community if provided
      if (communityId) {
        topics.push(`community.${communityId}.activity`);
      }
      
      subscribe(topics);
      console.log('[ActivityFeed] Subscribed to topics:', topics);
    }
  }, [isConnected, user, communityId, subscribe]);

  // Fetch initial activities
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const endpoint = communityId 
          ? `/api/community/${communityId}/activities` 
          : '/api/community/activities';
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        setActivities(data.slice(0, maxItems));
      } catch (error) {
        console.error('[ActivityFeed] Error fetching activities:', error);
        // Show empty state instead of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [communityId, maxItems]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'message' && lastMessage.topic?.includes('activity')) {
      const newActivity = lastMessage.data as ActivityItem;
      
      // Only add to feed if it's relevant to this component
      if (!communityId || newActivity.communityId === communityId) {
        // Add to beginning of array and maintain max items limit
        setActivities(prev => [newActivity, ...prev].slice(0, maxItems));
      }
    }
  }, [lastMessage, communityId, maxItems]);

  // Render activity item
  const renderActivity = (activity: ActivityItem) => {
    const icon = activityIcons[activity.type] || activityIcons.default;
    const timeAgo = formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true });
    
    return (
      <div key={activity.id} className="flex items-start space-x-4 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={activity.avatar} alt={activity.displayName || activity.username} />
          <AvatarFallback>{activity.displayName?.[0] || activity.username?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="font-medium">{activity.displayName || activity.username}</div>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 flex items-center gap-1">
                {icon}
                <span className="text-xs capitalize">{activity.type}</span>
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{new Date(activity.timestamp).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <p className="text-sm">{activity.content}</p>
          
          {activity.communityName && !communityId && (
            <Badge variant="secondary" className="mt-1">
              {activity.communityName}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {title}
              </CardTitle>
              
              <Badge variant={isConnected ? "success" : "destructive"} className="text-xs">
                {isConnected ? "Live" : "Offline"}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
        </>
      )}
      
      <CardContent className={cn("pt-4", !showHeader && "pt-6")}>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex flex-col space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            activities.map(renderActivity)
          ) : (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No activities to show yet</p>
              <p className="text-sm text-muted-foreground">New activities will appear here in real-time</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;