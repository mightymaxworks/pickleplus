/**
 * Type declarations for the server-event-bus module
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
  COMMUNITY_ACTIVITY_CREATED = 'community:activity:created',
  COMMUNITY_EVENT_ATTENDED = 'community:event:attended',
  
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
export interface EventBus {
  subscribe(event: ServerEvents, handler: EventHandler): () => void;
  emit(event: ServerEvents, data?: any): Promise<void>;
  hasSubscribers(event: ServerEvents): boolean;
  getRegisteredEvents(): ServerEvents[];
  clear(): void;
}

export const ServerEventBus: EventBus;