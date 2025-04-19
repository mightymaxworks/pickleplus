/**
 * PKL-278651-COMM-0022-FEED
 * Enhanced Activity Item Component
 * 
 * This component displays a single activity feed item with an enhanced card UI
 * that matches the community cards style.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, Users, Calendar, Trophy, MessageCircle,
  Heart, Star, Award, ThumbsUp, Bell, Check,
  Eye, MapPin, Lock, ExternalLink, Bookmark
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

// Activity type colors and gradients
const ACTIVITY_COLORS: Record<string, { bg: string, gradient: string }> = {
  'community_join': { bg: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  'community_create': { bg: 'bg-indigo-600', gradient: 'from-indigo-500 to-indigo-700' },
  'community_leave': { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' },
  'event_create': { bg: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
  'event_join': { bg: 'bg-green-500', gradient: 'from-green-400 to-green-600' },
  'event_leave': { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' },
  'achievement': { bg: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
  'comment': { bg: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
  'like': { bg: 'bg-rose-500', gradient: 'from-rose-400 to-rose-600' },
  'rating': { bg: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' },
  'badge': { bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' },
  'xp': { bg: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-600' },
  'endorsement': { bg: 'bg-sky-500', gradient: 'from-sky-400 to-sky-600' },
  'default': { bg: 'bg-primary', gradient: 'from-primary/90 to-primary' }
};

// Banner images for different activity types
const ACTIVITY_BANNERS: Record<string, string> = {
  'community_join': '/src/assets/activity-banners/community-join.jpg',
  'community_create': '/src/assets/activity-banners/community-create.jpg',
  'event_create': '/src/assets/activity-banners/event-create.jpg',
  'event_join': '/src/assets/activity-banners/event-join.jpg',
  'achievement': '/src/assets/activity-banners/achievement.jpg',
  // Default banner if specific one not available
  'default': '/src/assets/activity-banners/default.jpg'
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

interface EnhancedActivityItemProps {
  activity: Activity;
  onMarkAsRead?: (activityId: number) => void;
}

const EnhancedActivityItem: React.FC<EnhancedActivityItemProps> = ({ activity, onMarkAsRead }) => {
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
  
  const getColors = () => {
    return ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;
  };
  
  const getBannerImage = () => {
    return ACTIVITY_BANNERS[activity.type] || ACTIVITY_BANNERS.default;
  };
  
  const handleMarkAsRead = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(activity.id);
      setIsRead(true);
    }
  };
  
  const displayName = activity.displayName || activity.username;
  const initials = getInitials(displayName);
  const colors = getColors();
  const bannerImage = getBannerImage();
  
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
  
  return (
    <Card 
      className={`w-full transition-all hover:shadow-md overflow-hidden ${activity.isNew ? 'ring-2 ring-primary/30' : ''}`}
      onClick={handleMarkAsRead}
    >
      {/* Banner with gradient overlay */}
      <div className="relative h-24 w-full overflow-hidden">
        <img 
          src={bannerImage}
          alt={`${activity.type} activity`}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.gradient} opacity-70`}></div>
        
        {/* Activity type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className={`${colors.bg} text-white text-xs border-white/20 shadow-sm`}>
            {getIcon()}
            <span className="ml-1">{activity.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
          </Badge>
        </div>
        
        {/* User Avatar */}
        <div className="absolute bottom-2 left-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarImage src={activity.avatar || ''} alt={displayName} />
            <AvatarFallback className={`${colors.bg} text-white`}>{initials}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Unread indicator */}
        {!isRead && (
          <div className="absolute top-2 left-2">
            <span className="block h-3 w-3 rounded-full bg-primary border-2 border-white animate-pulse"></span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-base font-medium">{displayName}</h4>
            <time dateTime={activity.timestamp} className="text-xs text-muted-foreground">
              {formattedTime}
            </time>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-foreground">{activity.content}</p>
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
          <span className="text-muted-foreground text-xs">
            {activity.metadata?.additionalInfo || ""}
          </span>
        </div>
        
        <Link to={getActivityLink()}>
          <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">
            <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">View Details</span>
            <span className="inline sm:hidden ml-1 text-xs">View</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EnhancedActivityItem;