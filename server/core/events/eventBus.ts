/**
 * Server-side EventBus
 * 
 * This provides similar functionality to the client-side EventBus
 * but is designed for server-side use.
 */

type EventCallback = (data: any) => void | Promise<void>;

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
  async publish(event: string, data: any): Promise<void> {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event)!;
    
    for (const callback of callbacks) {
      try {
        await Promise.resolve(callback(data));
      } catch (error) {
        console.error(`Error in server event subscriber for "${event}":`, error);
      }
    }
  }
}

// Create a singleton instance
export const serverEventBus = new EventBus();

// Export common event names as constants
export const ServerEvents = {
  // User events
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_LOGGED_IN: 'user:logged_in',
  
  // Match events
  MATCH_RECORDED: 'match:recorded',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  XP_EARNED: 'xp:earned',
  
  // Tournament events
  TOURNAMENT_REGISTERED: 'tournament:registered',
  TOURNAMENT_CHECKED_IN: 'tournament:checked_in',
  
  // Code redemption events
  CODE_REDEEMED: 'code:redeemed',
  
  // Coaching events
  COACHING_SESSION_BOOKED: 'coaching:session_booked',
};