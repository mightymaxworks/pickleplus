/**
 * PKL-278651-CORE-0002-EVENT - Event Bus Service
 * Implementation timestamp: 2025-04-20 10:55 ET
 * 
 * Simple pub/sub event bus for application-wide events
 * 
 * Framework 5.2 compliant implementation
 */

import { logger } from '../../utils/logger';

type EventListener = (data: any) => void;

export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  
  /**
   * Subscribe to an event
   * @param event Event name
   * @param listener Callback function
   * @returns Unsubscribe function
   */
  public subscribe(event: string, listener: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const eventListeners = this.listeners.get(event)!;
    eventListeners.push(listener);
    
    logger.debug(`[EventBus] Subscribed to event: ${event}, Total listeners: ${eventListeners.length}`);
    
    // Return unsubscribe function
    return () => {
      const idx = eventListeners.indexOf(listener);
      if (idx !== -1) {
        eventListeners.splice(idx, 1);
        logger.debug(`[EventBus] Unsubscribed from event: ${event}, Remaining listeners: ${eventListeners.length}`);
      }
    };
  }
  
  /**
   * Emit an event with data
   * @param event Event name
   * @param data Event data
   */
  public emit(event: string, data: any): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const eventListeners = this.listeners.get(event)!;
    logger.debug(`[EventBus] Emitting event: ${event} to ${eventListeners.length} listeners`);
    
    for (const listener of eventListeners) {
      try {
        listener(data);
      } catch (error) {
        logger.error(`[EventBus] Error in event listener for ${event}:`, error);
      }
    }
  }
  
  /**
   * Check if an event has listeners
   * @param event Event name
   * @returns Boolean indicating if the event has listeners
   */
  public hasListeners(event: string): boolean {
    return this.listeners.has(event) && this.listeners.get(event)!.length > 0;
  }
  
  /**
   * Get the number of listeners for an event
   * @param event Event name
   * @returns Number of listeners
   */
  public getListenerCount(event: string): number {
    if (!this.listeners.has(event)) {
      return 0;
    }
    
    return this.listeners.get(event)!.length;
  }
  
  /**
   * Clear all listeners for a specific event
   * @param event Event name
   */
  public clearEvent(event: string): void {
    this.listeners.delete(event);
    logger.debug(`[EventBus] Cleared all listeners for event: ${event}`);
  }
  
  /**
   * Clear all listeners for all events
   */
  public clearAll(): void {
    this.listeners.clear();
    logger.debug('[EventBus] Cleared all event listeners');
  }
}

// Singleton instance
let eventBus: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBus) {
    eventBus = new EventBus();
    logger.info('[EventBus] EventBus instance created');
  }
  
  return eventBus;
}