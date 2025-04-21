/**
 * PKL-278651-BOUNCE-0005-AUTO - Server Event Bus
 * 
 * This file provides a simple event bus for server-side component communication
 * without requiring external dependencies.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

// Singleton instance
let instance: EventBus | null = null;

// Type for event handler
type EventHandler = (data: any) => void;

/**
 * Event bus implementation
 * Provides a simple pub/sub mechanism for components to communicate
 */
export class EventBus {
  private events: Map<string, EventHandler[]> = new Map();
  
  /**
   * Create a new instance of the event bus
   */
  constructor() {
    if (instance) {
      return instance;
    }
    
    instance = this;
  }
  
  /**
   * Subscribe to an event
   * 
   * @param event Event name to subscribe to
   * @param handler Handler function to call when the event is published
   * @returns Unsubscribe function
   */
  public subscribe(event: string, handler: EventHandler): () => void {
    // Get or create the event handlers array
    const handlers = this.events.get(event) || [];
    
    // Add the handler
    handlers.push(handler);
    
    // Update the event handlers
    this.events.set(event, handlers);
    
    // Return an unsubscribe function
    return () => this.unsubscribe(event, handler);
  }
  
  /**
   * Unsubscribe from an event
   * 
   * @param event Event name to unsubscribe from
   * @param handler Handler function to remove
   * @returns Whether the handler was removed
   */
  public unsubscribe(event: string, handler: EventHandler): boolean {
    // Get the event handlers
    const handlers = this.events.get(event);
    
    // If no handlers exist, return false
    if (!handlers) {
      return false;
    }
    
    // Find the handler index
    const index = handlers.indexOf(handler);
    
    // If the handler isn't found, return false
    if (index === -1) {
      return false;
    }
    
    // Remove the handler
    handlers.splice(index, 1);
    
    // If no handlers remain, remove the event
    if (handlers.length === 0) {
      this.events.delete(event);
    } else {
      // Otherwise, update the event handlers
      this.events.set(event, handlers);
    }
    
    return true;
  }
  
  /**
   * Publish an event
   * 
   * @param event Event name to publish
   * @param data Data to pass to handlers
   * @returns Whether the event was published
   */
  public publish(event: string, data: any = {}): boolean {
    // Get the event handlers
    const handlers = this.events.get(event);
    
    // If no handlers exist, return false
    if (!handlers || handlers.length === 0) {
      return false;
    }
    
    // Add event name to data for context
    const eventData = {
      ...data,
      _event: event,
      _timestamp: new Date()
    };
    
    // Call all handlers asynchronously
    setTimeout(() => {
      for (const handler of handlers) {
        try {
          handler(eventData);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }, 0);
    
    return true;
  }
  
  /**
   * Get the singleton instance of the event bus
   * 
   * @returns The singleton instance
   */
  public static getInstance(): EventBus {
    if (!instance) {
      instance = new EventBus();
    }
    
    return instance;
  }
  
  /**
   * Get the number of subscribers for an event
   * 
   * @param event Event name to check
   * @returns Number of subscribers
   */
  public getSubscriberCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.length : 0;
  }
  
  /**
   * Get all events with subscribers
   * 
   * @returns Array of event names
   */
  public getEvents(): string[] {
    return Array.from(this.events.keys());
  }
}

// Export a function to get the singleton instance
export function getEventBus(): EventBus {
  return EventBus.getInstance();
}

// Export the EventBus as ServerEventBus for backwards compatibility
export const ServerEventBus = EventBus;

export default EventBus;