/**
 * PKL-278651-COMM-0022-XP
 * Server Event Bus
 * 
 * This module provides a centralized event bus for server-side modules
 * to communicate with each other using a publish/subscribe pattern.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

export type EventHandler = (data: any) => void | Promise<void>;

/**
 * Server event types
 */
export enum ServerEvents {
  // User events
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  
  // Match events
  MATCH_RECORDED = 'match:recorded',
  MATCH_UPDATED = 'match:updated',
  MATCH_DELETED = 'match:deleted',
  
  // Tournament events
  TOURNAMENT_CREATED = 'tournament:created',
  TOURNAMENT_UPDATED = 'tournament:updated',
  TOURNAMENT_COMPLETED = 'tournament:completed',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED = 'achievement:unlocked',
  ACHIEVEMENT_PROGRESS = 'achievement:progress',
  
  // XP events
  XP_AWARDED = 'xp:awarded',
  XP_LEVEL_UP = 'xp:level_up',
  
  // Community events
  COMMUNITY_CREATED = 'community:created',
  COMMUNITY_UPDATED = 'community:updated',
  COMMUNITY_DELETED = 'community:deleted',
  COMMUNITY_JOINED = 'community:joined',
  COMMUNITY_LEFT = 'community:left',
  COMMUNITY_POST_CREATED = 'community:post:created',
  COMMUNITY_POST_UPDATED = 'community:post:updated',
  COMMUNITY_POST_DELETED = 'community:post:deleted',
  COMMUNITY_COMMENT_CREATED = 'community:comment:created',
  COMMUNITY_COMMENT_UPDATED = 'community:comment:updated',
  COMMUNITY_COMMENT_DELETED = 'community:comment:deleted',
  COMMUNITY_EVENT_CREATED = 'community:event:created',
  COMMUNITY_EVENT_UPDATED = 'community:event:updated',
  COMMUNITY_EVENT_DELETED = 'community:event:deleted',
  COMMUNITY_EVENT_JOINED = 'community:event:joined',
  COMMUNITY_EVENT_LEFT = 'community:event:left',
  COMMUNITY_EVENT_ATTENDED = 'community:event:attended',
  COMMUNITY_ACTIVITY_CREATED = 'community:activity:created',
  
  // Redemption events
  REDEMPTION_CODE_USED = 'redemption:code:used',
  
  // CourtIQ events
  COURTIQ_TIER_CHANGED = 'courtiq:tier:changed',
  
  // PicklePulse events
  PICKLE_PULSE_RECALIBRATED = 'pickle_pulse:recalibrated'
}

/**
 * Event Bus implementation
 */
class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  /**
   * Subscribe to an event
   */
  subscribe(event: ServerEvents, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    
    this.handlers.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    };
  }
  
  /**
   * Emit an event
   */
  async emit(event: ServerEvents, data: any = {}): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    
    // Convert Set to Array for compatibility with older JS environments
    const handlersArray = Array.from(handlers);
    
    // Execute all handlers
    await Promise.all(
      handlersArray.map(handler => {
        try {
          return Promise.resolve(handler(data));
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
          return Promise.resolve();
        }
      })
    );
  }
  
  /**
   * Check if an event has subscribers
   */
  hasSubscribers(event: ServerEvents): boolean {
    const handlers = this.handlers.get(event);
    return !!handlers && handlers.size > 0;
  }
  
  /**
   * Get all registered events
   */
  getRegisteredEvents(): ServerEvents[] {
    return Array.from(this.handlers.keys()) as ServerEvents[];
  }
  
  /**
   * Clear all handlers for testing purposes
   */
  clear(): void {
    this.handlers.clear();
  }
}

export const ServerEventBus = new EventBus();