/**
 * PKL-278651-COMM-0022-FEED
 * Activity Item Component
 * 
 * This component displays a single activity feed item with modern UI design,
 * matching the community card visual style with banner images and avatars.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, Users, Calendar, Trophy, MessageCircle,
  Heart, Star, Award, ThumbsUp, Bell, Check,
  ExternalLink, Eye
} from 'lucide-react';
import { Link } from 'wouter';

// Activity types with icon mapping
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  'community_join': <Users className="h-4 w-4" />,
  'community_create': <Users className="h-4 w-4" />,
  'community_leave': <Users className="h-4 w-4" />,
  'event_create': <Calendar className="h-4 w-4" />,
  'event_join': <Calendar className="h-4 w-4" />,
  'event_leave': <Calendar className="h-4 w-4" />,
  'achievement': <Trophy className="h-4 w-4" />,
  'comment': <MessageCircle className="h-4 w-4" />,
  'like': <Heart className="h-4 w-4" />,
  'rating': <Star className="h-4 w-4" />,
  'badge': <Award className="h-4 w-4" />,
  'xp': <Activity className="h-4 w-4" />,
  'endorsement': <ThumbsUp className="h-4 w-4" />,
  'default': <Bell className="h-4 w-4" />
};

// Activity type colors
const ACTIVITY_COLORS: Record<string, string> = {
  'community_join': 'bg-blue-500',
  'community_create': 'bg-indigo-600',
  'community_leave': 'bg-gray-500',
  'event_create': 'bg-emerald-500',
  'event_join': 'bg-green-500',
  'event_leave': 'bg-gray-500',
  'achievement': 'bg-amber-500',
  'comment': 'bg-purple-500',
  'like': 'bg-rose-500',
  'rating': 'bg-yellow-500',
  'badge': 'bg-orange-500',
  'xp': 'bg-cyan-500',
  'endorsement': 'bg-sky-500',
  'default': 'bg-primary'
};

// Activity gradient backgrounds
const ACTIVITY_GRADIENTS: Record<string, string> = {
  'community_join': 'from-blue-400 to-blue-700',
  'community_create': 'from-indigo-400 to-indigo-700',
  'community_leave': 'from-gray-400 to-gray-700',
  'event_create': 'from-emerald-400 to-emerald-700',
  'event_join': 'from-green-400 to-green-700',
  'event_leave': 'from-gray-400 to-gray-700',
  'achievement': 'from-amber-400 to-amber-700',
  'comment': 'from-purple-400 to-purple-700',
  'like': 'from-rose-400 to-rose-700',
  'rating': 'from-yellow-400 to-yellow-700',
  'badge': 'from-orange-400 to-orange-700',
  'xp': 'from-cyan-400 to-cyan-700',
  'endorsement': 'from-sky-400 to-sky-700',
  'default': 'from-primary/80 to-primary'
};

// Banner background patterns (could be actual images in production)
const getBannerPattern = (type: string): string => {
  return `bg-gradient-to-br ${ACTIVITY_GRADIENTS[type] || ACTIVITY_GRADIENTS.default}`;
};

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
  isRead?: boolean;
  isNew?: boolean;
}

interface ActivityItemProps {
  activity: Activity;
  onMarkAsRead?: (activityId: number) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onMarkAsRead }) => {
  const [isRead, setIsRead] = useState(activity.isRead ?? false);
  const formattedTime = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getIcon = () => {
    return ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
  };
  
  const getIconBackgroundColor = () => {
    return ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;
  };
  
  const handleMarkAsRead = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(activity.id);
      setIsRead(true);
    }
  };
  
  // Determine if this activity is related to a community
  const isCommunityRelated = activity.type.startsWith('community_') || activity.communityId;
  
  // Determine if this activity is related to an event
  const isEventRelated = activity.type.startsWith('event_');
  
  // Get appropriate link based on activity type
  const getActivityLink = () => {
    if (activity.communityId && isCommunityRelated) {
      return `/communities/${activity.communityId}`;
    } 
    else if (activity.relatedEntityId) {
      if (isEventRelated) {
        return `/events/${activity.relatedEntityId}`;
      } 
      else if (activity.type === 'achievement') {
        return `/achievements/${activity.relatedEntityId}`;
      }
    }
    return '#';
  };
  
  const displayName = activity.displayName || activity.username;
  const initials = getInitials(displayName);
  const bannerPattern = getBannerPattern(activity.type);
  
  return (
    <Card 
      className={`w-full transition-all hover:shadow-md overflow-hidden ${!isRead ? 'ring-1 ring-primary/30' : ''} ${activity.isNew ? 'animate-highlight-fade' : ''}`}
      onClick={handleMarkAsRead}
    >
      {/* Banner with gradient background */}
      <div className="relative h-24 w-full overflow-hidden">
        <div className={`absolute inset-0 ${bannerPattern}`}></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Activity badge in top right */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant="outline" 
            className={`${getIconBackgroundColor()} text-white border-white/20 shadow-sm flex items-center gap-1`}
          >
            {getIcon()}
            <span className="hidden sm:inline">
              {activity.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </Badge>
        </div>
        
        {/* User Avatar */}
        <div className="absolute bottom-0 translate-y-1/2 left-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarImage src={activity.avatar || ''} alt={displayName} />
            <AvatarFallback className={getIconBackgroundColor()}>{initials}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Unread indicator */}
        {!isRead && (
          <div className="absolute top-2 left-2">
            <span className="h-2 w-2 rounded-full bg-white shadow-md block"></span>
          </div>
        )}
      </div>
      
      <CardHeader className="pt-6 pb-2 pl-20">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">
              {displayName}
            </p>
            <time dateTime={activity.timestamp} className="text-xs text-muted-foreground">
              {formattedTime}
            </time>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-foreground">{activity.content}</p>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 flex justify-between border-t mt-2">
        <div className="text-xs text-muted-foreground flex items-center">
          {isCommunityRelated ? (
            <Users className="h-3.5 w-3.5 mr-1" />
          ) : isEventRelated ? (
            <Calendar className="h-3.5 w-3.5 mr-1" />
          ) : (
            <Activity className="h-3.5 w-3.5 mr-1" />
          )}
          <span>
            {activity.metadata?.additionalInfo || 
            (activity.communityId ? 'Community activity' : 
            (isEventRelated ? 'Event activity' : 'User activity'))}
          </span>
        </div>
        
        {!isRead && onMarkAsRead ? (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
          >
            <Check className="h-3 w-3 mr-1" />
            Mark as read
          </Button>
        ) : (
          getActivityLink() !== '#' && (
            <Link to={getActivityLink()}>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </Link>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default ActivityItem;