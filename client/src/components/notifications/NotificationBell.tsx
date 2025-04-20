/**
 * PKL-278651-COMM-0028-NOTIF-UI - Notification Bell Component
 * Implementation timestamp: 2025-04-20 14:30 ET
 * Bug fix timestamp: 2025-04-20 11:56 ET
 * 
 * Bell icon component with counter for notifications
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { notificationsSDK } from '@/lib/sdk/notificationsSDK';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [animateBell, setAnimateBell] = useState(false);
  const { connected, lastMessage } = useNotificationSocket({
    onMessage: (message) => {
      console.log('[NotificationBell] WebSocket message received:', message);
      
      if (message.type === 'new_notification') {
        // Increment the counter by 1 for a single notification
        console.log('[NotificationBell] New unread notification, incrementing count');
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log('[NotificationBell] Updated unread count:', newCount);
          return newCount;
        });
        triggerBellAnimation();
      } else if (message.type === 'notification_batch') {
        // For a batch, fetch the new count
        console.log('[NotificationBell] Notification batch received, fetching updated count');
        const fetchUnreadCount = async () => {
          try {
            const response = await apiRequest('GET', '/api/notifications/unread-count');
            const data = await response.json();
            console.log('[NotificationBell] Batch notification count response:', data);
            
            if (data && typeof data.count === 'number') {
              console.log('[NotificationBell] Setting batch notification count to:', data.count);
              setUnreadCount(data.count);
            }
          } catch (error) {
            console.error('[NotificationBell] Failed to fetch unread count after batch notification:', error);
          }
        };
        
        fetchUnreadCount();
        triggerBellAnimation();
      } else if (message.type === 'read_all') {
        // For a "mark all as read" event from another tab/client
        console.log('[NotificationBell] Received read_all event, resetting counter');
        setUnreadCount(0);
      }
    }
  });
  
  // PKL-278651-COMM-0028-NOTIF-FIX - Ultra-lean implementation (Framework 5.2)
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial fetch to set unread count with enhanced debugging
  useEffect(() => {
    if (user) {
      // Only fetch if user is logged in
      const fetchUnreadCount = async () => {
        try {
          console.log('[NotificationBell] Fetching initial unread count...');
          const response = await apiRequest('GET', '/api/notifications/unread-count');
          const data = await response.json();
          console.log('[NotificationBell] Initial unread count response:', data);
          
          if (data && typeof data.count === 'number') {
            console.log('[NotificationBell] Setting unread count to:', data.count);
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('[NotificationBell] Failed to fetch unread count:', error);
        }
      };
      
      fetchUnreadCount();
      
      // Set up a regular interval to refresh the count
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Every 30 seconds
      
      // Clear interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);
  
  // Display count from state
  const displayCount = unreadCount;
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // BUGFIX: Fixed the API endpoint path to match the server implementation
      const response = await apiRequest('POST', '/api/notifications/read-all');
      return response.json();
    },
    onSuccess: () => {
      // Directly set count to 0 since all are read
      setUnreadCount(0);
      
      // Also invalidate all related queries to force a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      
      console.log('[NotificationBell] All notifications marked as read, reset counter to 0');
    }
  });
  
  const triggerBellAnimation = () => {
    setAnimateBell(true);
    setTimeout(() => setAnimateBell(false), 1000);
  };
  
  // Trigger animation when unread count changes
  useEffect(() => {
    if (displayCount > 0) {
      triggerBellAnimation();
    }
  }, [displayCount]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="ghost"
            size="sm"
            className={cn(
              "relative p-2 rounded-full",
              animateBell && "animate-wiggle",
              className
            )}
            aria-label={`Notifications ${displayCount > 0 ? `(${displayCount} unread)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {displayCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {displayCount > 99 ? '99+' : displayCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {displayCount > 0 
              ? `You have ${displayCount} unread notification${displayCount !== 1 ? 's' : ''}`
              : 'Notifications'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationBell;