/**
 * PKL-278651-COMM-0022-FEED
 * Activity Item Component
 * 
 * This component renders a single activity item in the feed.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { UsersIcon, MessageSquareIcon, CalendarIcon, TrophyIcon, HeartIcon, Share2Icon, MapPinIcon } from 'lucide-react';

interface ActivityItemProps {
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
  onClick?: () => void;
  isNew?: boolean;
}

export function ActivityItem({
  id,
  type,
  userId,
  username,
  displayName,
  avatar,
  content,
  timestamp,
  communityId,
  communityName,
  metadata,
  relatedEntityId,
  relatedEntityType,
  onClick,
  isNew = false
}: ActivityItemProps) {
  // Get the appropriate icon for the activity type
  const getActivityIcon = () => {
    switch (type) {
      case 'post':
        return <MessageSquareIcon className="h-4 w-4" />;
      case 'event':
        return <CalendarIcon className="h-4 w-4" />;
      case 'achievement':
        return <TrophyIcon className="h-4 w-4" />;
      case 'like':
        return <HeartIcon className="h-4 w-4" />;
      case 'share':
        return <Share2Icon className="h-4 w-4" />;
      case 'join':
        return <UsersIcon className="h-4 w-4" />;
      case 'location':
        return <MapPinIcon className="h-4 w-4" />;
      default:
        return <MessageSquareIcon className="h-4 w-4" />;
    }
  };
  
  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };
  
  return (
    <Card 
      className={`mb-3 overflow-hidden transition-all hover:shadow-md ${isNew ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-800' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <Link href={`/profile/${userId}`} className="shrink-0">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={avatar} alt={displayName || username || 'User'} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                {/* User Name */}
                <Link 
                  href={`/profile/${userId}`}
                  className="font-medium text-sm hover:underline truncate mr-2"
                >
                  {displayName || username || 'User'}
                </Link>
                
                {/* Activity Type Badge */}
                <Badge variant="outline" className="flex items-center text-xs ml-1">
                  {getActivityIcon()}
                  <span className="ml-1 capitalize">{type}</span>
                </Badge>
              </div>
              
              {/* Timestamp */}
              <span className="text-muted-foreground text-xs">{formattedTime}</span>
            </div>
            
            {/* Content */}
            <p className="text-sm text-foreground mb-2">{content}</p>
            
            {/* Community Name if applicable */}
            {communityId && communityName && (
              <div className="flex items-center">
                <Link 
                  href={`/community/${communityId}`}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center"
                >
                  <UsersIcon className="h-3 w-3 mr-1" />
                  {communityName}
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}