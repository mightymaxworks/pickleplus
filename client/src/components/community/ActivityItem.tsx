/**
 * PKL-278651-COMM-0022-FEED
 * ActivityItem Component
 * 
 * This component renders a single activity feed item with appropriate styling
 * and interactions based on the activity type.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarClock, Star, Medal, Users, Trophy, MessageCircle, Heart, Award, User } from 'lucide-react';
import { ActivityFeedItem } from '@/hooks/use-activity-feed';
import { cn } from '@/lib/utils';

// Map of activity types to their respective icons
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  'match_recorded': <Trophy className="h-4 w-4 text-green-500" />,
  'achievement_unlocked': <Medal className="h-4 w-4 text-yellow-500" />,
  'tournament_joined': <Trophy className="h-4 w-4 text-blue-500" />,
  'tournament_created': <Trophy className="h-4 w-4 text-purple-500" />,
  'community_joined': <Users className="h-4 w-4 text-blue-500" />,
  'community_created': <Users className="h-4 w-4 text-green-500" />,
  'profile_updated': <User className="h-4 w-4 text-gray-500" />,
  'rank_up': <Star className="h-4 w-4 text-yellow-500" />,
  'xp_milestone': <Award className="h-4 w-4 text-purple-500" />,
  'comment': <MessageCircle className="h-4 w-4 text-blue-500" />,
  'like': <Heart className="h-4 w-4 text-red-500" />,
  'event_created': <CalendarClock className="h-4 w-4 text-green-500" />,
  'event_joined': <CalendarClock className="h-4 w-4 text-blue-500" />
};

// Default icon for unknown activity types
const DEFAULT_ICON = <CalendarClock className="h-4 w-4 text-gray-500" />;

interface ActivityItemProps {
  activity: ActivityFeedItem;
  onMarkAsRead?: (id: number) => void;
  interactive?: boolean;
}

/**
 * ActivityItem Component
 */
const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  onMarkAsRead,
  interactive = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the icon for this activity type
  const icon = ACTIVITY_ICONS[activity.type] || DEFAULT_ICON;
  
  // Format the timestamp as a relative time (e.g., "5 minutes ago")
  const formattedTime = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  
  // Generate link URL based on activity type and related entity
  const getLinkUrl = () => {
    if (!interactive) return undefined;
    
    switch (activity.type) {
      case 'match_recorded':
        return activity.relatedEntityId ? `/matches/${activity.relatedEntityId}` : '/matches';
      case 'achievement_unlocked':
        return '/achievements';
      case 'tournament_joined':
      case 'tournament_created':
        return activity.relatedEntityId ? `/tournaments/${activity.relatedEntityId}` : '/tournaments';
      case 'community_joined':
      case 'community_created':
        return activity.communityId ? `/communities/${activity.communityId}` : '/communities';
      case 'profile_updated':
        return `/profile/${activity.username}`;
      case 'rank_up':
        return '/leaderboard';
      case 'xp_milestone':
        return '/xp';
      case 'event_created':
      case 'event_joined':
        return activity.relatedEntityId ? `/events/${activity.relatedEntityId}` : '/events';
      default:
        return undefined;
    }
  };
  
  // Handle click on the activity item
  const handleClick = () => {
    if (!activity.isRead && onMarkAsRead) {
      onMarkAsRead(activity.id);
    }
  };
  
  const linkUrl = getLinkUrl();
  
  // The activity content component
  const ActivityContentComponent = () => (
    <div className="flex items-start gap-3">
      {/* User Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.avatar || undefined} alt={activity.username} />
        <AvatarFallback>
          {activity.displayName ? activity.displayName.charAt(0).toUpperCase() : activity.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold text-sm truncate">
            {activity.displayName || activity.username}
          </span>
          
          {/* Activity Type Badge */}
          <Badge 
            variant="outline" 
            className="text-xs ml-2 py-0 px-2 h-5 flex items-center gap-1"
          >
            {icon}
            <span className="capitalize">{activity.type.replace('_', ' ')}</span>
          </Badge>
        </div>
        
        {/* Activity Content */}
        <p className="text-sm text-muted-foreground break-words line-clamp-2">
          {activity.content}
        </p>
        
        {/* Community Badge (if applicable) */}
        {activity.communityName && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">
              {activity.communityName}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Timestamp */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedTime}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(activity.timestamp).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  return (
    <Card 
      className={cn(
        "w-full mb-2 transition-all duration-200",
        !activity.isRead && "border-l-4 border-l-primary",
        isHovered && "shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        {linkUrl ? (
          <Link to={linkUrl}>
            <ActivityContentComponent />
          </Link>
        ) : (
          <ActivityContentComponent />
        )}
      </CardContent>
      
      {/* Activity Actions */}
      {interactive && !activity.isRead && onMarkAsRead && (
        <CardFooter className="px-3 py-1 flex justify-end bg-muted/30 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(activity.id);
            }}
            className="h-6 text-xs"
          >
            Mark as read
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ActivityItem;