/**
 * PKL-278651-COMM-0013-SDK
 * Community Utilities
 * 
 * This file provides utility functions for working with community data.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import { 
  Community, 
  CommunityEvent, 
  CommunityEventStatus, 
  CommunityEventType,
  CommunityFilterOptions,
  CommunitySortOptions,
  CommunityMember,
  CommunityMemberRole,
  EventAttendeeStatus
} from "@/types/community";

/**
 * Formats a tag string from the database into an array of tags
 */
export function formatTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

/**
 * Converts a tag array back to a comma-separated string for storage
 */
export function tagsToString(tags: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  return tags.join(', ');
}

/**
 * Filters a list of communities based on filter options
 */
export function filterCommunities(
  communities: Community[], 
  filters: CommunityFilterOptions
): Community[] {
  if (!communities || !communities.length) return [];
  
  return communities.filter(community => {
    // Full-text search across name, description
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const nameMatch = community.name.toLowerCase().includes(query);
      const descMatch = community.description?.toLowerCase().includes(query) || false;
      const tagsMatch = community.tags?.toLowerCase().includes(query) || false;
      
      if (!(nameMatch || descMatch || tagsMatch)) {
        return false;
      }
    }
    
    // Filter by skill level
    if (filters.skillLevel && community.skillLevel !== filters.skillLevel) {
      return false;
    }
    
    // Filter by location
    if (filters.location && (!community.location || !community.location.includes(filters.location))) {
      return false;
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const communityTags = formatTags(community.tags);
      if (!filters.tags.some(tag => communityTags.includes(tag))) {
        return false;
      }
    }
    
    // Filter by member count range
    if (filters.memberCountMin !== undefined && community.memberCount < filters.memberCountMin) {
      return false;
    }
    if (filters.memberCountMax !== undefined && community.memberCount > filters.memberCountMax) {
      return false;
    }
    
    // Filter by has events
    if (filters.hasEvents === true && community.eventCount <= 0) {
      return false;
    }
    
    // Filter by creation date
    if (filters.createdAfter && community.createdAt && new Date(community.createdAt) < filters.createdAfter) {
      return false;
    }
    if (filters.createdBefore && community.createdAt && new Date(community.createdAt) > filters.createdBefore) {
      return false;
    }
    
    // Filter by membership status
    if (filters.isMember !== undefined && community.isMember !== filters.isMember) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sorts a list of communities based on sort options
 */
export function sortCommunities(
  communities: Community[],
  sortOptions: CommunitySortOptions
): Community[] {
  if (!communities || !communities.length) return [];
  
  const { sortBy, sortOrder } = sortOptions;
  const direction = sortOrder === 'asc' ? 1 : -1;
  
  return [...communities].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'memberCount':
        return direction * (a.memberCount - b.memberCount);
      case 'eventCount':
        return direction * (a.eventCount - b.eventCount);
      case 'postCount':
        return direction * (a.postCount - b.postCount);
      case 'createdAt':
        if (!a.createdAt || !b.createdAt) return 0;
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return 0;
    }
  });
}

/**
 * Checks if a user is an admin of a community
 */
export function isUserCommunityAdmin(
  members: CommunityMember[],
  userId: number
): boolean {
  if (!members || !members.length || !userId) return false;
  
  return members.some(member => 
    member.userId === userId && 
    member.role === CommunityMemberRole.ADMIN
  );
}

/**
 * Checks if a user is a moderator of a community
 */
export function isUserCommunityModerator(
  members: CommunityMember[],
  userId: number
): boolean {
  if (!members || !members.length || !userId) return false;
  
  return members.some(member => 
    member.userId === userId && 
    (member.role === CommunityMemberRole.ADMIN || member.role === CommunityMemberRole.MODERATOR)
  );
}

/**
 * Gets the upcoming events for a community
 */
export function getUpcomingEvents(events: CommunityEvent[]): CommunityEvent[] {
  if (!events || !events.length) return [];
  
  const now = new Date();
  
  return events
    .filter(event => 
      new Date(event.eventDate) > now && 
      event.status !== CommunityEventStatus.CANCELLED
    )
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

/**
 * Gets past events for a community
 */
export function getPastEvents(events: CommunityEvent[]): CommunityEvent[] {
  if (!events || !events.length) return [];
  
  const now = new Date();
  
  return events
    .filter(event => 
      new Date(event.eventDate) < now || 
      event.status === CommunityEventStatus.COMPLETED
    )
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}

/**
 * Determines if an event has available spots for registration
 */
export function hasAvailableSpots(event: CommunityEvent): boolean {
  if (!event) return false;
  
  // If no max attendees, always has spots
  if (!event.maxAttendees) return true;
  
  return event.currentAttendees < event.maxAttendees;
}

/**
 * Gets the label for an event registration status
 */
export function getRegistrationStatusLabel(status: EventAttendeeStatus): string {
  switch (status) {
    case EventAttendeeStatus.REGISTERED:
      return 'Registered';
    case EventAttendeeStatus.WAITLISTED:
      return 'Waitlisted';
    case EventAttendeeStatus.ATTENDED:
      return 'Attended';
    case EventAttendeeStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the label for a community event type
 */
export function getEventTypeLabel(type: CommunityEventType): string {
  switch (type) {
    case CommunityEventType.MATCH_PLAY:
      return 'Match Play';
    case CommunityEventType.CLINIC:
      return 'Clinic';
    case CommunityEventType.TOURNAMENT:
      return 'Tournament';
    case CommunityEventType.SOCIAL:
      return 'Social';
    case CommunityEventType.WORKSHOP:
      return 'Workshop';
    case CommunityEventType.LEAGUE:
      return 'League';
    default:
      return 'Event';
  }
}

/**
 * Gets the color for a community event type (for UI display)
 */
export function getEventTypeColor(type: CommunityEventType): string {
  switch (type) {
    case CommunityEventType.MATCH_PLAY:
      return 'blue';
    case CommunityEventType.CLINIC:
      return 'green';
    case CommunityEventType.TOURNAMENT:
      return 'orange';
    case CommunityEventType.SOCIAL:
      return 'purple';
    case CommunityEventType.WORKSHOP:
      return 'cyan';
    case CommunityEventType.LEAGUE:
      return 'pink';
    default:
      return 'gray';
  }
}