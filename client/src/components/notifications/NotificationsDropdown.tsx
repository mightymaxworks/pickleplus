/**
 * PKL-278651-COMM-0028-NOTIF - Notifications Dropdown Component
 * Implementation timestamp: 2025-04-19 15:15 ET
 * 
 * Dropdown displaying user's notifications with read/unread states
 * 
 * Framework 5.2 compliant implementation
 */

import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { notificationsSDK, UserNotification } from '@/lib/sdk/notificationsSDK';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, Calendar, Bell, MessageSquare, User, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NotificationsDropdownProps {
  onClose: () => void;
  unreadCount: number;
}

export function NotificationsDropdown({ onClose, unreadCount }: NotificationsDropdownProps) {
  const [, navigate] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Get notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications', { limit: 15 }],
    queryFn: () => notificationsSDK.getNotifications({ limit: 15 }),
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsSDK.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
    }
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsSDK.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    }
  });
  
  // Handle notification click
  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.referenceType === 'community' && notification.referenceId) {
      navigate(`/communities/${notification.referenceId}`);
    } else if (notification.referenceType === 'post' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/posts/${notification.referenceId}`);
    } else if (notification.referenceType === 'event' && notification.referenceId && notification.communityId) {
      navigate(`/communities/${notification.communityId}/events/${notification.referenceId}`);
    }
    
    onClose();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'community_invite':
      case 'community_join_approved':
      case 'community_announcement':
        return <Users className="h-5 w-5 text-indigo-500" />;
      case 'event_reminder':
      case 'event_canceled':
      case 'event_updated':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'post_mention':
      case 'post_reply':
      case 'post_like':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'member_role_change':
        return <User className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  return (
    <motion.div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            Mark all as read
          </Button>
        )}
      </div>
      
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>You don't have any notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t dark:border-gray-700 text-center">
        <Button 
          variant="link" 
          size="sm" 
          className="text-sm text-primary"
          onClick={() => {
            navigate('/notifications');
            onClose();
          }}
        >
          View all notifications
        </Button>
      </div>
    </motion.div>
  );
}