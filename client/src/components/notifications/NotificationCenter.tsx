/**
 * NotificationCenter - Complete notification management interface
 * Displays notifications with real-time updates, mark as read functionality
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Clock, Trophy, Users, UserCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
  };
}

// Notification type icons and colors
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system':
      return <Zap className="h-4 w-4 text-blue-500" />;
    case 'achievement':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'coaching':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case 'community':
      return <Users className="h-4 w-4 text-purple-500" />;
    case 'match':
      return <Clock className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'system':
      return 'bg-blue-50 border-blue-200';
    case 'achievement':
      return 'bg-yellow-50 border-yellow-200';
    case 'coaching':
      return 'bg-green-50 border-green-200';
    case 'community':
      return 'bg-purple-50 border-purple-200';
    case 'match':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [includeRead, setIncludeRead] = useState(false);

  // Fetch notifications
  const { data: notificationData, isLoading, error } = useQuery<NotificationResponse>({
    queryKey: [`/api/notifications?limit=10&includeRead=${includeRead}`],
    queryFn: async () => {
      console.log(`[NotificationCenter] Fetching notifications with includeRead=${includeRead}`);
      const response = await apiRequest('GET', `/api/notifications?limit=10&includeRead=${includeRead}`);
      const data = await response.json();
      console.log('[NotificationCenter] Response data:', data);
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', '/api/notifications/mark-all-read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const notifications = notificationData?.data || [];
  const unreadCount = notificationData?.meta?.unreadCount || 0;

  console.log('[NotificationCenter] Render state:', {
    isLoading,
    error,
    notificationData,
    notifications: notifications.length,
    unreadCount
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="h-7 px-2 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="max-h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p className="text-sm">Error loading notifications</p>
            <p className="text-xs">{error.message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.isRead ? 'bg-blue-50/50 border-l-2 border-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium leading-tight ${
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs h-4 px-1.5 capitalize">
                        {notification.type}
                      </Badge>
                      
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs opacity-70 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => setIncludeRead(!includeRead)}
          >
            {includeRead ? 'Hide Read' : 'Show All'} ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;