/**
 * PKL-278651-COMM-0022-FEED
 * Activity Item Component
 * 
 * This component displays a single activity feed item.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Users, Calendar, Trophy, MessageCircle,
  Heart, Star, Award, ThumbsUp, Bell, Check
} from 'lucide-react';

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
  
  const displayName = activity.displayName || activity.username;
  const initials = getInitials(displayName);
  
  return (
    <div 
      className={`
        relative flex items-start space-x-3 rounded-lg border p-3 transition-all duration-300
        ${!isRead ? 'bg-muted/40 dark:bg-muted/10' : 'bg-transparent'}
        ${activity.isNew ? 'animate-highlight-fade' : ''}
      `}
      onClick={handleMarkAsRead}
    >
      {/* User Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={activity.avatar || ''} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {displayName}
          </p>
          <div className="flex items-center">
            {!isRead && (
              <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
            )}
            <time dateTime={activity.timestamp} className="text-xs text-muted-foreground">
              {formattedTime}
            </time>
          </div>
        </div>
        
        <p className="mt-1 text-sm text-foreground">{activity.content}</p>
        
        {/* Activity Metadata and Actions */}
        <div className="mt-2 flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className={`flex items-center space-x-1 px-2 py-0.5 ${getIconBackgroundColor()} text-white`}
          >
            {getIcon()}
            <span>{activity.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
          </Badge>
          
          {!isRead && onMarkAsRead && (
            <button
              type="button"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;