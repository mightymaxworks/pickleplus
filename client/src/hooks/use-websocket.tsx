/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Hook
 * 
 * This custom hook manages WebSocket connections and provides real-time
 * data subscription capabilities to React components.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

type MessageHandler = (data: any) => void;
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  /**
   * Enable automatic reconnection
   */
  autoReconnect?: boolean;
  
  /**
   * Number of milliseconds to wait between reconnection attempts
   */
  reconnectInterval?: number;
  
  /**
   * Maximum number of reconnection attempts
   */
  maxReconnectAttempts?: number;
  
  /**
   * Callback when connection status changes
   */
  onStatusChange?: (status: ConnectionStatus) => void;
}

/**
 * Custom hook for WebSocket connections with auto-reconnect and subscription management
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { 
    autoReconnect = true, 
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onStatusChange
  } = options;
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const messageHandlers = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const { toast } = useToast();

  // Update external status handler
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Connect to the WebSocket server
  const connect = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setStatus('connecting');
      
      // Create WebSocket connection - use the same host but with ws/wss protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setStatus('connected');
        reconnectAttempts.current = 0;
        
        // Re-subscribe to topics if needed
        const topics = Array.from(messageHandlers.current.keys());
        if (topics.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            topics
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Handle connection-level messages
          if (data.type === 'connection' && data.status === 'connected') {
            console.log('[WebSocket] Connection confirmed:', data.clientId);
          }
          
          // Dispatch to topic handlers
          if (data.topic && messageHandlers.current.has(data.topic)) {
            const handlers = messageHandlers.current.get(data.topic);
            if (handlers) {
              handlers.forEach(handler => {
                try {
                  handler(data.payload || data);
                } catch (error) {
                  console.error('[WebSocket] Error in message handler:', error);
                }
              });
            }
          }
          
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };
      
      ws.onclose = () => {
        setStatus('disconnected');
        console.log('[WebSocket] Disconnected');
        
        // Attempt to reconnect if enabled
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setStatus('error');
          toast({
            title: 'Connection error',
            description: 'Unable to connect to real-time updates. Please refresh the page.',
            variant: 'destructive'
          });
        }
      };
      
      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatus('error');
      };
      
      // Store the WebSocket instance
      socket.current = ws;
      
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setStatus('error');
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectInterval, toast]);

  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
      setStatus('disconnected');
    }
  }, []);

  // Subscribe to a topic
  const subscribe = useCallback((topic: string, handler: MessageHandler) => {
    // Initialize handlers set for this topic if it doesn't exist
    if (!messageHandlers.current.has(topic)) {
      messageHandlers.current.set(topic, new Set());
      
      // Send subscription message if socket is connected
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          type: 'subscribe',
          topics: [topic]
        }));
      }
    }
    
    // Add handler to the set
    messageHandlers.current.get(topic)?.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = messageHandlers.current.get(topic);
      if (handlers) {
        handlers.delete(handler);
        
        // If no more handlers for this topic, unsubscribe
        if (handlers.size === 0) {
          messageHandlers.current.delete(topic);
          
          if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({
              type: 'unsubscribe',
              topics: [topic]
            }));
          }
        }
      }
    };
  }, []);

  // Send a message to the server
  const send = useCallback((message: any) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Connect when the hook is initialized
  useEffect(() => {
    connect();
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    send,
    isConnected: status === 'connected'
  };
}