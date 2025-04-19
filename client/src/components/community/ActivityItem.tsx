/**
 * PKL-278651-COMM-0022-FEED
 * Activity Item Component
 * 
 * This component displays a single activity feed item with modern UI design
 * that matches the CommunitySearchResults card styling with banner images and avatars.
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
  Eye, MapPin
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

// Activity background gradient mapping
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
  const gradientClass = ACTIVITY_GRADIENTS[activity.type] || ACTIVITY_GRADIENTS.default;
  
  return (
    <Card className="w-full transition-all hover:shadow-md overflow-hidden">
      {/* Banner Image Section - Match CommunitySearchResults styling */}
      <div className="relative h-32 w-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        <div className="absolute bottom-2 left-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarImage src={activity.avatar || ''} alt={displayName} />
            <AvatarFallback className={getIconBackgroundColor()}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Badge 
            variant="outline" 
            className={`${getIconBackgroundColor()} text-white text-[10px] sm:text-xs py-0 h-5 px-1.5 sm:px-2 border-white/20 shadow-sm`}
          >
            {getIcon()}
            <span className="ml-1">
              {activity.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </Badge>
          
          {!isRead && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-white/20 shadow-sm text-[10px] h-5 px-1.5">
              <span className="mr-1">New</span>
              <span className="h-2 w-2 rounded-full bg-primary block"></span>
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className={`pb-2 ${activity.bannerUrl ? 'pt-3' : 'pt-4'}`}>
        <div className="flex justify-between items-start">
          <div className="pl-16">
            <p className="font-medium text-base">
              {displayName}
            </p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <time dateTime={activity.timestamp} className="text-xs text-muted-foreground">
                {formattedTime}
              </time>
              
              {activity.metadata?.location && (
                <div className="flex items-center ml-4">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{activity.metadata.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {activity.content}
        </p>
        
        {activity.metadata?.tags && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
            {activity.metadata.tags.split(',').map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 truncate max-w-[80px] sm:max-w-[120px]"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-sm flex items-center">
          {isCommunityRelated ? (
            <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          ) : isEventRelated ? (
            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          ) : (
            <Activity className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {activity.metadata?.additionalInfo || 
            (activity.communityId ? 'Community activity' : 
            (isEventRelated ? 'Event activity' : 'User activity'))}
          </span>
        </div>
        
        {getActivityLink() !== '#' ? (
          <Link to={getActivityLink()}>
            <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">
              <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">View Details</span>
              <span className="inline sm:hidden ml-1 text-xs">View</span>
            </Button>
          </Link>
        ) : (
          !isRead && onMarkAsRead && (
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 sm:px-3"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
            >
              <Check className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Mark as Read</span>
              <span className="inline sm:hidden ml-1 text-xs">Read</span>
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default ActivityItem;