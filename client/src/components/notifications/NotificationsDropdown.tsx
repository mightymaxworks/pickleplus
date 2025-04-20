/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Enhanced Notifications Dropdown Component
 * Implementation timestamp: 2025-04-20 10:45 ET
 * 
 * Dropdown displaying user's notifications with real-time updates via WebSocket
 * 
 * Framework 5.2 compliant implementation
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsSDK, UserNotification } from '@/lib/sdk/notificationsSDK';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Calendar, Bell, MessageSquare, User, Users, Wifi, WifiOff, Award, Trophy, Activity } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NotificationsDropdownProps {
  onClose: () => void;
  unreadCount: number;
  realTimeEnabled?: boolean;
}

export function NotificationsDropdown({ 
  onClose, 
  unreadCount, 
  realTimeEnabled = false 
}: NotificationsDropdownProps) {
  const [, navigate] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [newNotificationHighlight, setNewNotificationHighlight] = useState<number | null>(null);
  
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
    refetchInterval: realTimeEnabled ? false : 30000, // Only poll if not using WebSockets
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
    
    // First try to use the direct link if available
    if (notification.link) {
      navigate(notification.link);
    }
    // Fallback to reference-based navigation if link is not available
    else if (notification.referenceType === 'community' && notification.referenceId) {
      navigate(`/communities/${notification.referenceId}`);
    } else if (notification.referenceType === 'post' && notification.referenceId && notification.metadata?.communityId) {
      navigate(`/communities/${notification.metadata.communityId}/posts/${notification.referenceId}`);
    } else if (notification.referenceType === 'event' && notification.referenceId && notification.metadata?.communityId) {
      navigate(`/communities/${notification.metadata.communityId}/events/${notification.referenceId}`);
    } else if (notification.referenceType === 'match' && notification.referenceId) {
      navigate(`/matches/${notification.referenceId}`);
    } else if (notification.referenceType === 'achievement' && notification.referenceId) {
      navigate(`/achievements/${notification.referenceId}`);
    } else if (notification.referenceType === 'profile') {
      navigate('/profile');
    } else {
      // Default to dashboard if no specific navigation target
      navigate('/dashboard');
    }
    
    onClose();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'community_post':
      case 'community_comment':
      case 'post_mention':
      case 'post_reply':
      case 'post_like':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
        
      case 'community_event':
      case 'event_reminder':
      case 'event_registration':
      case 'event_cancellation':
      case 'event_updated':
        return <Calendar className="h-5 w-5 text-green-500" />;
        
      case 'match_recorded':
      case 'match_invite':
        return <Activity className="h-5 w-5 text-purple-500" />;
        
      case 'friend_request':
      case 'community_invite':
      case 'community_join_approved':
      case 'community_announcement':
      case 'member_role_change':
        return <Users className="h-5 w-5 text-indigo-500" />;
        
      case 'achievement_earned':
      case 'level_up':
        return <Award className="h-5 w-5 text-yellow-500" />;
        
      case 'tournament_invite':
      case 'tournament_update':
        return <Trophy className="h-5 w-5 text-amber-500" />;
        
      case 'xp_earned':
        return <Activity className="h-5 w-5 text-emerald-500" />;
        
      case 'system_message':
        return <Bell className="h-5 w-5 text-red-500" />;
        
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };
  
  // Group notifications by date (today, yesterday, this week, earlier)
  const groupedNotifications = notifications?.reduce((groups: Record<string, UserNotification[]>, notification) => {
    const date = new Date(notification.createdAt);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      if (!groups.today) groups.today = [];
      groups.today.push(notification);
    } 
    // Yesterday
    else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
      if (!groups.yesterday) groups.yesterday = [];
      groups.yesterday.push(notification);
    }
    // This week (within 7 days)
    else if (date > new Date(now.setDate(now.getDate() - 6))) {
      if (!groups.thisWeek) groups.thisWeek = [];
      groups.thisWeek.push(notification);
    }
    // Earlier
    else {
      if (!groups.earlier) groups.earlier = [];
      groups.earlier.push(notification);
    }
    
    return groups;
  }, {}) || {};
  
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
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {realTimeEnabled ? (
            <Badge variant="outline" className="px-2 py-0 h-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              <Wifi className="h-3 w-3 mr-1" />
              <span className="text-xs">Live</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="px-2 py-0 h-5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
              <WifiOff className="h-3 w-3 mr-1" />
              <span className="text-xs">Offline</span>
            </Badge>
          )}
        </div>
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
            {/* Display grouped notifications */}
            {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
              <div key={group}>
                <div className="px-3 py-1 bg-gray-50 dark:bg-gray-700/50 border-y dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {group === 'today' ? 'Today' : 
                     group === 'yesterday' ? 'Yesterday' : 
                     group === 'thisWeek' ? 'This Week' : 'Earlier'}
                  </p>
                </div>
                
                {groupNotifications.map((notification) => (
                  <motion.div 
                    key={notification.id} 
                    className={`p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${newNotificationHighlight === notification.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    animate={newNotificationHighlight === notification.id ? {
                      backgroundColor: ['rgba(254, 252, 232, 1)', 'rgba(254, 252, 232, 0)'],
                      transition: { duration: 2 }
                    } : {}}
                    onAnimationComplete={() => {
                      if (newNotificationHighlight === notification.id) {
                        setNewNotificationHighlight(null);
                      }
                    }}
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
                  </motion.div>
                ))}
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