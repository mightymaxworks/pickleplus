import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trophy, 
  Users, 
  Swords, 
  CheckCircle, 
  X, 
  Clock,
  Play,
  UserPlus,
  Crown,
  Zap,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface GameNotification {
  id: string;
  type: 'challenge' | 'partner_request' | 'match_start' | 'match_complete' | 'achievement' | 'tournament' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  from?: {
    id: string;
    name: string;
    avatar?: string;
  };
  actionRequired?: boolean;
  actions?: {
    accept?: () => void;
    decline?: () => void;
    view?: () => void;
    join?: () => void;
  };
  metadata?: any;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Notification Context
const NotificationContext = createContext<{
  notifications: GameNotification[];
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}>({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  clearNotification: () => {},
  clearAll: () => {},
  unreadCount: 0
});

export const useNotifications = () => useContext(NotificationContext);

// Notification Provider
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<GameNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: GameNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for high priority notifications
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast({
        title: notification.title,
        description: notification.message,
        duration: notification.priority === 'urgent' ? 8000 : 5000,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Simulate incoming notifications for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications
      const mockNotifications = [
        {
          type: 'challenge' as const,
          title: '⚔️ New Challenge!',
          message: 'Sarah Martinez challenged you to a singles match',
          from: { id: '1', name: 'Sarah Martinez' },
          actionRequired: true,
          actions: {
            accept: () => console.log('Challenge accepted'),
            decline: () => console.log('Challenge declined')
          },
          priority: 'high' as const
        },
        {
          type: 'partner_request' as const,
          title: '🤝 Partnership Request',
          message: 'Marcus Chen wants to team up for doubles',
          from: { id: '2', name: 'Marcus Chen' },
          actionRequired: true,
          actions: {
            accept: () => console.log('Partner request accepted'),
            decline: () => console.log('Partner request declined')
          },
          priority: 'normal' as const
        },
        {
          type: 'achievement' as const,
          title: '🏆 Achievement Unlocked!',
          message: 'You\'ve reached 10 match wins!',
          priority: 'normal' as const
        }
      ];

      // Randomly add a notification (low probability for demo)
      if (Math.random() < 0.1) {
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearNotification,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: GameNotification['type']) => {
    switch (type) {
      case 'challenge': return Swords;
      case 'partner_request': return UserPlus;
      case 'match_start': return Play;
      case 'match_complete': return Trophy;
      case 'achievement': return Crown;
      case 'tournament': return Trophy;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: GameNotification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'normal': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="relative bg-slate-800 border-slate-600 hover:bg-slate-700"
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              {/* Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map(notification => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-slate-700 last:border-b-0 ${
                          !notification.isRead ? 'bg-slate-700/50' : ''
                        } hover:bg-slate-700/30 transition-colors`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} border`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1">
                                  {notification.message}
                                </p>
                                {notification.from && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    From: {notification.from.name}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-slate-500">
                                  {notification.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {notification.actionRequired && notification.actions && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.accept && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.actions!.accept!();
                                      clearNotification(notification.id);
                                    }}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Accept
                                  </Button>
                                )}
                                {notification.actions.decline && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.actions!.decline!();
                                      clearNotification(notification.id);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-400 border-red-400/30 hover:bg-red-400/10 text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Decline
                                  </Button>
                                )}
                                {notification.actions.view && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.actions!.view!();
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    View
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No notifications</h3>
                    <p className="text-slate-400 text-sm">You're all caught up!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-700">
                  <Button
                    onClick={() => {
                      notifications.forEach(n => markAsRead(n.id));
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white"
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Floating notification component for urgent messages
export function FloatingNotification({ notification, onClose }: {
  notification: GameNotification;
  onClose: () => void;
}) {
  const Icon = notification.type === 'challenge' ? Swords :
             notification.type === 'partner_request' ? UserPlus :
             notification.type === 'achievement' ? Crown : Bell;

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, x: '50%' }}
      animate={{ opacity: 1, y: 0, x: '50%' }}
      exit={{ opacity: 0, y: -100, x: '50%' }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <Card className="p-4 bg-slate-800 border-orange-500 border-2 shadow-xl min-w-[300px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-orange-500/20 border border-orange-500">
            <Icon className="h-5 w-5 text-orange-400" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-white font-semibold">{notification.title}</h4>
            <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
            
            {notification.actionRequired && notification.actions && (
              <div className="flex gap-2 mt-3">
                {notification.actions.accept && (
                  <Button
                    onClick={() => {
                      notification.actions!.accept!();
                      onClose();
                    }}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Accept
                  </Button>
                )}
                {notification.actions.decline && (
                  <Button
                    onClick={() => {
                      notification.actions!.decline!();
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400/30"
                  >
                    Decline
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}