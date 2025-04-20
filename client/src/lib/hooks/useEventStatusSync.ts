/**
 * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
 * 
 * This hook provides real-time event status updates using WebSocket connections.
 * It allows components to subscribe to status changes for specific events or all events.
 * 
 * Framework5.2 compliant with defensive programming and proper error handling.
 * 
 * @implementation Framework5.2
 * @lastModified 2025-04-20
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
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
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  /**
   * Establish WebSocket connection to listen for event status updates
   * Framework5.2 compliant with proper connection error handling
   */
  const connectWebSocket = useCallback(() => {
    if (!user?.id) return;

    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      // Create WebSocket URL with proper protocol detection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
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
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(subscribeMessage));
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
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        
        // Only attempt reconnection if not a clean close and within max attempts
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectAttemptsRef.current += 1;
          // @ts-ignore - setTimeout returns number in browser
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          toast({
            title: 'Connection Issues',
            description: 'Unable to receive real-time event updates. Please refresh the page.',
            variant: 'destructive'
          });
        }
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setIsConnected(false);
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
      
      socket.send(JSON.stringify(updateMessage));
    }
  }, [eventIds, myEventsOnly, user?.id]);

  return {
    isConnected,
    reconnect: connectWebSocket
  };
}

export default useEventStatusSync;