/**
 * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
 * 
 * This module sets up the WebSocket server for real-time event status updates
 * and integrates it with the Express server.
 * 
 * Framework5.2 compliant with proper WebSocket connection handling and event broadcasting.
 * 
 * @implementation Framework5.2
 * @lastModified 2025-04-20
 */

import { Server } from 'http';
import { setupEventStatusWebSocket } from '../modules/events/eventStatusWebSocket';
import { db } from '../db';
import { events, eventRegistrations } from '@shared/schema/events';
import { eq } from 'drizzle-orm';
import { storage } from '../storage';

// Store event WebSocket interface for external use
let eventWsInterface: ReturnType<typeof setupEventStatusWebSocket> | null = null;

/**
 * Set up WebSocket routes for event status updates
 * @param httpServer The HTTP server instance
 */
export function setupEventWebSocketRoutes(httpServer: Server) {
  console.log("[API] Setting up event WebSocket server (PKL-278651-CONN-0012-SYNC)");
  
  try {
    // Set up WebSocket server
    eventWsInterface = setupEventStatusWebSocket(httpServer);
    
    console.log("[API] Event WebSocket server setup complete");
    
    return eventWsInterface;
  } catch (error) {
    console.error("[API] Error setting up event WebSocket server:", error);
    throw error;
  }
}

/**
 * Broadcast event registration status change
 * @param eventId Event ID
 * @param userId User ID
 * @param isRegistered Registration status
 */
export function broadcastEventRegistrationStatusChange(
  eventId: number,
  userId: number,
  isRegistered: boolean
) {
  if (!eventWsInterface) {
    console.warn("[API] Event WebSocket interface not initialized. Cannot broadcast registration status change.");
    return;
  }
  
  // Log the broadcast for debugging
  console.log(`[API][PKL-278651-CONN-0012-SYNC] Broadcasting registration status change: event=${eventId}, user=${userId}, registered=${isRegistered}`);
  
  // Broadcast through WebSocket
  eventWsInterface.broadcastRegistrationStatusChange(eventId, userId, isRegistered);
}

/**
 * Broadcast event attendance update
 * @param eventId Event ID
 * @param currentAttendees Current number of attendees
 * @param maxAttendees Maximum number of attendees
 */
export function broadcastEventAttendanceUpdate(
  eventId: number,
  currentAttendees: number,
  maxAttendees: number
) {
  if (!eventWsInterface) {
    console.warn("[API] Event WebSocket interface not initialized. Cannot broadcast attendance update.");
    return;
  }
  
  // Log the broadcast for debugging
  console.log(`[API][PKL-278651-CONN-0012-SYNC] Broadcasting attendance update: event=${eventId}, current=${currentAttendees}, max=${maxAttendees}`);
  
  // Broadcast through WebSocket
  eventWsInterface.broadcastAttendanceUpdate(eventId, currentAttendees, maxAttendees);
}

/**
 * Broadcast event schedule change
 * @param eventId Event ID
 * @param startDateTime New start date/time
 * @param endDateTime New end date/time
 */
export function broadcastEventScheduleChange(
  eventId: number,
  startDateTime: string,
  endDateTime: string
) {
  if (!eventWsInterface) {
    console.warn("[API] Event WebSocket interface not initialized. Cannot broadcast schedule change.");
    return;
  }
  
  // Log the broadcast for debugging
  console.log(`[API][PKL-278651-CONN-0012-SYNC] Broadcasting schedule change: event=${eventId}, start=${startDateTime}, end=${endDateTime}`);
  
  // Broadcast through WebSocket
  eventWsInterface.broadcastScheduleChange(eventId, startDateTime, endDateTime);
}

/**
 * Broadcast event cancellation
 * @param eventId Event ID
 */
export function broadcastEventCancellation(eventId: number) {
  if (!eventWsInterface) {
    console.warn("[API] Event WebSocket interface not initialized. Cannot broadcast event cancellation.");
    return;
  }
  
  // Log the broadcast for debugging
  console.log(`[API][PKL-278651-CONN-0012-SYNC] Broadcasting event cancellation: event=${eventId}`);
  
  // Broadcast through WebSocket
  eventWsInterface.broadcastEventCancellation(eventId);
}

/**
 * Get the event WebSocket interface
 * @returns The event WebSocket interface if initialized, null otherwise
 */
export function getEventWebSocketInterface() {
  return eventWsInterface;
}