/**
 * PKL-278651-BOUNCE-0005-AUTO - Server Event Bus
 * 
 * This file provides a simple event bus for server-side component communication.
 * It allows loose coupling between components that need to communicate with each other.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

type EventCallback = (data: any) => void | Promise<void>;

/**
 * In-memory event bus for server-side communication
 */
export class ServerEventBus {
  private static eventHandlers: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param eventName Event name to subscribe to
   * @param callback Callback to execute when the event is published
   * @returns Function to unsubscribe from the event
   */
  public static subscribe(eventName: string, callback: EventCallback): () => void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    
    this.eventHandlers.get(eventName)!.add(callback);
    
    // Return an unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventName);
      if (handlers) {
        handlers.delete(callback);
        
        // Clean up the event name if there are no more handlers
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventName);
        }
      }
    };
  }

  /**
   * Publish an event
   * @param eventName Event name to publish
   * @param data Data to pass to the event handlers
   * @returns Promise that resolves when all handlers have completed
   */
  public static async publish(eventName: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(eventName);
    if (!handlers) {
      // No handlers for this event
      return;
    }
    
    // Execute all handlers in parallel
    const promises: Promise<void>[] = [];
    
    handlers.forEach(callback => {
      try {
        const result = callback(data);
        
        // If the callback returns a promise, add it to the list
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`[ServerEventBus] Error executing handler for event ${eventName}:`, error);
      }
    });
    
    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  /**
   * Check if an event has any subscribers
   * @param eventName Event name to check
   * @returns Whether the event has any subscribers
   */
  public static hasSubscribers(eventName: string): boolean {
    const handlers = this.eventHandlers.get(eventName);
    return Boolean(handlers && handlers.size > 0);
  }

  /**
   * Get the number of subscribers for an event
   * @param eventName Event name to check
   * @returns Number of subscribers
   */
  public static getSubscriberCount(eventName: string): number {
    const handlers = this.eventHandlers.get(eventName);
    return handlers ? handlers.size : 0;
  }

  /**
   * Remove all subscribers for an event
   * @param eventName Event name to clear
   */
  public static clearEvent(eventName: string): void {
    this.eventHandlers.delete(eventName);
  }

  /**
   * Remove all subscribers for all events
   */
  public static clearAllEvents(): void {
    this.eventHandlers.clear();
  }
}