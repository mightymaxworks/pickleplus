/**
 * PKL-278651-COMM-0028-NOTIF-UI - Notification Bell Component
 * Implementation timestamp: 2025-04-20 14:30 ET
 * 
 * Bell icon component with counter for notifications
 * 
 * Framework 5.2 compliant implementation
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { unreadCount, connected, lastMessage } = useNotificationSocket({
    onMessage: (message) => {
      if (message.type === 'new_notification' || message.type === 'notification_batch') {
        triggerBellAnimation();
      }
    }
  });
  
  // Get initial unread count from API
  const { data: initialUnreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
  });
  
  // Combine socket unread count with initial API count
  const totalUnreadCount = unreadCount || initialUnreadCount;
  
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
    if (totalUnreadCount > 0) {
      triggerBellAnimation();
    }
  }, [totalUnreadCount]);
  
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
            aria-label={`Notifications ${totalUnreadCount > 0 ? `(${totalUnreadCount} unread)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {totalUnreadCount > 0 
              ? `You have ${totalUnreadCount} unread notification${totalUnreadCount !== 1 ? 's' : ''}`
              : 'Notifications'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationBell;