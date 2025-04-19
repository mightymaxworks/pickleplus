/**
 * PKL-278651-COMM-0022-FEED
 * Server Event Types
 * 
 * This module defines the types of events that can be emitted and subscribed to
 * in the server event bus system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

// Core events
export type CoreEvents = 
  | 'server:started'
  | 'server:stopping'
  | 'server:error';

// User events
export type UserEvents = 
  | 'user:created'
  | 'user:updated'
  | 'user:deleted'
  | 'user:logged_in'
  | 'user:logged_out';

// Match events
export type MatchEvents = 
  | 'match:created'
  | 'match:updated'
  | 'match:deleted'
  | 'match:validated'
  | 'match:disputed';

// Tournament events
export type TournamentEvents = 
  | 'tournament:created'
  | 'tournament:updated'
  | 'tournament:deleted'
  | 'tournament:started'
  | 'tournament:ended'
  | 'tournament:registration_opened'
  | 'tournament:registration_closed';

// XP system events
export type XpEvents = 
  | 'xp:awarded'
  | 'xp:level_up'
  | 'xp:multiplier_updated';

// Achievement system events
export type AchievementEvents = 
  | 'achievement:unlocked'
  | 'achievement:progress_updated';

// Community system events (PKL-278651-COMM-0022-FEED)
export type CommunityEvents = 
  | 'community:created'
  | 'community:updated'
  | 'community:deleted'
  | 'community:member:joined'
  | 'community:member:left'
  | 'community:post:created'
  | 'community:post:updated'
  | 'community:post:deleted'
  | 'community:comment:added'
  | 'community:comment:updated'
  | 'community:comment:deleted'
  | 'community:event:created'
  | 'community:event:updated'
  | 'community:event:deleted'
  | 'community:event:cancelled'
  | 'community:activity:created';

// Admin system events
export type AdminEvents = 
  | 'admin:user_updated'
  | 'admin:content_moderated'
  | 'admin:system_setting_changed';

// Combine all event types
export type ServerEvents = 
  | CoreEvents
  | UserEvents
  | MatchEvents
  | TournamentEvents
  | XpEvents
  | AchievementEvents
  | CommunityEvents
  | AdminEvents;