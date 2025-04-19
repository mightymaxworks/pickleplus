/**
 * PKL-278651-COMM-0022-FEED
 * useWebSocket Hook
 * 
 * This hook manages WebSocket connections and subscriptions for real-time updates.
 * It includes auto-reconnect functionality and provides an easy way for components
 * to subscribe to specific topics.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// Define WebSocket connection states
export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
}

// WebSocket event types
type WebSocketEvent = 'message' | 'open' | 'close' | 'error';

// WebSocket message handler type
type MessageHandler = (data: any) => void;

// WebSocket topic subscriber type
interface TopicSubscriber {
  topic: string;
  callback: MessageHandler;
}

// WebSocket hook options
interface UseWebSocketOptions {
  // List of topics to subscribe to
  subscribeTopics?: string[];
  // Auto-reconnect settings
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  // Callback handlers
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: MessageHandler;
}

// Default WebSocket options
const defaultOptions: UseWebSocketOptions = {
  subscribeTopics: [],
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
};

/**
 * Hook to manage WebSocket connections and subscriptions
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  // WebSocket connection state
  const [connectionState, setConnectionState] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
  // WebSocket instance ref
  const socketRef = useRef<WebSocket | null>(null);
  // Keep track of subscribers
  const subscribersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  // Track reconnection attempts
  const reconnectAttemptsRef = useRef(0);
  // Track if component is mounted
  const isMountedRef = useRef(true);
  // Client ID assigned by server
  const [clientId, setClientId] = useState<string | null>(null);
  // Authentication status from server
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /**
   * Get WebSocket server URL
   */
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, []);
  
  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    try {
      // Create new WebSocket connection
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;
      setConnectionState(WebSocketState.CONNECTING);
      
      // Set up event handlers
      socket.onopen = () => {
        if (!isMountedRef.current) return;
        
        console.log('[WebSocket] Connected to server');
        setConnectionState(WebSocketState.CONNECTED);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to all requested topics
        if (opts.subscribeTopics && opts.subscribeTopics.length > 0) {
          subscribe(opts.subscribeTopics);
        }
        
        // Call onOpen callback if provided
        if (opts.onOpen) {
          opts.onOpen();
        }
      };
      
      socket.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          
          // Handle connection confirmation message
          if (data.type === 'connection' && data.status === 'connected') {
            setClientId(data.clientId);
            setIsAuthenticated(data.isAuthenticated);
          }
          
          // Handle regular messages with a topic
          if (data.topic) {
            // Call topic subscribers
            const topicSubscribers = subscribersRef.current.get(data.topic);
            if (topicSubscribers) {
              topicSubscribers.forEach(callback => {
                try {
                  callback(data.payload);
                } catch (error) {
                  console.error(`[WebSocket] Error in subscriber callback for topic ${data.topic}:`, error);
                }
              });
            }
          }
          
          // Call global message handler if provided
          if (opts.onMessage) {
            opts.onMessage(data);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };
      
      socket.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        console.log(`[WebSocket] Connection closed (code: ${event.code}, reason: ${event.reason})`);
        setConnectionState(WebSocketState.DISCONNECTED);
        socketRef.current = null;
        
        // Call onClose callback if provided
        if (opts.onClose) {
          opts.onClose();
        }
        
        // Auto-reconnect if enabled
        if (opts.autoReconnect) {
          if (reconnectAttemptsRef.current < (opts.maxReconnectAttempts || 5)) {
            console.log(`[WebSocket] Reconnecting in ${opts.reconnectInterval}ms (attempt ${reconnectAttemptsRef.current + 1}/${opts.maxReconnectAttempts})`);
            setConnectionState(WebSocketState.RECONNECTING);
            setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, opts.reconnectInterval);
          } else {
            console.error('[WebSocket] Max reconnect attempts reached');
          }
        }
      };
      
      socket.onerror = (error) => {
        if (!isMountedRef.current) return;
        
        console.error('[WebSocket] Connection error:', error);
        
        // Call onError callback if provided
        if (opts.onError) {
          opts.onError(error);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Error creating connection:', error);
      setConnectionState(WebSocketState.DISCONNECTED);
    }
  }, [getWebSocketUrl, opts]);
  
  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setConnectionState(WebSocketState.DISCONNECTED);
    }
  }, []);
  
  /**
   * Subscribe to topics
   */
  const subscribe = useCallback((topics: string[]) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot subscribe to topics: not connected');
      return;
    }
    
    // Send subscribe message
    socketRef.current.send(JSON.stringify({
      type: 'subscribe',
      topics
    }));
    
    console.log('[WebSocket] Subscribed to topics:', topics);
  }, []);
  
  /**
   * Unsubscribe from topics
   */
  const unsubscribe = useCallback((topics: string[]) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot unsubscribe from topics: not connected');
      return;
    }
    
    // Send unsubscribe message
    socketRef.current.send(JSON.stringify({
      type: 'unsubscribe',
      topics
    }));
    
    console.log('[WebSocket] Unsubscribed from topics:', topics);
  }, []);
  
  /**
   * Add a message handler for a specific topic
   */
  const addTopicListener = useCallback((topic: string, callback: MessageHandler) => {
    if (!subscribersRef.current.has(topic)) {
      subscribersRef.current.set(topic, new Set());
    }
    
    subscribersRef.current.get(topic)?.add(callback);
    
    // Subscribe to the topic on the server if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      subscribe([topic]);
    }
    
    // Return unsubscribe function
    return () => {
      const topicSubscribers = subscribersRef.current.get(topic);
      if (topicSubscribers) {
        topicSubscribers.delete(callback);
        
        // If no more subscribers for this topic, unsubscribe from the server
        if (topicSubscribers.size === 0) {
          subscribersRef.current.delete(topic);
          
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            unsubscribe([topic]);
          }
        }
      }
    };
  }, [subscribe, unsubscribe]);
  
  /**
   * Connect when the component mounts
   */
  useEffect(() => {
    isMountedRef.current = true;
    connect();
    
    // Clean up when the component unmounts
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);
  
  /**
   * Return hook API
   */
  return {
    connectionState,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    addTopicListener,
    clientId,
    isAuthenticated,
    WebSocketState
  };
}

export default useWebSocket;