/**
 * PKL-278651-COMM-0015-EVENT
 * Community API Client
 * 
 * This file provides API client functions for community-related operations.
 * Follows Framework 5.1 architecture patterns.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-17
 */

import { queryClient } from '@/lib/queryClient';

// Define a type-safe wrapper around fetch for our API
async function apiRequest<T>(options: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
}): Promise<T> {
  const { url, method, data, params } = options;
  
  // Build URL with params if provided
  let fetchUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fetchUrl = `${url}?${queryString}`;
    }
  }
  
  // Create request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };
  
  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    requestOptions.body = JSON.stringify(data);
  }
  
  const response = await fetch(fetchUrl, requestOptions);
  
  if (!response.ok) {
    // Try to get the error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (jsonError) {
      // If we can't parse the JSON, just throw a generic error
      throw new Error(`API error: ${response.status}. Endpoint: ${fetchUrl}`);
    }
  }
  
  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  
  return JSON.parse(text) as T;
}
import { 
  Community, 
  CommunityEvent, 
  CommunityMember,
  CommunityJoinRequest,
  InsertCommunityEvent,
  PaginationOptions
} from '@/types/community';

/**
 * Cache key factory for community-related queries
 */
export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters: any) => [...communityKeys.lists(), { filters }] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (id: number) => [...communityKeys.details(), id] as const,
  
  // Events
  events: (communityId: number) => [...communityKeys.detail(communityId), 'events'] as const,
  event: (communityId: number, eventId: number) => [...communityKeys.events(communityId), eventId] as const,
  eventsByType: (communityId: number, type: string) => [...communityKeys.events(communityId), 'type', type] as const,
  eventsByStatus: (communityId: number, status: string) => [...communityKeys.events(communityId), 'status', status] as const,
  
  // Members
  members: (communityId: number) => [...communityKeys.detail(communityId), 'members'] as const,
  member: (communityId: number, userId: number) => [...communityKeys.members(communityId), userId] as const,
  
  // Join requests
  joinRequests: (communityId: number) => [...communityKeys.detail(communityId), 'join-requests'] as const,
  joinRequest: (communityId: number, requestId: number) => [...communityKeys.joinRequests(communityId), requestId] as const,
  
  // Posts
  posts: (communityId: number) => [...communityKeys.detail(communityId), 'posts'] as const,
  post: (communityId: number, postId: number) => [...communityKeys.posts(communityId), postId] as const,
};

const communityApi = {
  /**
   * Get all communities
   */
  getCommunities: async (options?: PaginationOptions) => {
    const response = await apiRequest<Community[]>({
      url: '/api/communities',
      method: 'GET',
      params: options,
    });
    return response;
  },

  /**
   * Get a single community by ID
   */
  getCommunity: async (id: number) => {
    const response = await apiRequest<Community>({
      url: `/api/communities/${id}`,
      method: 'GET',
    });
    return response;
  },

  /**
   * Create a new community
   */
  createCommunity: async (data: any) => {
    const response = await apiRequest<Community>({
      url: '/api/communities',
      method: 'POST',
      data,
    });
    return response;
  },

  /**
   * Update a community
   */
  updateCommunity: async (id: number, data: any) => {
    const response = await apiRequest<Community>({
      url: `/api/communities/${id}`,
      method: 'PATCH',
      data,
    });
    return response;
  },

  /**
   * Delete a community
   */
  deleteCommunity: async (id: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${id}`,
      method: 'DELETE',
    });
    return response;
  },

  /**
   * Join a community
   */
  joinCommunity: async (communityId: number, message?: string) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/join`,
      method: 'POST',
      data: { message },
    });
    return response;
  },

  /**
   * Leave a community
   */
  leaveCommunity: async (communityId: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/leave`,
      method: 'POST',
    });
    return response;
  },

  /**
   * Get community events
   */
  getCommunityEvents: async (communityId: number, options?: PaginationOptions) => {
    const response = await apiRequest<CommunityEvent[]>({
      url: `/api/communities/${communityId}/events`,
      method: 'GET',
      params: options,
    });
    return response;
  },

  /**
   * Get a specific community event
   */
  getCommunityEvent: async (communityId: number, eventId: number) => {
    const response = await apiRequest<CommunityEvent>({
      url: `/api/communities/${communityId}/events/${eventId}`,
      method: 'GET',
    });
    return response;
  },

  /**
   * Create a community event
   */
  createCommunityEvent: async (communityId: number, data: Omit<InsertCommunityEvent, 'communityId' | 'createdByUserId'>) => {
    try {
      console.log('API Request data:', data);
      const response = await apiRequest<CommunityEvent>({
        url: `/api/communities/${communityId}/events`,
        method: 'POST',
        data,
      });
      return response;
    } catch (error) {
      console.error('Error in createCommunityEvent API call:', error);
      throw error;
    }
  },

  /**
   * Update a community event
   */
  updateCommunityEvent: async (communityId: number, eventId: number, data: any) => {
    const response = await apiRequest<CommunityEvent>({
      url: `/api/communities/${communityId}/events/${eventId}`,
      method: 'PATCH',
      data,
    });
    return response;
  },

  /**
   * Delete a community event
   */
  deleteCommunityEvent: async (communityId: number, eventId: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/events/${eventId}`,
      method: 'DELETE',
    });
    return response;
  },

  /**
   * Register for an event
   */
  registerForEvent: async (communityId: number, eventId: number, notes?: string) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/events/${eventId}/register`,
      method: 'POST',
      data: { notes },
    });
    return response;
  },

  /**
   * Cancel event registration
   */
  cancelEventRegistration: async (communityId: number, eventId: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/events/${eventId}/cancel-registration`,
      method: 'POST',
    });
    return response;
  },

  /**
   * Get community members
   */
  getCommunityMembers: async (communityId: number, options?: PaginationOptions) => {
    const response = await apiRequest<CommunityMember[]>({
      url: `/api/communities/${communityId}/members`,
      method: 'GET',
      params: options,
    });
    return response;
  },

  /**
   * Get community join requests
   */
  getCommunityJoinRequests: async (communityId: number, options?: PaginationOptions) => {
    const response = await apiRequest<CommunityJoinRequest[]>({
      url: `/api/communities/${communityId}/join-requests`,
      method: 'GET',
      params: options,
    });
    return response;
  },

  /**
   * Approve a join request
   */
  approveJoinRequest: async (communityId: number, requestId: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/join-requests/${requestId}/approve`,
      method: 'POST',
    });
    return response;
  },

  /**
   * Reject a join request
   */
  rejectJoinRequest: async (communityId: number, requestId: number) => {
    const response = await apiRequest<void>({
      url: `/api/communities/${communityId}/join-requests/${requestId}/reject`,
      method: 'POST',
    });
    return response;
  },
  
  /**
   * Get event attendees
   */
  getEventAttendees: async (communityId: number, eventId: number) => {
    const response = await apiRequest<import('@/types/community').CommunityEventAttendee[]>({
      url: `/api/communities/${communityId}/events/${eventId}/attendees`,
      method: 'GET',
    });
    return response;
  },
};

export default communityApi;