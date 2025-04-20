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
      if (message.type === 'new_notification' || message.type === 'notification_batch') {
        triggerBellAnimation();
        // Invalidate the count when we get a new notification
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      }
    }
  });
  
  // Get unread count directly from API - Framework 5.2 simplified implementation
  const { data: unreadCountData } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications/unread-count');
      const data = await response.json();
      return data.count || 0;
    },
    enabled: !!user,
  });
  
  // Use count directly from API response
  const displayCount = typeof unreadCountData === 'number' ? unreadCountData : 0;
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notifications/mark-all-as-read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
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