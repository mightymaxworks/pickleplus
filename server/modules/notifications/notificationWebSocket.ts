/**
 * PKL-278651-NOTIF-0001-WS - WebSocket Notifications System
 * 
 * Real-time notification system for Pickle+ Progressive Passport Hub
 * Supports match requests, ranking updates, challenges, and system notifications
 * 
 * @implementation Framework5.2
 * @lastModified 2025-09-27
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { Request } from 'express';
import { parse } from 'url';

// Notification message types
export interface NotificationMessage {
  type: 'match_request' | 'match_result' | 'ranking_update' | 'challenge' | 'system' | 'presence_update' | 'connection_confirmed';
  data: any;
  userId?: string;
  timestamp: string;
}

// Client connection interface
interface ClientConnection {
  ws: WebSocket;
  userId: string | null;
  subscriptions: string[];
  isAlive: boolean;
  lastSeen: Date;
}

// Track all active client connections
const clients = new Map<string, ClientConnection>();

// Interval for ping-pong connection checks (in ms)
const HEARTBEAT_INTERVAL = 30000;

/**
 * Create and setup WebSocket server for notifications
 * @param httpServer - The HTTP server instance to attach the WebSocket server to
 */
export function setupNotificationWebSocket(httpServer: Server) {
  // Create WebSocket server on /ws/notifications path
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/notifications',
    verifyClient: (info, cb) => {
      try {
        // Allow connection, authentication will be done on message
        return cb(true);
      } catch (error) {
        console.error('[WebSocket] Verification error:', error);
        return cb(false);
      }
    }
  });

  // Set up periodic ping to keep connections alive
  const heartbeatInterval = setInterval(() => {
    clients.forEach((client, id) => {
      if (!client.isAlive) {
        client.ws.terminate();
        clients.delete(id);
        console.log(`[WebSocket] Removed inactive client: ${id}`);
        return;
      }
      
      client.isAlive = false;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    });
  }, HEARTBEAT_INTERVAL);

  // Clean up on server close
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  // Handle new connections
  wss.on('connection', async (ws, req) => {
    // Generate unique client ID
    const clientId = Math.random().toString(36).substring(2, 15);
    
    // Extract user ID from query params (sent by client)
    const url = parse(req.url || '', true);
    const userId = url.query.userId as string;
    
    console.log(`[WebSocket] New connection: ${clientId}, userId: ${userId || 'anonymous'}`);
    
    // Initialize client in tracking map
    clients.set(clientId, {
      ws,
      userId: userId || null,
      subscriptions: [],
      isAlive: true,
      lastSeen: new Date()
    });
    
    // Handle pong responses to keep track of connection status
    ws.on('pong', () => {
      const client = clients.get(clientId);
      if (client) {
        client.isAlive = true;
        client.lastSeen = new Date();
      }
    });
    
    // Handle client messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const client = clients.get(clientId);
        
        if (!client) return;
        
        switch (data.type) {
          case 'subscribe':
            // Add subscription channels
            const channels = Array.isArray(data.channels) ? data.channels : [data.channels];
            channels.forEach((channel: string) => {
              if (!client.subscriptions.includes(channel)) {
                client.subscriptions.push(channel);
              }
            });
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              channels: client.subscriptions,
              timestamp: new Date().toISOString()
            }));
            console.log(`[WebSocket] Client ${clientId} subscribed to:`, channels);
            break;
            
          case 'unsubscribe':
            // Remove subscription channels
            const removeChannels = Array.isArray(data.channels) ? data.channels : [data.channels];
            removeChannels.forEach((channel: string) => {
              const index = client.subscriptions.indexOf(channel);
              if (index > -1) {
                client.subscriptions.splice(index, 1);
              }
            });
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'unsubscription_confirmed',
              channels: client.subscriptions,
              timestamp: new Date().toISOString()
            }));
            break;
            
          case 'ping':
            // Simple ping-pong for client-initiated heartbeat
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;
            
          default:
            console.warn('[WebSocket] Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('[WebSocket] Error processing message:', error);
        // Send error notification to client
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_confirmed',
      clientId,
      authenticated: !!userId,
      timestamp: new Date().toISOString()
    }));
  });
  
  // Return notification broadcasting functions
  return {
    /**
     * Send notification to specific user
     */
    sendToUser: (userId: string, notification: Omit<NotificationMessage, 'timestamp'>) => {
      const message = {
        ...notification,
        timestamp: new Date().toISOString()
      };
      
      clients.forEach(client => {
        if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      });
      
      console.log(`[WebSocket] Sent notification to user ${userId}:`, notification.type);
    },
    
    /**
     * Broadcast notification to all users subscribed to a channel
     */
    broadcastToChannel: (channel: string, notification: Omit<NotificationMessage, 'timestamp'>) => {
      const message = {
        ...notification,
        timestamp: new Date().toISOString()
      };
      
      let sentCount = 0;
      clients.forEach(client => {
        if (client.subscriptions.includes(channel) && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
          sentCount++;
        }
      });
      
      console.log(`[WebSocket] Broadcast to channel ${channel}: ${sentCount} recipients`);
    },
    
    /**
     * Broadcast to all connected clients
     */
    broadcastToAll: (notification: Omit<NotificationMessage, 'timestamp'>) => {
      const message = {
        ...notification,
        timestamp: new Date().toISOString()
      };
      
      let sentCount = 0;
      clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
          sentCount++;
        }
      });
      
      console.log(`[WebSocket] Broadcast to all: ${sentCount} recipients`);
    },
    
    /**
     * Get connected user count
     */
    getConnectedUserCount: () => {
      return Array.from(clients.values()).filter(client => client.userId).length;
    },
    
    /**
     * Get online status for user
     */
    isUserOnline: (userId: string) => {
      return Array.from(clients.values()).some(client => client.userId === userId);
    }
  };
}