/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Notification WebSocket Service
 * Implementation timestamp: 2025-04-20 11:05 ET
 * 
 * WebSocket service for handling real-time notification delivery
 * 
 * Framework 5.2 compliant implementation
 */

import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { EventBus } from '../../core/events/event-bus';
import { logger } from '../../utils/logger';
import { storage } from '../../storage';

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

interface NotificationMessage {
  type: string;
  data?: any;
  message?: string;
}

class NotificationWebSocketService {
  private wss: WebSocketServer;
  private eventBus: EventBus;
  private clients: Map<number, Set<WebSocketClient>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  
  constructor(httpServer: HttpServer, eventBus: EventBus) {
    this.eventBus = eventBus;
    
    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/ws/notifications'
    });
    
    // Set up event listeners
    this.setupWebSocketEvents();
    this.setupEventBusSubscriptions();
    
    // Start ping interval to keep connections alive
    this.startPingInterval();
    
    logger.info('[NotificationWS] Notification WebSocket service initialized');
  }
  
  /**
   * Set up WebSocket server event handlers
   */
  private setupWebSocketEvents(): void {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      // Parse the URL to get the user ID
      const params = new URLSearchParams(req.url?.split('?')[1] || '');
      const userId = parseInt(params.get('userId') || '0', 10);
      
      if (!userId) {
        logger.warn('[NotificationWS] Connection attempt without valid userId');
        ws.close(1008, 'Missing user ID');
        return;
      }
      
      // Verify the user exists
      storage.getUser(userId)
        .then(user => {
          if (!user) {
            logger.warn(`[NotificationWS] Connection attempt with invalid userId: ${userId}`);
            ws.close(1008, 'Invalid user ID');
            return;
          }
          
          // Set up client properties
          ws.userId = userId;
          ws.isAlive = true;
          
          // Add to clients map
          if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
          }
          this.clients.get(userId)!.add(ws);
          
          logger.info(`[NotificationWS] User ${userId} connected. Active connections: ${this.clients.get(userId)!.size}`);
          
          // Send connection confirmation
          this.sendToClient(ws, {
            type: 'connection_confirmed',
            message: 'Connected to notification service'
          });
          
          // Send current unread count
          this.sendUnreadCount(userId);
          
          // Handle pong messages to keep track of connection status
          ws.on('pong', () => {
            ws.isAlive = true;
          });
          
          // Handle close event
          ws.on('close', () => {
            if (ws.userId && this.clients.has(ws.userId)) {
              const userClients = this.clients.get(ws.userId)!;
              userClients.delete(ws);
              
              if (userClients.size === 0) {
                this.clients.delete(ws.userId);
              }
              
              logger.info(`[NotificationWS] User ${ws.userId} disconnected. Remaining connections: ${userClients.size}`);
            }
          });
          
          // Handle messages from client
          ws.on('message', (message: string) => {
            try {
              const data = JSON.parse(message);
              logger.debug(`[NotificationWS] Received message from user ${userId}:`, data);
              
              // Handle client message types
              if (data.type === 'ping') {
                this.sendToClient(ws, { type: 'pong' });
              }
            } catch (error) {
              logger.error(`[NotificationWS] Error processing message from user ${userId}:`, error);
            }
          });
          
          // Handle errors
          ws.on('error', (error) => {
            logger.error(`[NotificationWS] WebSocket error for user ${userId}:`, error);
          });
        })
        .catch(error => {
          logger.error(`[NotificationWS] Error verifying user ${userId}:`, error);
          ws.close(1011, 'Server error during connection setup');
        });
    });
  }
  
  /**
   * Set up EventBus subscriptions
   */
  private setupEventBusSubscriptions(): void {
    // Subscribe to notification events
    this.eventBus.subscribe('notification.new', (data) => {
      logger.debug('[NotificationWS] Received notification.new event:', data);
      
      if (data.userId && this.clients.has(data.userId)) {
        // Send to specific user
        this.sendToUser(data.userId, {
          type: 'new_notification',
          data: data.notification
        });
        
        // Update unread count
        this.sendUnreadCount(data.userId);
      }
    });
    
    this.eventBus.subscribe('notification.read', (data) => {
      logger.debug('[NotificationWS] Received notification.read event:', data);
      
      if (data.userId && this.clients.has(data.userId)) {
        // Send to specific user
        this.sendToUser(data.userId, {
          type: 'notification_read',
          data: data.notificationId
        });
        
        // Update unread count
        this.sendUnreadCount(data.userId);
      }
    });
    
    this.eventBus.subscribe('notification.all_read', (data) => {
      logger.debug('[NotificationWS] Received notification.all_read event:', data);
      
      if (data.userId && this.clients.has(data.userId)) {
        // Send to specific user
        this.sendToUser(data.userId, {
          type: 'all_read'
        });
        
        // Update unread count (should be 0)
        this.sendUnreadCount(data.userId);
      }
    });
    
    this.eventBus.subscribe('notification.deleted', (data) => {
      logger.debug('[NotificationWS] Received notification.deleted event:', data);
      
      if (data.userId && this.clients.has(data.userId)) {
        // Send to specific user
        this.sendToUser(data.userId, {
          type: 'notification_deleted',
          data: data.notificationId
        });
        
        // Update unread count
        this.sendUnreadCount(data.userId);
      }
    });
  }
  
  /**
   * Send a message to all clients of a specific user
   */
  private sendToUser(userId: number, message: NotificationMessage): void {
    if (!this.clients.has(userId)) {
      return;
    }
    
    const userClients = this.clients.get(userId)!;
    logger.debug(`[NotificationWS] Sending message to user ${userId} (${userClients.size} connections)`);
    
    for (const client of userClients) {
      this.sendToClient(client, message);
    }
  }
  
  /**
   * Send a message to a specific client
   */
  private sendToClient(client: WebSocketClient, message: NotificationMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        logger.error(`[NotificationWS] Error sending message to client:`, error);
      }
    }
  }
  
  /**
   * Send the current unread notification count to a user
   */
  private async sendUnreadCount(userId: number): Promise<void> {
    try {
      const count = await storage.getUnreadNotificationCount(userId);
      
      this.sendToUser(userId, {
        type: 'unread_count',
        data: count
      });
    } catch (error) {
      logger.error(`[NotificationWS] Error getting unread count for user ${userId}:`, error);
    }
  }
  
  /**
   * Start the ping interval to keep connections alive
   */
  private startPingInterval(): void {
    // Clear any existing interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Create new interval (ping every 30 seconds)
    this.pingInterval = setInterval(() => {
      for (const [userId, userClients] of this.clients.entries()) {
        for (const client of userClients) {
          if (client.isAlive === false) {
            logger.debug(`[NotificationWS] Terminating inactive connection for user ${userId}`);
            client.terminate();
            continue;
          }
          
          client.isAlive = false;
          client.ping();
        }
      }
    }, 30000);
  }
  
  /**
   * Stop the service and clean up resources
   */
  public stop(): void {
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Close all connections
    for (const userClients of this.clients.values()) {
      for (const client of userClients) {
        client.terminate();
      }
    }
    
    // Clear clients map
    this.clients.clear();
    
    // Close WebSocket server
    this.wss.close();
    
    logger.info('[NotificationWS] Notification WebSocket service stopped');
  }
}

// Singleton instance
let notificationWebSocketService: NotificationWebSocketService | null = null;

/**
 * Get the NotificationWebSocketService instance
 */
export function getNotificationWebSocketService(
  httpServer: HttpServer,
  eventBus: EventBus
): NotificationWebSocketService {
  if (!notificationWebSocketService) {
    notificationWebSocketService = new NotificationWebSocketService(httpServer, eventBus);
  }
  
  return notificationWebSocketService;
}