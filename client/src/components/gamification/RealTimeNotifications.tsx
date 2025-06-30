import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  X, 
  Check,
  Star,
  Award,
  Calendar,
  Zap,
  MessageCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'friend_activity' | 'challenge' | 'leaderboard' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: boolean;
  actionText?: string;
  actionUrl?: string;
  metadata?: {
    achievementId?: string;
    friendId?: string;
    challengeId?: string;
    userId?: string;
    avatar?: string;
    friendName?: string;
    achievementName?: string;
    challengeName?: string;
    rankChange?: number;
    newRank?: number;
  };
}

interface RealTimeNotificationsProps {
  userId: number;
  isVisible: boolean;
  onClose: () => void;
  onNotificationAction?: (notification: Notification) => void;
  maxNotifications?: number;
}

export default function RealTimeNotifications({
  userId,
  isVisible,
  onClose,
  onNotificationAction,
  maxNotifications = 50
}: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebSocket connection for real-time notifications
  useEffect(() => {
    if (!isVisible) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Notifications WebSocket connected');
        // Send user ID for targeted notifications
        wsRef.current?.send(JSON.stringify({ type: 'subscribe', userId }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          addNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Notifications WebSocket disconnected');
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isVisible, userId]);

  // Load existing notifications on mount
  useEffect(() => {
    if (isVisible) {
      loadNotifications();
    }
  }, [isVisible, userId]);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT6X2O/HdSUDIZ/H8+OUPwsUXrPq4qlTHgE9m+H3y3k');
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, maxNotifications);
      return newNotifications;
    });

    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        audioRef.current?.play().catch(console.error);
      }
    }
  };

  const loadNotifications = async () => {
    try {
      // Mock data for demonstration - replace with real API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You earned the "Serve Master" achievement',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
          priority: 'high',
          actionable: true,
          actionText: 'View Achievement',
          metadata: {
            achievementId: 'serve_master',
            achievementName: 'Serve Master'
          }
        },
        {
          id: '2',
          type: 'friend_activity',
          title: 'Friend Activity',
          message: 'Sarah completed a challenge you\'re also working on',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          isRead: false,
          priority: 'medium',
          actionable: true,
          actionText: 'View Challenge',
          metadata: {
            friendId: '123',
            friendName: 'Sarah',
            avatar: '/uploads/profiles/avatar-123.jpg',
            challengeId: 'weekly_consistency'
          }
        },
        {
          id: '3',
          type: 'leaderboard',
          title: 'Ranking Update',
          message: 'You moved up 3 positions in the weekly leaderboard!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: true,
          priority: 'medium',
          actionable: true,
          actionText: 'View Leaderboard',
          metadata: {
            rankChange: 3,
            newRank: 12
          }
        },
        {
          id: '4',
          type: 'challenge',
          title: 'Challenge Invitation',
          message: 'Mike invited you to join the "Consistency Champions" challenge',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          isRead: true,
          priority: 'medium',
          actionable: true,
          actionText: 'Accept Challenge',
          metadata: {
            friendId: '456',
            friendName: 'Mike',
            challengeId: 'consistency_champions'
          }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'friend_activity': return <Users className="w-4 h-4 text-blue-500" />;
      case 'challenge': return <Target className="w-4 h-4 text-purple-500" />;
      case 'leaderboard': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'social': return <MessageCircle className="w-4 h-4 text-pink-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'actionable': return notification.actionable;
      default: return true;
    }
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 top-4 bottom-4 w-96 z-50"
      >
        <Card className="h-full flex flex-col shadow-2xl border-2">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'actionable', label: 'Actions', count: notifications.filter(n => n.actionable).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 text-xs bg-muted px-1 rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border-l-4 p-4 border-b hover:bg-muted/30 transition-colors ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.metadata?.avatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.metadata.avatar} />
                            <AvatarFallback>
                              {notification.metadata.friendName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              {!notification.isRead && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="w-6 h-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="w-6 h-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {notification.actionable && notification.actionText && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs h-7"
                            onClick={() => {
                              onNotificationAction?.(notification);
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Real-time updates enabled</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}