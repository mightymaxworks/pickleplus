/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Hook
 * 
 * This hook provides a WebSocket connection with automatic reconnection capabilities
 * for real-time updates and messaging.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

// WebSocket connection states
export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

// WebSocket message interface
export interface WebSocketMessage {
  type: string;
  data: string;
  topic?: string;
  timestamp: number;
}

// Topic subscription callback
export type MessageHandler = (message: WebSocketMessage) => void;

// WebSocket hook options
export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  subscribeToEvents?: (subscribe: (topic: string) => void) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    subscribeToEvents,
    onConnected,
    onDisconnected,
    onMessage
  } = options;
  
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState<WebSocketState>(WebSocketState.CLOSED);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [clientId, setClientId] = useState<string | null>(null);
  const [subscribedTopics, setSubscribedTopics] = useState<Set<string>>(new Set());
  
  const socketRef = useRef<WebSocket | null>(null);
  const topicListenersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get WebSocket URL based on current environment
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, []);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clear any existing reconnect timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Don't connect if already connecting or connected
    if (
      socketRef.current && 
      (socketRef.current.readyState === WebSocketState.CONNECTING || 
       socketRef.current.readyState === WebSocketState.OPEN)
    ) {
      return;
    }
    
    // Create new WebSocket connection
    try {
      const wsUrl = getWebSocketUrl();
      socketRef.current = new WebSocket(wsUrl);
      setConnectionState(WebSocketState.CONNECTING);
      
      // Set up event handlers
      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionState(WebSocketState.OPEN);
        setReconnectCount(0);
        
        // Re-subscribe to topics
        if (subscribedTopics.size > 0) {
          const topics = Array.from(subscribedTopics);
          socketRef.current?.send(JSON.stringify({
            type: 'subscribe',
            topics
          }));
        }
        
        // Call onConnected callback
        if (onConnected) {
          onConnected();
        }
      };
      
      socketRef.current.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setConnectionState(WebSocketState.CLOSED);
        
        // Call onDisconnected callback
        if (onDisconnected) {
          onDisconnected();
        }
        
        // Attempt to reconnect if not intentionally closed
        if (reconnectCount < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectCount + 1}/${maxReconnectAttempts})...`);
          reconnectTimerRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
        } else {
          console.log('Max reconnect attempts reached, giving up');
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          message.timestamp = message.timestamp || Date.now();
          
          // Handle client ID assignment
          if (message.type === 'client_id') {
            setClientId(message.data);
            return;
          }
          
          // Update last message
          setLastMessage(message);
          
          // Call general message handler
          if (onMessage) {
            onMessage(message);
          }
          
          // Call topic-specific handlers
          if (message.topic && topicListenersRef.current.has(message.topic)) {
            const handlers = topicListenersRef.current.get(message.topic);
            if (handlers) {
              handlers.forEach(handler => handler(message));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionState(WebSocketState.CLOSED);
      
      // Attempt to reconnect
      if (reconnectCount < maxReconnectAttempts) {
        reconnectTimerRef.current = setTimeout(() => {
          setReconnectCount(prev => prev + 1);
          connect();
        }, reconnectInterval);
      }
    }
  }, [
    getWebSocketUrl, 
    onConnected, 
    onDisconnected, 
    onMessage, 
    reconnectCount, 
    maxReconnectAttempts, 
    reconnectInterval,
    subscribedTopics
  ]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    setReconnectCount(0);
    setConnectionState(WebSocketState.CLOSED);
  }, []);
  
  // Subscribe to topics
  const subscribe = useCallback((topics: string[]) => {
    if (topics.length === 0) return;
    
    // Update subscribed topics
    const newTopics = topics.filter(topic => !subscribedTopics.has(topic));
    if (newTopics.length === 0) return;
    
    const updatedTopics = new Set(subscribedTopics);
    newTopics.forEach(topic => updatedTopics.add(topic));
    setSubscribedTopics(updatedTopics);
    
    // If connected, send subscribe message
    if (socketRef.current?.readyState === WebSocketState.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'subscribe',
        topics: newTopics
      }));
    }
  }, [subscribedTopics]);
  
  // Unsubscribe from topics
  const unsubscribe = useCallback((topics: string[]) => {
    if (topics.length === 0) return;
    
    // Update subscribed topics
    const topicsToRemove = topics.filter(topic => subscribedTopics.has(topic));
    if (topicsToRemove.length === 0) return;
    
    const updatedTopics = new Set(subscribedTopics);
    topicsToRemove.forEach(topic => updatedTopics.delete(topic));
    setSubscribedTopics(updatedTopics);
    
    // If connected, send unsubscribe message
    if (socketRef.current?.readyState === WebSocketState.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        topics: topicsToRemove
      }));
    }
  }, [subscribedTopics]);
  
  // Add a topic-specific listener
  const addTopicListener = useCallback((topic: string, callback: MessageHandler) => {
    if (!topicListenersRef.current.has(topic)) {
      topicListenersRef.current.set(topic, new Set());
    }
    
    topicListenersRef.current.get(topic)?.add(callback);
    
    // Return a function to remove the listener
    return () => {
      const listeners = topicListenersRef.current.get(topic);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          topicListenersRef.current.delete(topic);
        }
      }
    };
  }, []);
  
  // Auto-connect when hook is mounted
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [autoConnect, connect]);
  
  // Set up event subscriptions
  useEffect(() => {
    if (subscribeToEvents && connectionState === WebSocketState.OPEN) {
      const subscribeFn = (topic: string) => {
        subscribe([topic]);
      };
      
      subscribeToEvents(subscribeFn);
    }
  }, [subscribeToEvents, connectionState, subscribe]);
  
  // Compute isConnected state
  const isConnected = connectionState === WebSocketState.OPEN;
  
  // Compute isAuthenticated state
  const isAuthenticated = !!user && !!clientId;
  
  return {
    connectionState,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    addTopicListener,
    clientId,
    isAuthenticated,
    WebSocketState,
    lastMessage,
    isConnected
  };
}

export default useWebSocket;