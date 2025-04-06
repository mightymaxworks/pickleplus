/**
 * EventBus
 * 
 * A centralized event bus for cross-module communication.
 * Allows modules to communicate without direct dependencies.
 */

type EventCallback = (data: any) => void;

export class EventBus {
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();
  private debugMode: boolean = false;

  /**
   * Enable or disable debug mode
   * @param enabled Whether debug mode should be enabled
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to an event
   * @param eventName Name of the event to subscribe to
   * @param callback Function to call when the event is published
   * @returns Unsubscribe function
   */
  subscribe(eventName: string, callback: EventCallback): () => void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }

    const handlers = this.eventHandlers.get(eventName)!;
    handlers.add(callback);

    if (this.debugMode) {
      console.log(`[EventBus] New subscriber for ${eventName}. Total: ${handlers.size}`);
    }

    // Return unsubscribe function
    return () => {
      if (this.eventHandlers.has(eventName)) {
        const handlers = this.eventHandlers.get(eventName)!;
        handlers.delete(callback);
        
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventName);
        }
        
        if (this.debugMode) {
          console.log(`[EventBus] Unsubscribed from ${eventName}. Remaining: ${handlers.size}`);
        }
      }
    };
  }

  /**
   * Publish an event
   * @param eventName Name of the event to publish
   * @param data Data to pass to subscribers
   */
  publish(eventName: string, data: any): void {
    if (this.debugMode) {
      console.log(`[EventBus] Publishing event ${eventName}`, data);
    }

    if (!this.eventHandlers.has(eventName)) {
      if (this.debugMode) {
        console.log(`[EventBus] No subscribers for ${eventName}`);
      }
      return;
    }

    const handlers = this.eventHandlers.get(eventName)!;
    
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in event handler for ${eventName}:`, error);
      }
    }

    if (this.debugMode) {
      console.log(`[EventBus] Event ${eventName} published to ${handlers.size} subscribers`);
    }
  }

  /**
   * Get the number of subscribers for an event
   * @param eventName Name of the event
   * @returns Number of subscribers
   */
  getSubscriberCount(eventName: string): number {
    if (!this.eventHandlers.has(eventName)) {
      return 0;
    }
    return this.eventHandlers.get(eventName)!.size;
  }

  /**
   * Clear all event subscribers
   * Useful for testing or resetting the application state
   */
  clear(): void {
    this.eventHandlers.clear();
    if (this.debugMode) {
      console.log('[EventBus] All event subscribers cleared');
    }
  }

  /**
   * Get a list of all active event names with subscribers
   * @returns Array of event names
   */
  getActiveEvents(): string[] {
    return Array.from(this.eventHandlers.keys());
  }
}