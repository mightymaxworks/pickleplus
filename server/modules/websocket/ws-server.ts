/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Server
 * 
 * This module implements the WebSocket server for real-time communication.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { ServerEvents, eventEmitter } from '../../core/events/server-event-bus';
import { parse } from 'cookie';

interface WebSocketClient {
  id: string;
  socket: WebSocket;
  topics: Set<string>;
  userId?: number;
  isAuthenticated: boolean;
}

/**
 * WebSocket server for real-time communication
 */
export class PickleSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private topicSubscriptions: Map<string, Set<string>> = new Map();
  private userConnections: Map<number, Set<string>> = new Map();
  
  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      clientTracking: true
    });
    
    this.initialize();
  }
  
  /**
   * Initialize the WebSocket server
   */
  private initialize(): void {
    // Set up connection handling
    this.wss.on('connection', (socket, request) => {
      this.handleConnection(socket, request);
    });
    
    // Subscribe to all events from the event bus
    eventEmitter.on('*' as ServerEvents, (topic, data) => {
      this.publishToSubscribers(topic, data);
    });
    
    // Set up periodic ping to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 30000);
    
    console.log('[WS] WebSocket server initialized');
  }
  
  /**
   * Handle new WebSocket connections
   */
  private handleConnection(socket: WebSocket, request: any): void {
    // Generate a unique client ID
    const clientId = randomUUID();
    
    // Create a client object
    const client: WebSocketClient = {
      id: clientId,
      socket,
      topics: new Set(),
      isAuthenticated: false
    };
    
    // Extract authentication info from cookies if available
    this.authenticateClient(client, request);
    
    // Add to client list
    this.clients.set(clientId, client);
    
    // Send connection confirmation
    socket.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      clientId,
      isAuthenticated: client.isAuthenticated
    }));
    
    console.log(`[WS] Client connected: ${clientId}`);
    
    // Set up message handling
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMessage(client, data);
      } catch (error) {
        console.error('[WS] Error parsing message:', error);
        
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Set up disconnect handling
    socket.on('close', () => {
      this.handleDisconnect(client);
      console.log(`[WS] Client disconnected: ${clientId}`);
    });
    
    socket.on('error', (error) => {
      console.error(`[WS] Socket error for client ${clientId}:`, error);
    });
  }
  
  /**
   * Try to authenticate the client using session cookies
   */
  private authenticateClient(client: WebSocketClient, request: any): void {
    try {
      // Extract session ID from cookies
      const cookieHeader = request.headers.cookie;
      if (cookieHeader) {
        const cookies = parse(cookieHeader);
        
        // If we have a session cookie, associate the user ID with this connection
        if (cookies['connect.sid']) {
          // This is a simplified approach - in a real implementation you would
          // verify the session with the Express session store
          // For now, we'll just mark the client as authenticated
          client.isAuthenticated = true;
          
          // In a real implementation, we would get the user ID from the session
          // For demonstration purposes, let's use a dummy user ID
          client.userId = 1; // Placeholder user ID
          
          // Add to user connections map
          if (client.userId) {
            if (!this.userConnections.has(client.userId)) {
              this.userConnections.set(client.userId, new Set());
            }
            this.userConnections.get(client.userId)?.add(client.id);
          }
        }
      }
    } catch (error) {
      console.error('[WS] Error authenticating client:', error);
    }
  }
  
  /**
   * Handle client messages
   */
  private handleMessage(client: WebSocketClient, data: any): void {
    // Handle subscribe/unsubscribe requests
    if (data.type === 'subscribe' && Array.isArray(data.topics)) {
      this.handleSubscribe(client, data.topics);
    } else if (data.type === 'unsubscribe' && Array.isArray(data.topics)) {
      this.handleUnsubscribe(client, data.topics);
    }
  }
  
  /**
   * Handle client subscription requests
   */
  private handleSubscribe(client: WebSocketClient, topics: string[]): void {
    for (const topic of topics) {
      // Skip empty topics
      if (!topic) continue;
      
      // Add to client's topics
      client.topics.add(topic);
      
      // Add to topic subscriptions
      if (!this.topicSubscriptions.has(topic)) {
        this.topicSubscriptions.set(topic, new Set());
      }
      this.topicSubscriptions.get(topic)?.add(client.id);
    }
    
    // Confirm subscription
    client.socket.send(JSON.stringify({
      type: 'subscribed',
      topics: Array.from(client.topics)
    }));
  }
  
  /**
   * Handle client unsubscribe requests
   */
  private handleUnsubscribe(client: WebSocketClient, topics: string[]): void {
    for (const topic of topics) {
      // Remove from client's topics
      client.topics.delete(topic);
      
      // Remove from topic subscriptions
      this.topicSubscriptions.get(topic)?.delete(client.id);
      
      // Clean up empty topic sets
      if (this.topicSubscriptions.get(topic)?.size === 0) {
        this.topicSubscriptions.delete(topic);
      }
    }
    
    // Confirm unsubscription
    client.socket.send(JSON.stringify({
      type: 'unsubscribed',
      topics
    }));
  }
  
  /**
   * Handle client disconnections
   */
  private handleDisconnect(client: WebSocketClient): void {
    // Remove from all topic subscriptions
    for (const topic of client.topics) {
      this.topicSubscriptions.get(topic)?.delete(client.id);
      
      // Clean up empty topic sets
      if (this.topicSubscriptions.get(topic)?.size === 0) {
        this.topicSubscriptions.delete(topic);
      }
    }
    
    // Remove from user connections
    if (client.userId) {
      this.userConnections.get(client.userId)?.delete(client.id);
      
      // Clean up empty user connection sets
      if (this.userConnections.get(client.userId)?.size === 0) {
        this.userConnections.delete(client.userId);
      }
    }
    
    // Remove from clients map
    this.clients.delete(client.id);
  }
  
  /**
   * Publish a message to all subscribers of a topic
   */
  private publishToSubscribers(topic: string, data: any): void {
    // Get all clients subscribed to this topic
    const subscribers = this.topicSubscriptions.get(topic);
    
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    
    // Prepare the message
    const message = JSON.stringify({
      topic,
      payload: data,
      timestamp: new Date().toISOString()
    });
    
    // Send to all subscribers
    subscribers.forEach(clientId => {
      const client = this.clients.get(clientId);
      
      if (client && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }
  
  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: number, topic: string, data: any): void {
    const userClients = this.userConnections.get(userId);
    
    if (!userClients || userClients.size === 0) {
      return;
    }
    
    // Prepare the message
    const message = JSON.stringify({
      topic,
      payload: data,
      timestamp: new Date().toISOString()
    });
    
    // Send to all of the user's connected clients
    userClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      
      if (client && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }
  
  /**
   * Shutdown the WebSocket server
   */
  public shutdown(): void {
    // Close all connections
    this.wss.clients.forEach(client => {
      client.terminate();
    });
    
    // Close the server
    this.wss.close();
    
    // Clear all data structures
    this.clients.clear();
    this.topicSubscriptions.clear();
    this.userConnections.clear();
    
    console.log('[WS] WebSocket server shutdown complete');
  }
}

// Export factory function to create the WebSocket server
export function createWebSocketServer(server: HttpServer): PickleSocketServer {
  return new PickleSocketServer(server);
}