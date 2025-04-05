/**
 * EventBus - A simple event system for cross-module communication
 * This allows modules to communicate without direct dependencies
 */

type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   * @param event The event name to subscribe to
   * @param callback The callback function to execute when the event occurs
   * @returns A function to unsubscribe from the event
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (!callbacks) return;
      
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event
   * @param event The event name to publish
   * @param data The data to pass to event subscribers
   */
  publish(event: string, data: any): void {
    if (!this.events.has(event)) return;
    
    this.events.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event subscriber for "${event}":`, error);
      }
    });
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Export common event names as constants
export const Events = {
  // User module events
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  USER_PROFILE_UPDATED: 'user:profile_updated',
  
  // Match module events
  MATCH_RECORDED: 'match:recorded',
  
  // Achievement module events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  XP_EARNED: 'xp:earned',
  
  // Tournament module events
  TOURNAMENT_REGISTERED: 'tournament:registered',
  TOURNAMENT_CHECKED_IN: 'tournament:checked_in',
  
  // Social module events
  CONNECTION_CREATED: 'connection:created',
  CONNECTION_UPDATED: 'connection:updated',
  
  // Coaching module events
  COACHING_SESSION_BOOKED: 'coaching:session_booked',
};