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

let wsManager: WebSocketManager | null = null;

/**
 * Initialize the WebSocket server
 * @param server The HTTP server instance
 * @returns The WebSocket manager instance
 */
export function initializeWebSocketServer(server: HttpServer): WebSocketManager {
  if (wsManager) {
    console.log('[WebSocket] WebSocket server already initialized');
    return wsManager;
  }
  
  console.log('[WebSocket] Initializing WebSocket server');
  wsManager = new WebSocketManager(server);
  return wsManager;
}

/**
 * Get the WebSocket manager instance
 * @returns The WebSocket manager instance or null if not initialized
 */
export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}

/**
 * Shutdown the WebSocket server
 */
export function shutdownWebSocketServer(): void {
  if (wsManager) {
    wsManager.shutdown();
    wsManager = null;
    console.log('[WebSocket] WebSocket server shut down');
  }
}

export default {
  initializeWebSocketServer,
  getWebSocketManager,
  shutdownWebSocketServer
};