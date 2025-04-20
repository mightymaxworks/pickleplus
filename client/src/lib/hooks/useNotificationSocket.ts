/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - WebSocket Hook for Notifications 
 * Implementation timestamp: 2025-04-20 10:30 ET
 * 
 * React hook for managing WebSocket connections to receive real-time notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Corrected import path
import { useToast } from '../../hooks/use-toast'; // Corrected import path

export interface NotificationMessage {
  type: 'new_notification' | 'notification_read' | 'all_read' | 'notification_deleted' | 'notification_batch' | 'unread_count' | 'connection_confirmed';
  data?: any;
  message?: string;
}

interface UseNotificationSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: NotificationMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  debugMode?: boolean;
}

interface UseNotificationSocketReturn {
  connected: boolean;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
  unreadCount: number;
  lastMessage: NotificationMessage | null;
}

export const useNotificationSocket = (options: UseNotificationSocketOptions = {}): UseNotificationSocketReturn => {
  const { 
    autoReconnect = true, 
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    debugMode = false
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<NotificationMessage | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const log = useCallback((message: string, ...args: any[]) => {
    if (debugMode) {
      console.log(`[NotificationSocket] ${message}`, ...args);
    }
  }, [debugMode]);
  
  // Connect to the WebSocket server
  const connect = useCallback(() => {
    if (!user || !user.id) {
      log('Not connecting - user not authenticated');
      return;
    }
    
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      log('Socket already connected or connecting');
      return;
    }
    
    try {
      setConnecting(true);
      
      // Determine the correct protocol (ws or wss)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${user.id}`;
      
      log(`Connecting to ${wsUrl}`);
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        log('Connection established');
        setConnected(true);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
        if (onConnect) onConnect();
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const message: NotificationMessage = JSON.parse(event.data);
          log('Message received', message);
          
          setLastMessage(message);
          
          // Update unread count if that's the message type
          if (message.type === 'unread_count' && typeof message.data === 'number') {
            setUnreadCount(message.data);
          } else if (message.type === 'new_notification') {
            // Increment unread count and show toast for new notifications
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            const notification = message.data;
            if (notification) {
              toast({
                title: notification.title || 'New notification',
                description: notification.message || '',
                variant: 'default',
              });
            }
          } else if (message.type === 'all_read') {
            // Reset unread count when all are marked as read
            setUnreadCount(0);
          } else if (message.type === 'notification_read') {
            // Decrement unread count when a notification is marked as read
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          
          // Call the onMessage callback if provided
          if (onMessage) onMessage(message);
        } catch (error) {
          log('Error parsing message', error);
        }
      };
      
      socketRef.current.onclose = (event) => {
        log(`Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);
        setConnecting(false);
        
        if (onDisconnect) onDisconnect();
        
        // Attempt to reconnect if enabled
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          log(`Attempting to reconnect in ${reconnectInterval}ms. Attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts}`);
          
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          log('Max reconnect attempts reached. Giving up.');
          toast({
            title: 'Notification service disconnected',
            description: 'Could not reconnect to real-time notifications. Please refresh the page.',
            variant: 'destructive',
          });
        }
      };
      
      socketRef.current.onerror = (error) => {
        log('WebSocket error', error);
        toast({
          title: 'Notification service error',
          description: 'There was an error connecting to real-time notifications.',
          variant: 'destructive',
        });
      };
    } catch (error) {
      log('Error creating WebSocket connection', error);
      setConnecting(false);
      setConnected(false);
    }
  }, [user, log, onConnect, onMessage, onDisconnect, autoReconnect, maxReconnectAttempts, reconnectInterval, toast]);
  
  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (socketRef.current) {
      log('Disconnecting socket');
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setConnected(false);
    setConnecting(false);
  }, [log]);
  
  // Connect when the component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);
  
  return {
    connected,
    connecting,
    connect,
    disconnect,
    unreadCount,
    lastMessage
  };
};