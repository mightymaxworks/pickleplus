/**
 * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
 * 
 * This hook provides real-time event status updates using WebSocket connections.
 * It allows components to subscribe to status changes for specific events or all events.
 * 
 * Framework5.2 compliant with defensive programming and proper error handling.
 * 
 * @implementation Framework5.2
 * @lastModified 2025-04-21
 * @bugfix Added graceful degradation for WebSocket connection failures
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import type { Event } from '@shared/schema/events';

type EventStatusUpdate = {
  eventId: number;
  type: 'registration_status' | 'attendance' | 'capacity' | 'cancelled' | 'rescheduled';
  data: {
    status?: boolean;
    currentAttendees?: number;
    maxAttendees?: number;
    startDateTime?: string;
    endDateTime?: string;
    isCancelled?: boolean;
  };
  timestamp: string;
};

interface UseEventStatusSyncOptions {
  /** Event IDs to subscribe to status updates for. If empty, subscribes to all events */
  eventIds?: number[];
  /** Whether to receive updates for events the user is registered for */
  myEventsOnly?: boolean;
  /** Callback when an event status changes */
  onStatusChange?: (update: EventStatusUpdate) => void;
}

export function useEventStatusSync({
  eventIds = [],
  myEventsOnly = false,
  onStatusChange,
}: UseEventStatusSyncOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const websocketEnabledRef = useRef<boolean>(true);
  const MAX_RECONNECT_ATTEMPTS = 3;  // Reduced to prevent too many attempts
  const RECONNECT_DELAY = 5000; // Increased to 5 seconds

  /**
   * Establish WebSocket connection to listen for event status updates
   * Framework5.2 compliant with proper connection error handling
   */
  const connectWebSocket = useCallback(() => {
    // Bail early if no user ID or websockets have been disabled
    if (!user?.id || !websocketEnabledRef.current) return;

    try {
      // Close existing connection if any
      if (socketRef.current) {
        try {
          // Only attempt to close if it's open
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.close();
          }
        } catch (closeError) {
          console.error('Error closing WebSocket:', closeError);
        }
      }

      // Create WebSocket URL with proper protocol detection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create new WebSocket with try-catch to handle any connection errors
      let socket: WebSocket;
      try {
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;
      } catch (wsError) {
        console.error('WebSocket creation error:', wsError);
        websocketEnabledRef.current = false; // Disable WebSocket functionality
        setIsConnected(false);
        return;
      }

      // Set timeout to catch hanging connections
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout');
          try {
            socket.close();
          } catch (e) {
            // Ignore errors when closing timed out socket
          }
        }
      }, 10000); // 10 second timeout

      socket.onopen = () => {
        clearTimeout(connectionTimeout); // Clear timeout when connection succeeds
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to events
        const subscribeMessage = {
          type: 'subscribe',
          channel: 'event_status',
          filter: {
            eventIds: eventIds.length > 0 ? eventIds : undefined,
            myEventsOnly,
            userId: user.id
          }
        };
        
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(subscribeMessage));
          }
        } catch (sendError) {
          console.error('Error sending subscription message:', sendError);
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'event_status_update') {
            const update = data.payload as EventStatusUpdate;
            
            // Invalidate relevant queries to refresh UI
            queryClient.invalidateQueries({ 
              queryKey: ['/api/events/upcoming']
            });
            
            if (update.type === 'registration_status') {
              queryClient.invalidateQueries({
                queryKey: ['/api/events/registration-status']
              });
              
              queryClient.invalidateQueries({
                queryKey: ['/api/events/my/registered']
              });
            }
            
            // Call the callback if provided
            if (onStatusChange) {
              onStatusChange(update);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        
        // If we get an error, increment the attempt counter
        reconnectAttemptsRef.current += 1;
        
        // If we've hit the max attempts, disable WebSockets
        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          websocketEnabledRef.current = false;
          
          // Clear any pending reconnection timeouts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        }
      };

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout); // Clear timeout on close too
        setIsConnected(false);
        
        // Only attempt reconnection if:
        // 1. Not a clean close AND
        // 2. Within max attempts AND
        // 3. WebSockets are still enabled
        if (!event.wasClean && 
            reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && 
            websocketEnabledRef.current) {
            
          // Clear any existing reconnection timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Set a new reconnection timeout
          // @ts-ignore - setTimeout returns number in browser
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_DELAY);
        } 
        // If we've hit the max attempts, disable WebSockets silently
        else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          websocketEnabledRef.current = false;
          console.log('WebSocket reconnection disabled after max attempts');
          // We don't show a toast to avoid disturbing the user
        }
      };
    } catch (error) {
      console.error('Unexpected error in WebSocket setup:', error);
      setIsConnected(false);
      websocketEnabledRef.current = false; // Disable WebSockets on unexpected errors
    }
  }, [eventIds, myEventsOnly, user, queryClient, toast, onStatusChange]);

  // Connect WebSocket when component mounts or dependencies change
  useEffect(() => {
    if (user?.id) {
      connectWebSocket();
    }
    
    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket, user?.id]);

  // Update subscription if event IDs change
  useEffect(() => {
    if (!websocketEnabledRef.current) return; // Skip if websockets are disabled
    
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN && user?.id) {
      const updateMessage = {
        type: 'update_subscription',
        channel: 'event_status',
        filter: {
          eventIds: eventIds.length > 0 ? eventIds : undefined,
          myEventsOnly,
          userId: user.id
        }
      };
      
      try {
        socket.send(JSON.stringify(updateMessage));
      } catch (error) {
        console.error('Error updating subscription:', error);
        // Don't disable websockets on update failure as it's not critical
      }
    }
  }, [eventIds, myEventsOnly, user?.id]);

  return {
    isConnected,
    isEnabled: websocketEnabledRef.current,
    reconnect: connectWebSocket
  };
}

export default useEventStatusSync;