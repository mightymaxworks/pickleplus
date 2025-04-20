/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Notification WebSocket Service
 * Implementation timestamp: 2025-04-20 10:00 ET
 * 
 * Real-time notification service using WebSockets for instant notification delivery
 * This service enables push-style notification delivery rather than pull-based refreshing
 * 
 * Framework 5.2 compliant implementation
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from '../../storage';
import { EventBus } from '../../core/events/event-bus';
import { logger } from '../../utils/logger';

interface NotificationMessage {
  type: 'new_notification' | 'notification_read' | 'all_read' | 'notification_deleted' | 'notification_batch';
  data: any;
}

export class NotificationWebSocketService {
  private wss: WebSocketServer;
  private userConnections: Map<number, Set<WebSocket>> = new Map();
  private eventBus: EventBus;

  constructor(httpServer: HttpServer, eventBus: EventBus) {
    // Create WebSocket server with a distinct path to avoid conflicts
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws/notifications'
    });
    
    this.eventBus = eventBus;
    this.initialize();
    
    logger.info('[WebSocket] Notification WebSocket service initialized successfully');
  }

  private initialize() {
    // Set up connection event
    this.wss.on('connection', (ws: WebSocket, request) => {
      // Extract userId from the request (from session)
      let userId: number | null = null;
      
      // Function to handle authentication on connection
      const handleAuth = async (message: any) => {
        if (message.type === 'auth') {
          userId = message.userId;
          
          if (userId) {
            // Store connection by user ID
            if (!this.userConnections.has(userId)) {
              this.userConnections.set(userId, new Set());
            }
            this.userConnections.get(userId)?.add(ws);
            
            // Send connection confirmation
            ws.send(JSON.stringify({
              type: 'connection_confirmed',
              message: 'Successfully connected to notifications service'
            }));
            
            // Log connection
            logger.info(`[WebSocket] User ${userId} connected to notification service`);
            
            // Send any unread notifications count immediately
            try {
              const unreadCount = await storage.getUnreadNotificationCount(userId);
              ws.send(JSON.stringify({
                type: 'unread_count',
                data: { count: unreadCount }
              }));
            } catch (error) {
              logger.error(`[WebSocket] Error fetching unread count for user ${userId}:`, error);
            }
          }
        }
      };
      
      // Handle incoming messages
      ws.on('message', (message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          handleAuth(parsedMessage);
        } catch (error) {
          logger.error('[WebSocket] Error parsing message:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        if (userId) {
          // Remove connection from user's connections
          this.userConnections.get(userId)?.delete(ws);
          
          // Clean up empty sets
          if (this.userConnections.get(userId)?.size === 0) {
            this.userConnections.delete(userId);
          }
          
          logger.info(`[WebSocket] User ${userId} disconnected from notification service`);
        }
      });
    });
    
    // Subscribe to notification events
    this.subscribeToEvents();
  }
  
  private subscribeToEvents() {
    // Listen for notification created events
    this.eventBus.subscribe('notification.created', (notification) => {
      this.sendNotificationToUser(notification.userId, {
        type: 'new_notification',
        data: notification
      });
    });
    
    // Listen for notification read events
    this.eventBus.subscribe('notification.read', (data) => {
      this.sendNotificationToUser(data.userId, {
        type: 'notification_read',
        data: { id: data.notificationId }
      });
    });
    
    // Listen for all notifications read events
    this.eventBus.subscribe('notification.all_read', (data) => {
      this.sendNotificationToUser(data.userId, {
        type: 'all_read',
        data: {}
      });
    });
    
    // Listen for notification deleted events
    this.eventBus.subscribe('notification.deleted', (data) => {
      this.sendNotificationToUser(data.userId, {
        type: 'notification_deleted',
        data: { id: data.notificationId }
      });
    });
  }
  
  /**
   * Send a notification to a specific user through all their active connections
   */
  public sendNotificationToUser(userId: number, message: NotificationMessage) {
    const connections = this.userConnections.get(userId);
    
    if (connections && connections.size > 0) {
      const messageStr = JSON.stringify(message);
      
      connections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(messageStr);
        }
      });
      
      logger.debug(`[WebSocket] Sent ${message.type} to user ${userId} (${connections.size} active connections)`);
    }
  }
  
  /**
   * Broadcast a notification to all connected users
   * Used for system-wide announcements
   */
  public broadcastNotification(message: NotificationMessage) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
    
    logger.info(`[WebSocket] Broadcast notification to ${this.wss.clients.size} clients`);
  }
  
  /**
   * Get the current connection count
   */
  public getConnectionStats() {
    return {
      totalConnections: this.wss.clients.size,
      uniqueUsers: this.userConnections.size
    };
  }
}

// Singleton instance
let notificationWebSocketService: NotificationWebSocketService | null = null;

export function getNotificationWebSocketService(
  httpServer?: HttpServer,
  eventBus?: EventBus
): NotificationWebSocketService {
  if (!notificationWebSocketService && httpServer && eventBus) {
    notificationWebSocketService = new NotificationWebSocketService(httpServer, eventBus);
  }
  
  if (!notificationWebSocketService) {
    throw new Error('NotificationWebSocketService not initialized');
  }
  
  return notificationWebSocketService;
}