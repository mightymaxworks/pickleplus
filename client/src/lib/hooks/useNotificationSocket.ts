/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - WebSocket Hook for Notifications 
 * Implementation timestamp: 2025-04-20 10:30 ET
 * 
 * React hook for managing WebSocket connections to receive real-time notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    debugMode = false
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<NotificationMessage | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debug = useCallback((message: string, ...args: any[]) => {
    if (debugMode) {
      console.log(`[NotificationSocket] ${message}`, ...args);
    }
  }, [debugMode]);
  
  const connect = useCallback(() => {
    if (!user?.id) {
      debug('Not connecting: No user ID');
      return;
    }
    
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      debug('Already connected or connecting');
      return;
    }
    
    try {
      setConnecting(true);
      
      // Determine proper WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
      
      debug(`Connecting to ${wsUrl}`);
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        debug('Connection opened');
        
        // Send authentication message with user ID
        socket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
        
        reconnectAttemptsRef.current = 0;
        setConnecting(false);
        setConnected(true);
        
        if (onConnect) {
          onConnect();
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const message: NotificationMessage = JSON.parse(event.data);
          debug('Received message:', message);
          
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'connection_confirmed':
              debug('Connection confirmed by server');
              break;
              
            case 'unread_count':
              if (message.data && typeof message.data.count === 'number') {
                setUnreadCount(message.data.count);
                debug(`Unread count: ${message.data.count}`);
              }
              break;
              
            case 'new_notification':
              // Increment unread count and show toast
              setUnreadCount(prev => prev + 1);
              
              // Show toast notification if provided
              if (message.data?.title) {
                toast({
                  title: message.data.title,
                  description: message.data.message,
                  duration: 5000
                });
              }
              break;
              
            case 'notification_read':
              // Decrement unread count if greater than 0
              setUnreadCount(prev => Math.max(0, prev - 1));
              break;
              
            case 'all_read':
              // Reset unread count to 0
              setUnreadCount(0);
              break;
              
            case 'notification_deleted':
              // No change to unread count as deletion doesn't affect read status
              break;
              
            case 'notification_batch':
              // Update unread count if provided in batch
              if (message.data?.unreadCount !== undefined) {
                setUnreadCount(message.data.unreadCount);
              }
              break;
              
            default:
              debug(`Unknown message type: ${message.type}`);
          }
          
          // Call custom message handler if provided
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('[NotificationSocket] Error parsing message:', error);
        }
      };
      
      socket.onclose = (event) => {
        debug(`Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);
        setConnecting(false);
        
        if (onDisconnect) {
          onDisconnect();
        }
        
        // Handle reconnection
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          debug(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      
      socket.onerror = (error) => {
        console.error('[NotificationSocket] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[NotificationSocket] Error establishing connection:', error);
      setConnecting(false);
    }
  }, [user?.id, debug, onConnect, onDisconnect, onMessage, toast, autoReconnect, maxReconnectAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    debug('Disconnecting...');
    
    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close socket if open
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    
    setConnected(false);
    setConnecting(false);
  }, [debug]);
  
  // Connect when component mounts and user is authenticated
  useEffect(() => {
    if (user?.id) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);
  
  return {
    connected,
    connecting,
    connect,
    disconnect,
    unreadCount,
    lastMessage
  };
};