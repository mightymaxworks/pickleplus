/**
 * PKL-278651-COMM-0022-FEED
 * WebSocket Module Index
 * 
 * This module initializes and manages the WebSocket server for real-time updates.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Server as HttpServer } from 'http';
import WebSocketManager from './ws-server';

// Singleton instance of the WebSocket manager
let wsManagerInstance: WebSocketManager | null = null;

/**
 * Initialize the WebSocket server
 * @param server The HTTP server instance
 * @returns The WebSocket manager instance
 */
export function initializeWebSocketServer(server: HttpServer): WebSocketManager {
  if (wsManagerInstance) {
    console.log('[WebSocket] Manager already initialized, returning existing instance');
    return wsManagerInstance;
  }
  
  wsManagerInstance = new WebSocketManager(server);
  return wsManagerInstance;
}

/**
 * Get the WebSocket manager instance
 * @returns The WebSocket manager instance or null if not initialized
 */
export function getWebSocketManager(): WebSocketManager | null {
  return wsManagerInstance;
}

/**
 * Shutdown the WebSocket server
 */
export function shutdownWebSocketServer(): void {
  if (wsManagerInstance) {
    wsManagerInstance.shutdown();
    wsManagerInstance = null;
    console.log('[WebSocket] Manager shutdown complete');
  }
}

// Add shutdown hook
process.on('SIGINT', () => {
  shutdownWebSocketServer();
});

process.on('SIGTERM', () => {
  shutdownWebSocketServer();
});