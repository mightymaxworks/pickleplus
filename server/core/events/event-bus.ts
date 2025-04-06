/**
 * Event Bus for Pickle+ 
 * This provides a centralized event system for modules to communicate with each other.
 */

export type EventHandler = (data: any) => void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to an event
   * @param eventName The name of the event to subscribe to
   * @param handler The handler function to call when the event is emitted
   * @returns An unsubscribe function
   */
  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    const handlers = this.handlers.get(eventName)!;
    handlers.push(handler);

    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event
   * @param eventName The name of the event to emit
   * @param data The data to pass to handlers
   */
  emit(eventName: string, data: any): void {
    if (!this.handlers.has(eventName)) {
      return;
    }

    const handlers = this.handlers.get(eventName)!;
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    }
  }

  /**
   * Check if an event has subscribers
   * @param eventName The name of the event to check
   * @returns True if the event has subscribers, false otherwise
   */
  hasSubscribers(eventName: string): boolean {
    return this.handlers.has(eventName) && this.handlers.get(eventName)!.length > 0;
  }

  /**
   * Get the number of subscribers for an event
   * @param eventName The name of the event to check
   * @returns The number of subscribers
   */
  getSubscriberCount(eventName: string): number {
    if (!this.handlers.has(eventName)) {
      return 0;
    }
    return this.handlers.get(eventName)!.length;
  }

  /**
   * Clear all handlers for a specific event
   * @param eventName The name of the event to clear
   */
  clearEvent(eventName: string): void {
    this.handlers.delete(eventName);
  }

  /**
   * Clear all event handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}