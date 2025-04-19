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
// Re-exporting the original EventBus class
export { EventBus, EventHandler as EventBusHandler } from './event-bus';

// Re-exporting the serverEventBus
export { serverEventBus, ServerEvents as LegacyServerEvents } from './eventBus';