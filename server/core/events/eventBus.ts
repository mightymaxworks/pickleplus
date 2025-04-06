/**
 * Server Event Bus System
 * 
 * This provides a pub/sub event system for server-side module communication.
 * It allows for loose coupling between modules and enables event-driven architecture.
 */

// Type for event handler functions
type EventHandler = (data: any) => Promise<void> | void;

// Define standard server events
export enum ServerEvents {
  USER_CREATED = "user:created",
  USER_UPDATED = "user:updated",
  USER_DELETED = "user:deleted",
  
  MATCH_RECORDED = "match:recorded",
  MATCH_UPDATED = "match:updated",
  
  TOURNAMENT_CREATED = "tournament:created",
  TOURNAMENT_STARTED = "tournament:started",
  TOURNAMENT_COMPLETED = "tournament:completed",
  
  ACHIEVEMENT_UNLOCKED = "achievement:unlocked",
  
  REDEMPTION_CODE_USED = "redemption_code:used",
  
  PLAYER_CONNECTED = "player:connected",
  
  SYSTEM_INITIALIZED = "system:initialized"
}

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to an event
   * @param event The event name or type
   * @param handler The handler function
   */
  subscribe(event: string | ServerEvents, handler: EventHandler): void {
    const eventName = typeof event === 'string' ? event : event.toString();
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Unsubscribe from an event
   * @param event The event name or type
   * @param handler The handler function to remove
   */
  unsubscribe(event: string | ServerEvents, handler: EventHandler): void {
    const eventName = typeof event === 'string' ? event : event.toString();
    
    if (!this.handlers.has(eventName)) {
      return;
    }
    
    const handlers = this.handlers.get(eventName)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Publish an event
   * @param event The event name or type
   * @param data The event data
   */
  async publish(event: string | ServerEvents, data: any = {}): Promise<void> {
    const eventName = typeof event === 'string' ? event : event.toString();
    
    if (!this.handlers.has(eventName)) {
      return;
    }
    
    const handlers = this.handlers.get(eventName)!;
    
    // Execute all handlers in parallel
    await Promise.all(handlers.map(handler => {
      try {
        return Promise.resolve(handler(data));
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
        return Promise.resolve();
      }
    }));
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get all event types currently registered
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Create and export a singleton instance
export const serverEventBus = new EventBus();