/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Notification WebSocket Routes
 * Implementation timestamp: 2025-04-20 10:50 ET
 * 
 * Set up WebSocket server for real-time notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { getEventBus } from '../core/events/event-bus';
import { getNotificationWebSocketService } from '../modules/notifications/notificationWebSocketService';
import { getNotificationService } from '../modules/notifications/notificationService';
import { logger } from '../utils/logger';

export function setupNotificationWebSocketRoutes(httpServer: HttpServer) {
  try {
    // Get the event bus instance
    const eventBus = getEventBus();
    
    // Initialize notification services
    const notificationService = getNotificationService(eventBus);
    const notificationWebSocketService = getNotificationWebSocketService(httpServer, eventBus);
    
    // Log successful initialization
    logger.info('[Notification] WebSocket notification service initialized successfully');
    
    // Return the WebSocket service for potential cleanup
    return notificationWebSocketService;
  } catch (error) {
    logger.error('[Notification] Error setting up notification WebSocket service:', error);
    throw error;
  }
}