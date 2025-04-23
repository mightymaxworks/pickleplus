/**
 * PKL-278651-PASS-0014-DEFT - Default Community Event for PicklePass™ System
 * 
 * This file defines a default community event that is always available to all users
 * in the PicklePass™ system. This ensures users always have at least one event in 
 * their account, improving user experience and demonstrating the platform's functionality.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import type { Event } from '@shared/schema/events';

// Special ID for the default community event
export const DEFAULT_COMMUNITY_EVENT_ID = -1;

// Get current date
const now = new Date();

// Set start time to current date at 6:00 PM
const startDate = new Date(now);
startDate.setHours(18, 0, 0, 0); // 6:00 PM

// If current time is past 6:00 PM, move to tomorrow
if (now > startDate) {
  startDate.setDate(startDate.getDate() + 1);
}

// Set end time to 2 hours after start time
const endDate = new Date(startDate);
endDate.setHours(endDate.getHours() + 2);

/**
 * Default community event that all users are automatically registered for
 */
export const defaultCommunityEvent: Event = {
  id: DEFAULT_COMMUNITY_EVENT_ID,
  name: "Pickle+ Community Meetup",
  description: "Weekly community gathering for all Pickle+ members. Join us to meet fellow players, practice your skills, and learn about upcoming features and events.",
  startDateTime: startDate,
  endDateTime: endDate,
  location: "Pickle+ Virtual Courts",
  maxAttendees: null,
  currentAttendees: 111, // Matching the current user count
  organizerId: 1, // System administrator
  isPrivate: false,
  requiresCheckIn: false,
  checkInCode: null,
  eventType: 'community',
  isTestData: false,
  status: 'upcoming',
  isDefault: true,
  hideParticipantCount: false,
  createdAt: now,
  updatedAt: now
};

/**
 * Check if an event is the default community event
 */
export function isDefaultCommunityEvent(event: Event): boolean {
  return event.id === DEFAULT_COMMUNITY_EVENT_ID || 
         event.isDefault === true ||
         (event.eventType === 'community' && event.name === defaultCommunityEvent.name);
}

/**
 * Add the default community event to a list of events if it doesn't already exist
 */
export function ensureDefaultCommunityEvent(events: Event[] = []): Event[] {
  if (!Array.isArray(events)) {
    return [defaultCommunityEvent];
  }
  
  // Check if default event already exists in the list
  const hasDefaultEvent = events.some(event => isDefaultCommunityEvent(event));
  
  if (hasDefaultEvent) {
    return events;
  }
  
  // Add default event to the beginning of the list
  return [defaultCommunityEvent, ...events];
}