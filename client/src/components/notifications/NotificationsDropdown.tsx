/**
 * PKL-278651-COMM-0028-NOTIF-UI - Notifications Dropdown Component
 * Implementation timestamp: 2025-04-20 14:45 ET
 * 
 * Dropdown component for displaying notifications
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, X, Check, Bell, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from './NotificationBell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserNotification } from '@shared/schema/notifications';

interface NotificationsDropdownProps {
  className?: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Get notifications from API
  const { data: notifications = [], isLoading } = useQuery<UserNotification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user && open,
  });

  // Setup WebSocket connection
  const { connected, lastMessage } = useNotificationSocket({
    onMessage: (message) => {
      if (['new_notification', 'notification_batch', 'notification_read', 'notification_deleted', 'all_read'].includes(message.type)) {
        // Refetch notifications when changes happen
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      }
    }
  });
  
  // Mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/notifications/${id}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    }
  });
  
  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // BUGFIX: Fixed API endpoint path to match server implementation
      const response = await apiRequest('POST', '/api/notifications/read-all');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: 'All notifications marked as read',
        description: 'All notifications have been marked as read.',
      });
      console.log('[NotificationsDropdown] All notifications marked as read');
    }
  });
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type.startsWith(activeTab);
  });
  
  // Handle notification click
  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to the notification target if available
    if (notification.link) {
      setOpen(false);
      window.location.href = notification.link;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={className}>
          <NotificationBell onClick={() => setOpen(!open)} />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-0" 
        align="end"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || !notifications.some(n => !n.isRead)}
            >
              {markAllAsReadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              <span className="sr-only md:not-sr-only md:inline-block">Mark all as read</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 py-2 border-b">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="match">Match</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent/50 cursor-pointer transition-colors border-b last:border-b-0",
                        !notification.isRead && "bg-accent/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <BellOff className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications to display</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTab === 'all' 
                      ? "You're all caught up!" 
                      : `No ${activeTab === 'unread' ? 'unread' : activeTab} notifications found.`}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="p-2 border-t text-xs text-center text-muted-foreground">
          <span>
            {connected 
              ? "Real-time notifications are active" 
              : "Connecting to notification service..."}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;