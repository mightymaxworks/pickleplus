/**
 * PKL-278651-COMM-0022-FEED
 * Activity Item Component
 * 
 * This component renders a single activity item in the activity feed.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Medal, 
  Users, 
  Activity, 
  Check,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Activity interface from ActivityFeed component
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
  showActions?: boolean;
  showCommunityBadge?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  onMarkAsRead,
  showActions = true,
  showCommunityBadge = true
}) => {
  const [isHighlighted, setIsHighlighted] = useState(activity.isNew || false);
  
  // Reset highlight effect after 5 seconds
  useEffect(() => {
    if (isHighlighted) {
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);
  
  // Format timestamp as relative time (e.g., "2 hours ago")
  const formattedTime = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  
  // Format timestamp for tooltip (full date and time)
  const fullTimestamp = format(new Date(activity.timestamp), 'PPpp');
  
  // Get activity icon based on type
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'match_recorded':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'tournament_joined':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case 'achievement':
        return <Medal className="h-4 w-4 text-purple-500" />;
      case 'community_joined':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'level_up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'xp_earned':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'featured':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-teal-500" />;
      default:
        return <Check className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get link based on activity type and related entity
  const getActivityLink = () => {
    const { type, relatedEntityId, relatedEntityType, communityId } = activity;
    
    switch (type) {
      case 'match_recorded':
        return `/matches?id=${relatedEntityId}`;
      case 'comment':
        if (relatedEntityType === 'community') {
          return `/communities/${relatedEntityId}`;
        }
        return '#';
      case 'tournament_joined':
        return `/tournaments/${relatedEntityId}`;
      case 'community_joined':
        return `/communities/${communityId || relatedEntityId}`;
      case 'event':
        if (communityId && relatedEntityId) {
          return `/communities/${communityId}/events/${relatedEntityId}`;
        }
        return `/events/${relatedEntityId}`;
      default:
        return '#';
    }
  };
  
  // Get community name from ID (simplified for now)
  const getCommunityName = (communityId: number) => {
    const communityMap: Record<number, string> = {
      1: 'Pickle+ Giveaway Group',
      2: 'Seattle Pickleball Club',
      3: 'Tournament Players',
      4: 'Coaching Corner',
      5: 'Beginners Bootcamp'
    };
    
    return communityMap[communityId] || `Community #${communityId}`;
  };
  
  // Handle clicking on activity item (mark as read if not already)
  const handleActivityClick = () => {
    if (!activity.isRead && onMarkAsRead) {
      onMarkAsRead(activity.id);
    }
  };
  
  return (
    <Card
      className={cn(
        "border transition-all duration-500 overflow-hidden",
        isHighlighted ? "bg-primary/5 border-primary/20" : "bg-card",
        !activity.isRead ? "border-l-4 border-l-primary" : ""
      )}
      onClick={handleActivityClick}
    >
      <CardContent className="p-4">
        <div className="flex">
          {/* User avatar */}
          <Link href={`/profile/${activity.userId}`} className="mr-3 flex-shrink-0">
            <Avatar className="h-10 w-10">
              {activity.avatar ? (
                <AvatarImage src={activity.avatar} alt={activity.displayName || activity.username} />
              ) : (
                <AvatarFallback>
                  {(activity.displayName || activity.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
          
          {/* Activity content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {/* Author name */}
              <Link 
                href={`/profile/${activity.userId}`}
                className="font-medium text-primary hover:underline truncate"
              >
                {activity.displayName || activity.username}
              </Link>
              
              {/* Activity type badge */}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {getActivityIcon()}
                  <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                </span>
              </div>
              
              {/* Community badge if available */}
              {showCommunityBadge && activity.communityId && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <Link href={`/communities/${activity.communityId}`}>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {getCommunityName(activity.communityId)}
                    </Badge>
                  </Link>
                </>
              )}
            </div>
            
            {/* Activity content */}
            <div className="text-sm text-foreground mb-2">
              {activity.content}
            </div>
            
            {/* Activity metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {/* Timestamp with tooltip */}
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-help">{formattedTime}</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 text-xs">
                  {fullTimestamp}
                </PopoverContent>
              </Popover>
              
              {/* Action buttons */}
              {showActions && (
                <div className="flex items-center gap-2">
                  {onMarkAsRead && !activity.isRead && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(activity.id);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getActivityLink(), '_blank');
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Copy to clipboard functionality
                          navigator.clipboard.writeText(activity.content);
                        }}
                      >
                        Copy Text
                      </DropdownMenuItem>
                      {activity.communityId && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/communities/${activity.communityId}`;
                          }}
                        >
                          View Community
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityItem;