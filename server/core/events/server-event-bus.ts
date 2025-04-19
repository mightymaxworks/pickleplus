/**
 * PKL-278651-COMM-0022-FEED
 * Server Event Bus
 * 
 * This module provides a simple event bus for server-side events,
 * allowing different modules to communicate with each other.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 * @framework Framework5.1
 */

import { EventEmitter } from 'events';

// Define the allowed event types
export type ServerEvents = 
  | 'activity:created'
  | 'community:joined'
  | 'community:left'
  | 'community:post:created'
  | 'community:post:deleted'
  | 'community:post:liked'
  | 'community:post:unliked'
  | 'community:post:comment:created'
  | 'community:post:comment:deleted'
  | 'community:event:created'
  | 'community:event:updated'
  | 'community:event:deleted'
  | 'community:event:registered'
  | 'community:event:unregistered'
  | `community:${number}:activity`;

// Create a typed event emitter
class ServerEventBus extends EventEmitter {
  emit(event: ServerEvents, ...args: any[]): boolean {
    console.log(`[PKL-278651-COMM-0022-FEED] Event emitted: ${event}`);
    return super.emit(event, ...args);
  }
  
  on(event: ServerEvents, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
  
  once(event: ServerEvents, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
  
  removeListener(event: ServerEvents, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }
}

// Export a singleton instance of the event bus
export const eventEmitter = new ServerEventBus();