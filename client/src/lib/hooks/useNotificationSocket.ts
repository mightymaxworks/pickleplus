/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - WebSocket Hook for Notifications 
 * Implementation timestamp: 2025-04-20 15:00 ET
 * 
 * React hook for managing WebSocket connections to receive real-time notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationMessage {
  type: 'new_notification' | 'notification_read' | 'all_read' | 'notification_deleted' | 'notification_batch' | 'unread_count' | 'connection_confirmed' | 'read_all';
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
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<NotificationMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const log = useCallback((message: string, ...args: any[]) => {
    if (debugMode) {
      console.log(`[NotificationSocket] ${message}`, ...args);
    }
  }, [debugMode]);

  const connect = useCallback(() => {
    if (!user || !user.id) {
      log('Cannot connect: no authenticated user');
      return;
    }

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      log('WebSocket already connected or connecting');
      return;
    }

    setConnecting(true);
    log('Connecting to notifications WebSocket...');

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${user.id}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      log('WebSocket connection established');
      setConnected(true);
      setConnecting(false);
      reconnectAttemptsRef.current = 0;
      if (onConnect) onConnect();
    };

    socket.onmessage = (event) => {
      try {
        const message: NotificationMessage = JSON.parse(event.data);
        log('Received message:', message);
        
        setLastMessage(message);
        
        // Handle unread count updates
        if (message.type === 'unread_count' && typeof message.data === 'number') {
          setUnreadCount(message.data);
        }
        
        // Pass message to callback if provided
        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        log('Error parsing message:', error);
      }
    };

    socket.onclose = (event) => {
      log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      setConnected(false);
      setConnecting(false);
      
      if (onDisconnect) onDisconnect();
      
      // Handle automatic reconnection
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        log(`Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval);
      }
    };

    socket.onerror = (error) => {
      log('WebSocket error:', error);
    };

  }, [user, onConnect, onDisconnect, onMessage, autoReconnect, reconnectInterval, maxReconnectAttempts, log]);

  const disconnect = useCallback(() => {
    log('Disconnecting from WebSocket');
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close the socket if it exists
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    
    setConnected(false);
    setConnecting(false);
  }, [log]);

  // Connect on mount if user is available
  useEffect(() => {
    if (user && user.id) {
      connect();
    }
    
    // Cleanup on unmount
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

export default useNotificationSocket;