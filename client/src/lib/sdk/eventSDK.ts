/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * SDK for interacting with the Event API
 */

import { apiRequest } from '@/lib/queryClient';
import type { Event } from '@shared/schema/events';

/**
 * Get all upcoming events
 * @param limit Optional limit on the number of events to return
 * @returns Promise with array of upcoming events
 */
export async function getUpcomingEvents(limit: number = 10): Promise<Event[]> {
  const url = `/api/events/upcoming${limit ? `?limit=${limit}` : ''}`;
  return apiRequest(url);
}

/**
 * Get details for a specific event
 * @param eventId The ID of the event to retrieve
 * @returns Promise with event details
 */
export async function getEvent(eventId: number): Promise<Event> {
  return apiRequest(`/api/events/${eventId}`);
}

/**
 * Get all events organized by a specific user
 * @param limit Optional limit on the number of events to return
 * @param offset Optional offset for pagination
 * @returns Promise with array of events
 */
export async function getMyOrganizedEvents(limit?: number, offset?: number): Promise<Event[]> {
  let url = '/api/events/my/organized';
  
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  return apiRequest(url);
}

/**
 * Get all events a user has attended (checked into)
 * @param limit Optional limit on the number of events to return
 * @param offset Optional offset for pagination
 * @returns Promise with array of events
 */
export async function getMyAttendedEvents(limit?: number, offset?: number): Promise<Event[]> {
  let url = '/api/events/my/attended';
  
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  return apiRequest(url);
}

/**
 * Get the number of attendees checked into an event
 * @param eventId The ID of the event
 * @returns Promise with the number of attendees
 */
export async function getEventCheckInCount(eventId: number): Promise<number> {
  return apiRequest(`/api/events/${eventId}/check-in-count`);
}

/**
 * Get user's check-in status for an event
 * @param eventId The ID of the event
 * @returns Promise with boolean indicating if user is checked in
 */
export async function getEventCheckInStatus(eventId: number): Promise<boolean> {
  return apiRequest(`/api/events/${eventId}/check-in-status`);
}

/**
 * Create a new event
 * @param eventData The event data to create
 * @returns Promise with the created event
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees'>): Promise<Event> {
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}

/**
 * Update an existing event
 * @param eventId The ID of the event to update
 * @param eventData The updated event data
 * @returns Promise with the updated event
 */
export async function updateEvent(eventId: number, eventData: Partial<Event>): Promise<Event> {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  });
}

/**
 * Delete an event
 * @param eventId The ID of the event to delete
 * @returns Promise with success status
 */
export async function deleteEvent(eventId: number): Promise<{ success: boolean }> {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'DELETE'
  });
}

/**
 * Check a user into an event
 * @param eventId The ID of the event
 * @param userId The ID of the user to check in (if admin is checking in someone else)
 * @param checkInMethod The method of check-in ('qr', 'manual', etc.)
 * @returns Promise with the check-in details
 */
export async function checkInToEvent(eventId: number, userId?: number, checkInMethod: string = 'qr') {
  const payload = userId ? { userId, checkInMethod } : { checkInMethod };
  
  return apiRequest(`/api/events/${eventId}/check-in`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Get a list of attendees for an event
 * @param eventId The ID of the event
 * @param limit Optional limit on the number of attendees to return
 * @param offset Optional offset for pagination
 * @returns Promise with array of attendees
 */
export async function getEventAttendees(eventId: number, limit?: number, offset?: number) {
  let url = `/api/events/${eventId}/attendees`;
  
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  return apiRequest(url);
}

export default {
  getUpcomingEvents,
  getEvent,
  getMyOrganizedEvents,
  getMyAttendedEvents,
  getEventCheckInCount,
  getEventCheckInStatus,
  createEvent,
  updateEvent,
  deleteEvent,
  checkInToEvent,
  getEventAttendees
};