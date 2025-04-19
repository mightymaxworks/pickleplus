/**
 * PKL-278651-COMM-0022-XP
 * Events module index file
 * 
 * This file re-exports the event bus implementations for easier importing.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

// Re-export the server-event-bus implementation
export * from './server-event-bus';

// For backward compatibility
import * as eventBusModule from './event-bus';
import * as serverEventBusModule from './eventBus';

export const EventBus = eventBusModule;
export const serverEventBus = serverEventBusModule;