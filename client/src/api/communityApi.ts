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

import { apiRequest } from '@/lib/queryClient';
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
    const response = await apiRequest<CommunityEvent>({
      url: `/api/communities/${communityId}/events`,
      method: 'POST',
      data,
    });
    return response;
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
};

export default communityApi;