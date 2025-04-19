/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Server Implementation
 * 
 * This module sets up and manages the WebSocket server for real-time updates.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ServerEventBus } from '../../core/events';

// Client connection interface
interface Client {
  id: string;
  userId?: number;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: string[];
}

// Message types
type MessageType = 'subscribe' | 'unsubscribe' | 'ping' | 'auth';

interface Message {
  type: MessageType;
  topics?: string[];
  token?: string;
  userId?: number;
  payload?: any;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(server: HttpServer) {
    // Initialize WebSocket server on a dedicated path to avoid conflict with Vite's HMR
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws' 
    });

    console.log('[WebSocket] Server initialized on path /ws');
    
    this.setupEventHandlers();
    this.startPingInterval();
    this.subscribeToServerEvents();
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      
      // Initialize client
      const client: Client = {
        id: clientId,
        ws,
        isAlive: true,
        subscriptions: []
      };
      
      this.clients.set(clientId, client);
      console.log(`[WebSocket] Client connected: ${clientId}, total connections: ${this.clients.size}`);

      // Send welcome message
      this.sendToClient(client, {
        type: 'connection',
        status: 'connected',
        clientId,
        message: 'Connected to Pickle+ WebSocket server'
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as Message;
          this.handleClientMessage(client, message);
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
          this.sendToClient(client, {
            type: 'error',
            message: 'Invalid message format'
          });
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}, remaining connections: ${this.clients.size}`);
      });

      // Handle pong (keepalive)
      ws.on('pong', () => {
        client.isAlive = true;
      });
    });
  }

  private handleClientMessage(client: Client, message: Message): void {
    switch (message.type) {
      case 'subscribe':
        if (message.topics && Array.isArray(message.topics)) {
          // Add topics to client subscriptions without using Set
          const uniqueTopics = [...client.subscriptions];
          message.topics.forEach(topic => {
            if (!uniqueTopics.includes(topic)) {
              uniqueTopics.push(topic);
            }
          });
          client.subscriptions = uniqueTopics;
          this.sendToClient(client, {
            type: 'subscribed',
            topics: message.topics
          });
          console.log(`[WebSocket] Client ${client.id} subscribed to topics: ${message.topics.join(', ')}`);
        }
        break;
        
      case 'unsubscribe':
        if (message.topics && Array.isArray(message.topics)) {
          // Remove topics from client subscriptions
          client.subscriptions = client.subscriptions.filter(topic => !message.topics?.includes(topic));
          this.sendToClient(client, {
            type: 'unsubscribed',
            topics: message.topics
          });
          console.log(`[WebSocket] Client ${client.id} unsubscribed from topics: ${message.topics.join(', ')}`);
        }
        break;
        
      case 'ping':
        // Respond with pong
        this.sendToClient(client, { type: 'pong' });
        break;
        
      case 'auth':
        if (message.userId) {
          client.userId = message.userId;
          console.log(`[WebSocket] Client ${client.id} authenticated for user ${message.userId}`);
          this.sendToClient(client, {
            type: 'auth',
            status: 'success',
            userId: message.userId
          });
        }
        break;
        
      default:
        console.warn(`[WebSocket] Unknown message type: ${message.type}`);
        this.sendToClient(client, {
          type: 'error',
          message: `Unknown message type: ${message.type}`
        });
    }
  }

  private startPingInterval(): void {
    // Check client connections every 30 seconds
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(id);
          console.log(`[WebSocket] Terminated inactive client: ${id}`);
          return;
        }
        
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000);
  }

  private sendToClient(client: Client, data: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  private broadcastToTopic(topic: string, data: any): void {
    this.clients.forEach(client => {
      if (client.subscriptions.includes(topic) && client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(client, {
          type: 'message',
          topic,
          data
        });
      }
    });
  }

  private subscribeToServerEvents(): void {
    // Subscribe to community activity events
    ServerEventBus.subscribe('community:activity:created', (data) => {
      this.broadcastToTopic('community:activity', data);
      
      // Also broadcast to community-specific topic
      if (data.communityId) {
        this.broadcastToTopic(`community:${data.communityId}:activity`, data);
      }
    });
    
    // Subscribe to other events as needed
    const relevantEvents = [
      'community:post:created',
      'community:comment:added',
      'community:event:created',
      'community:member:joined'
    ];
    
    relevantEvents.forEach(event => {
      ServerEventBus.subscribe(event, (data) => {
        // Convert event to topic format
        const topic = event.replace(/:/g, '.');
        this.broadcastToTopic(topic, data);
        
        // Also broadcast to community-specific topic if applicable
        if (data.communityId) {
          this.broadcastToTopic(`community.${data.communityId}.${topic}`, data);
        }
      });
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.clients.forEach(client => {
      client.ws.terminate();
    });
    
    this.clients.clear();
    console.log('[WebSocket] Server shut down');
  }
}

// Export the WebSocketManager class
export default WebSocketManager;