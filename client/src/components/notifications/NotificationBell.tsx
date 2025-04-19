/**
 * PKL-278651-COMM-0028-NOTIF - Notification Bell Component
 * Implementation timestamp: 2025-04-19 15:20 ET
 * 
 * Bell icon component with notification counter showing unread notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { notificationsSDK } from '@/lib/sdk/notificationsSDK';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: unreadCountData, isLoading, error } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: notificationsSDK.getUnreadCount,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const unreadCount = unreadCountData?.count || 0;
  
  return (
    <div className="relative">
      <motion.button 
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={22} className="text-gray-600 dark:text-gray-300" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div 
              className="absolute top-1 right-1 min-w-4 h-4 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-[10px] font-medium px-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <NotificationsDropdown
            onClose={() => setIsOpen(false)} 
            unreadCount={unreadCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}