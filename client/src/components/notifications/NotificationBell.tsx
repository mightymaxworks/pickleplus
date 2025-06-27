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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;