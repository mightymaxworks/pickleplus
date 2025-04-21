/**
 * PKL-278651-BOUNCE-0005-AUTO - Server Event Bus
 * 
 * This file provides a simple event bus for server-side component communication.
 * It allows components to publish events and subscribe to them without direct dependencies.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

// Define event listener type
type EventListener = (data: any) => void;

/**
 * Server-side event bus for component communication
 */
export class ServerEventBus {
  // Map of event names to arrays of listeners
  private static listeners: Map<string, EventListener[]> = new Map();
  
  /**
   * Subscribe to an event
   * @param eventName Event name
   * @param listener Function to call when the event is published
   * @returns Function to unsubscribe
   */
  static subscribe(eventName: string, listener: EventListener): () => void {
    // Get or create the listener array for this event
    const listeners = this.listeners.get(eventName) || [];
    
    // Add the listener
    listeners.push(listener);
    
    // Update the listeners map
    this.listeners.set(eventName, listeners);
    
    // Return a function to unsubscribe
    return () => {
      this.unsubscribe(eventName, listener);
    };
  }
  
  /**
   * Unsubscribe from an event
   * @param eventName Event name
   * @param listener Listener to remove
   */
  static unsubscribe(eventName: string, listener: EventListener): void {
    // Get the listeners for this event
    const listeners = this.listeners.get(eventName);
    
    // If there are no listeners, return
    if (!listeners) {
      return;
    }
    
    // Remove the listener
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    // Update the listeners map
    if (listeners.length === 0) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.set(eventName, listeners);
    }
  }
  
  /**
   * Publish an event
   * @param eventName Event name
   * @param data Data to pass to listeners
   */
  static publish(eventName: string, data: any): void {
    // Get the listeners for this event
    const listeners = this.listeners.get(eventName);
    
    // If there are no listeners, return
    if (!listeners) {
      return;
    }
    
    // Call each listener with the data
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    }
  }
  
  /**
   * Remove all listeners for an event
   * @param eventName Event name
   */
  static clearEvent(eventName: string): void {
    this.listeners.delete(eventName);
  }
  
  /**
   * Remove all listeners for all events
   */
  static clearAllEvents(): void {
    this.listeners.clear();
  }
  
  /**
   * Get the number of listeners for an event
   * @param eventName Event name
   * @returns Number of listeners
   */
  static getListenerCount(eventName: string): number {
    const listeners = this.listeners.get(eventName);
    return listeners ? listeners.length : 0;
  }
}