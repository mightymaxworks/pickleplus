/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Enhanced Notification Bell Component
 * Implementation timestamp: 2025-04-20 10:40 ET
 * 
 * Bell icon component with real-time notification counter using WebSockets
 * 
 * Framework 5.2 compliant implementation
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsSDK } from '@/lib/sdk/notificationsSDK';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { cn } from '@/lib/utils';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import { useToast } from '@/hooks/use-toast';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize WebSocket for real-time notifications
  const { 
    unreadCount,
    connected,
    connecting,
    lastMessage 
  } = useNotificationSocket({
    onConnect: () => {
      console.log('Connected to notification service');
    },
    onMessage: (message) => {
      // Invalidate notification queries when new notifications are received
      if (message.type === 'new_notification' || 
          message.type === 'notification_read' || 
          message.type === 'all_read' || 
          message.type === 'notification_deleted') {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    }
  });
  
  // Fallback to REST API if WebSocket is not available
  const { data: unreadCountData, isLoading } = useQuery({
    queryKey: ['/api/notifications/count'],
    queryFn: notificationsSDK.getUnreadCount,
    refetchInterval: connected ? false : 60000, // Only poll if WebSocket is not connected
    enabled: !connected, // Disable when WebSocket is active
  });
  
  // Determine unread count from WebSocket or REST API
  const finalUnreadCount = connected ? unreadCount : (unreadCountData?.count || 0);
  
  // Visual bell shake effect when receiving new notifications
  const [shouldShake, setShouldShake] = useState(false);
  
  useEffect(() => {
    if (lastMessage?.type === 'new_notification') {
      // Trigger shake animation
      setShouldShake(true);
      
      // Reset animation after 1 second
      const timer = setTimeout(() => setShouldShake(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);
  
  return (
    <div className="relative">
      <motion.button 
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={shouldShake ? { 
          rotate: [0, -10, 10, -5, 5, 0],
          transition: { duration: 0.5 }
        } : {}}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${finalUnreadCount > 0 ? `(${finalUnreadCount} unread)` : ''}`}
      >
        <Bell size={22} className={cn(
          "text-gray-600 dark:text-gray-300",
          finalUnreadCount > 0 && "text-[#FF5722] dark:text-[#FF7043]"
        )} />
        
        <AnimatePresence>
          {finalUnreadCount > 0 && (
            <motion.div 
              className="absolute top-1 right-1 min-w-4 h-4 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-[10px] font-medium px-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {finalUnreadCount > 99 ? '99+' : finalUnreadCount}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Connection status indicator - only visible when explicitly disconnected */}
        {!connected && !connecting && (
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gray-400" title="Offline mode" />
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <NotificationsDropdown
            onClose={() => setIsOpen(false)} 
            unreadCount={finalUnreadCount}
            realTimeEnabled={connected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}