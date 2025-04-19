/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Hook
 * 
 * This hook provides a WebSocket connection to the server for real-time updates.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  topic?: string;
  data?: any;
  status?: string;
  clientId?: string;
  message?: string;
  topics?: string[];
}

export interface WebSocketHook {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  subscribe: (topics: string[]) => void;
  unsubscribe: (topics: string[]) => void;
  send: (data: any) => void;
  error: Error | null;
}

const parseMessage = (data: string): WebSocketMessage => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('[WebSocket] Error parsing message:', error);
    return { type: 'error', message: 'Failed to parse message' };
  }
};

export const useWebSocket = (userId?: number): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Use secure WebSocket if on HTTPS
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    
    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Set up event handlers
    socket.onopen = () => {
      console.log('[WebSocket] Connection established');
      setIsConnected(true);
      setError(null);
      
      // Authenticate with user ID if available
      if (userId) {
        socket.send(JSON.stringify({ 
          type: 'auth', 
          userId 
        }));
      }
    };
    
    socket.onmessage = (event) => {
      const message = parseMessage(event.data);
      console.log('[WebSocket] Message received:', message);
      setLastMessage(message);
    };
    
    socket.onerror = (event) => {
      console.error('[WebSocket] Error:', event);
      setError(new Error('WebSocket connection error'));
    };
    
    socket.onclose = (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason);
      setIsConnected(false);
      
      // Attempt to reconnect after delay if not closed intentionally
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          // The component will re-render and the useEffect will run again
        }, 5000);
      }
    };
    
    // Clean up on unmount
    return () => {
      console.log('[WebSocket] Closing connection');
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [userId]);
  
  // Subscribe to topics
  const subscribe = useCallback((topics: string[]) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: 'subscribe', 
        topics 
      }));
    } else {
      console.warn('[WebSocket] Cannot subscribe, socket not connected');
    }
  }, []);
  
  // Unsubscribe from topics
  const unsubscribe = useCallback((topics: string[]) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: 'unsubscribe', 
        topics 
      }));
    } else {
      console.warn('[WebSocket] Cannot unsubscribe, socket not connected');
    }
  }, []);
  
  // Send custom data
  const send = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send, socket not connected');
    }
  }, []);
  
  return {
    isConnected,
    lastMessage,
    subscribe,
    unsubscribe,
    send,
    error
  };
};

export default useWebSocket;