/**
 * NotificationBell - Header notification icon with unread count badge
 * Displays notification count and opens notification center
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { apiRequest } from '@/lib/queryClient';
import NotificationCenter from './NotificationCenter';

interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  // Fetch unread notification count
  const { data: countData } = useQuery<UnreadCountResponse>({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications/unread-count');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = countData?.unreadCount || 0;
  
  console.log('[NotificationBell] Render state:', { 
    open, 
    unreadCount, 
    countData 
  });

  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      console.log('[NotificationBell] Popover state changing:', { from: open, to: newOpen });
      setOpen(newOpen);
    }}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={(e) => {
            console.log('[NotificationBell] Button clicked directly');
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div style={{ padding: '8px', background: '#f0f0f0', fontSize: '12px' }}>
          DEBUG: Popover is open, NotificationCenter should render
        </div>
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;