/**
 * PKL-278651-COMM-0013-SDK
 * Enhanced Community Hub Query Hooks
 * 
 * This file provides React Query hooks for the Community Hub functionality
 * with enhanced filtering, sorting, and type safety.
 * 
 * @version 2.0.0
 * @lastModified 2025-04-17
 * @changes
 * - Added support for advanced filtering and sorting options
 * - Improved typings with new enums and interfaces
 * - Added support for community event types and statuses
 * - Enhanced caching strategy for better performance
 * @preserves
 * - Core query key structure
 * - Optimistic updates for mutations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { apiRequest } from "../queryClient";
import communityApi from "@/api/communityApi";
import { toast } from "@/hooks/use-toast";
import type {
  Community,
  InsertCommunity,
  CommunityPost,
  CommunityEvent,
  CommunityPostComment,
  CommunityMember,
  CommunityEventAttendee,
  CommunityJoinRequest,
  CommunityFilterOptions,
  CommunitySortOptions,
  PaginationOptions,
  PostMedia,
  CommunityMemberRole,
  CommunityEventStatus,
  CommunityEventType,
  EventAttendeeStatus,
  CommunityJoinRequestStatus
} from "@/types/community";
import { filterCommunities, sortCommunities } from "../utils/communityUtils";

// Query keys
export const communityKeys = {
  all: ["communities"] as const,
  lists: () => [...communityKeys.all, "list"] as const,
  list: (filters: any) => [...communityKeys.lists(), filters] as const,
  filtered: (filters: CommunityFilterOptions) => [...communityKeys.lists(), "filtered", filters] as const,
  sorted: (sortOptions: CommunitySortOptions) => [...communityKeys.lists(), "sorted", sortOptions] as const,
  details: () => [...communityKeys.all, "detail"] as const,
  detail: (id: number) => [...communityKeys.details(), id] as const,
  members: (communityId: number) => [...communityKeys.detail(communityId), "members"] as const,
  posts: (communityId: number) => [...communityKeys.detail(communityId), "posts"] as const,
  post: (postId: number) => [...communityKeys.all, "posts", postId] as const,
  postComments: (postId: number) => [...communityKeys.post(postId), "comments"] as const,
  events: (communityId: number) => [...communityKeys.detail(communityId), "events"] as const,
  event: (communityId: number, eventId: number) => [...communityKeys.events(communityId), eventId] as const,
  eventsByType: (communityId: number, type: CommunityEventType) => 
    [...communityKeys.events(communityId), "type", type] as const,
  eventsByStatus: (communityId: number, status: CommunityEventStatus) => 
    [...communityKeys.events(communityId), "status", status] as const,
  joinRequests: (communityId: number) => [...communityKeys.detail(communityId), "join-requests"] as const,
  myCommunityIds: () => [...communityKeys.all, "my-community-ids"] as const,
};

// === Community List ===

/**
 * Hook to fetch communities list with optional filtering
 */
export function useCommunities(options?: {
  limit?: number;
  offset?: number;
  query?: string;
  skillLevel?: string;
  location?: string;
  enabled?: boolean;
}) {
  const { limit, offset, query, skillLevel, location, enabled = true } = options || {};
  
  return useQuery({
    queryKey: communityKeys.list({ limit, offset, query, skillLevel, location }),
    queryFn: () => communityApi.getCommunities({ limit, offset, query, skillLevel, location }),
    enabled,
  });
}

/**
 * Hook to fetch communities with advanced filtering and sorting
 * @param filterOptions - Options for filtering communities
 * @param sortOptions - Options for sorting communities
 * @param paginationOptions - Options for paginating results
 * @param queryOptions - Additional react-query options
 */
export function useFilteredCommunities(
  filterOptions?: CommunityFilterOptions | null,
  sortOptions?: CommunitySortOptions | null,
  paginationOptions?: PaginationOptions | null,
  queryOptions?: { enabled?: boolean }
) {
  const { enabled = true } = queryOptions || {};
  const { limit, offset } = paginationOptions || {};
  
  // Get the base data without client-side filtering
  const baseQuery = useQuery({
    queryKey: communityKeys.filtered(filterOptions || {}),
    queryFn: () => communityApi.getCommunities({ limit, offset }),
    enabled,
  });
  
  // Store the filtered state for debugging and UI purposes
  const isFiltered = !!filterOptions && Object.keys(filterOptions).length > 0;
  const isSorted = !!sortOptions && !!sortOptions.sortBy;
  
  return {
    ...baseQuery,
    isFiltered,
    isSorted
  };
}

/**
 * Hook to fetch communities where the current user is a member
 */
export function useMyCommunitiesList(options?: {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { limit, offset, enabled = true } = options || {};
  
  return useQuery({
    queryKey: [...communityKeys.lists(), 'my', { limit, offset }],
    queryFn: () => communityApi.getMyCommunitiesList({ limit, offset }),
    enabled,
  });
}

/**
 * Hook to fetch the IDs of communities where the current user is a member
 */
export function useMyCommunityIds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.myCommunityIds(),
    queryFn: () => communityApi.getMyCommunityIds(),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch a single community by ID
 */
export function useCommunity(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: () => communityApi.getCommunity(id),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to create a new community
 */
export function useCreateCommunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertCommunity) => communityApi.createCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      toast({
        title: "Community created",
        description: "Your community has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create community",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update a community
 */
export function useUpdateCommunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertCommunity> }) => 
      communityApi.updateCommunity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.id) });
      toast({
        title: "Community updated",
        description: "Community details have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update community",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Community Members ===

/**
 * Hook to fetch community members
 */
export function useCommunityMembers(communityId: number, options?: {
  limit?: number;
  offset?: number;
  role?: string;
  enabled?: boolean;
}) {
  const { limit, offset, role, enabled = true } = options || {};
  
  return useQuery({
    queryKey: [...communityKeys.members(communityId), { limit, offset, role }],
    queryFn: () => communityApi.getCommunityMembers(communityId, { limit, offset, role }),
    enabled,
  });
}

/**
 * Hook to join a community
 */
export function useJoinCommunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, message }: { communityId: number; message?: string }) => 
      communityApi.joinCommunity(communityId, message),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: communityKeys.all });
      
      // Get all query keys that might have communities data
      const listQueryKey = communityKeys.lists();
      const detailQueryKey = communityKeys.detail(variables.communityId);
      
      // Find all queries in the cache that might need updating
      const queryCache = queryClient.getQueryCache();
      const communityQueries = queryCache.findAll({ 
        queryKey: communityKeys.all,
        exact: false 
      });
      
      // Store previous values for all community-related queries
      const previousQueryData = new Map();
      
      // Save previous states
      communityQueries.forEach(query => {
        previousQueryData.set(query.queryKey, queryClient.getQueryData(query.queryKey));
      });
      
      // Direct references to the specific queries we'll update
      const previousCommunities = queryClient.getQueryData(listQueryKey);
      const previousCommunity = queryClient.getQueryData(detailQueryKey);
      
      // Update all list queries that contain communities
      communityQueries.forEach(query => {
        const data = queryClient.getQueryData(query.queryKey);
        
        // Only update if it's an array (likely a communities list)
        if (Array.isArray(data)) {
          queryClient.setQueryData(query.queryKey, data.map((community: any) => 
            community.id === variables.communityId 
              ? { ...community, isMember: true } 
              : community
          ));
        } 
        // For single community objects
        else if (data && typeof data === 'object' && 'id' in data && data.id === variables.communityId) {
          queryClient.setQueryData(query.queryKey, { ...data, isMember: true });
        }
      });
      
      return { 
        previousQueryData,
        previousCommunities, 
        previousCommunity 
      };
    },
    onSuccess: (_, variables, context) => {
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      // Specifically invalidate the community IDs query
      queryClient.invalidateQueries({ queryKey: communityKeys.myCommunityIds() });
      toast({
        title: "Community joined",
        description: "You have successfully joined the community.",
      });
    },
    onError: (error: Error, variables, context) => {
      // Revert optimistic updates
      if (context?.previousCommunities) {
        queryClient.setQueryData(communityKeys.lists(), context.previousCommunities);
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          communityKeys.detail(variables.communityId),
          context.previousCommunity
        );
      }
      
      toast({
        title: "Failed to join community",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to leave a community
 */
export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (communityId: number) => communityApi.leaveCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.members(communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      // Specifically invalidate the community IDs query
      queryClient.invalidateQueries({ queryKey: communityKeys.myCommunityIds() });
      toast({
        title: "Community left",
        description: "You have left the community.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave community",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Community Posts ===

/**
 * Hook to fetch community posts
 */
export function useCommunityPosts(communityId: number, options?: {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { limit, offset, enabled = true } = options || {};
  
  return useQuery({
    queryKey: [...communityKeys.posts(communityId), { limit, offset }],
    queryFn: () => communityApi.getCommunityPosts(communityId, { limit, offset }),
    enabled,
  });
}

/**
 * Hook to fetch a single post
 */
export function useCommunityPost(postId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.post(postId),
    queryFn: () => communityApi.getCommunityPost(postId),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to create a post in a community
 */
export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, data }: { 
      communityId: number; 
      data: { 
        content: string; 
        mediaUrls?: PostMedia[]; 
        isPinned?: boolean; 
        isAnnouncement?: boolean; 
      }
    }) => communityApi.createCommunityPost(communityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts(variables.communityId) });
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to like a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => communityApi.likeCommunityPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
      // Also invalidate the parent posts list if we're viewing it
      const communityId = queryClient
        .getQueryData<CommunityPost>(communityKeys.post(postId))
        ?.communityId;
      
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.posts(communityId) });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to like post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to unlike a post
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => communityApi.unlikeCommunityPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
      // Also invalidate the parent posts list if we're viewing it
      const communityId = queryClient
        .getQueryData<CommunityPost>(communityKeys.post(postId))
        ?.communityId;
      
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.posts(communityId) });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unlike post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => communityApi.deleteCommunityPost(postId),
    onSuccess: (_, postId) => {
      // Find the post to get its communityId before it's deleted
      const communityId = queryClient
        .getQueryData<CommunityPost>(communityKeys.post(postId))
        ?.communityId;
      
      // Invalidate post
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
      
      // If we have the communityId, invalidate the community's posts list
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: communityKeys.posts(communityId) });
        // Also refresh the community detail to update post count
        queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) });
      }
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Post Comments ===

/**
 * Hook to fetch post comments
 */
export function usePostComments(postId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.postComments(postId),
    queryFn: () => communityApi.getPostComments(postId),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to create a comment on a post
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: { 
      postId: number; 
      content: string; 
      parentCommentId?: number;
    }) => communityApi.createPostComment(postId, { content, parentCommentId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.postComments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.post(variables.postId) });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Community Events ===

/**
 * Hook to fetch community events
 */
export function useCommunityEvents(communityId: number, options?: {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { limit, offset, enabled = true } = options || {};
  
  return useQuery({
    queryKey: [...communityKeys.events(communityId), { limit, offset }],
    queryFn: () => communityApi.getCommunityEvents(communityId, { limit, offset }),
    enabled,
  });
}

/**
 * Hook to fetch community events by event type
 */
export function useCommunityEventsByType(
  communityId: number, 
  eventType: CommunityEventType,
  options?: { 
    limit?: number; 
    offset?: number; 
    enabled?: boolean 
  }
) {
  const { limit, offset, enabled = true } = options || {};
  
  // Get all events first
  const eventsQuery = useQuery({
    queryKey: [...communityKeys.events(communityId), { limit, offset }],
    queryFn: () => communityApi.getCommunityEvents(communityId, { limit, offset }),
    enabled,
  });
  
  // Filter by type client-side
  const filteredEvents = React.useMemo(() => {
    if (!eventsQuery.data || !Array.isArray(eventsQuery.data)) return [];
    return eventsQuery.data.filter(event => event.eventType === eventType);
  }, [eventsQuery.data, eventType]);
  
  return {
    ...eventsQuery,
    data: filteredEvents,
  };
}

/**
 * Hook to fetch community events by status
 */
export function useCommunityEventsByStatus(
  communityId: number, 
  status: CommunityEventStatus,
  options?: { 
    limit?: number; 
    offset?: number; 
    enabled?: boolean 
  }
) {
  const { limit, offset, enabled = true } = options || {};
  
  // Get all events first
  const eventsQuery = useQuery({
    queryKey: [...communityKeys.events(communityId), { limit, offset }],
    queryFn: () => communityApi.getCommunityEvents(communityId, { limit, offset }),
    enabled,
  });
  
  // Filter by status client-side
  const filteredEvents = React.useMemo(() => {
    if (!eventsQuery.data || !Array.isArray(eventsQuery.data)) return [];
    return eventsQuery.data.filter(event => event.status === status);
  }, [eventsQuery.data, status]);
  
  return {
    ...eventsQuery,
    data: filteredEvents,
  };
}

/**
 * Hook to create an event in a community
 */
export function useCreateCommunityEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, data }: { 
      communityId: number; 
      data: {
        title: string;
        description?: string | null;
        eventDate: Date;
        endDate?: Date | null;
        location?: string | null;
        isVirtual?: boolean;
        virtualMeetingUrl?: string | null;
        maxAttendees?: number | null;
        isPrivate?: boolean;
        isRecurring?: boolean;
        recurringPattern?: string | null;
        repeatFrequency?: string | null;
        status?: CommunityEventStatus;
        eventType?: CommunityEventType;
        minSkillLevel?: string | null;
        maxSkillLevel?: string | null;
        imageUrl?: string | null; // Changed from featuredImage to match server schema
        registrationDeadline?: Date | null;
      }
    }) => communityApi.createCommunityEvent(communityId, data),
    onSuccess: (_, variables) => {
      // Invalidate all event-related queries
      queryClient.invalidateQueries({ queryKey: communityKeys.events(variables.communityId) });
      
      // Also invalidate type-specific queries if we know the event type
      if (variables.data.eventType) {
        queryClient.invalidateQueries({ 
          queryKey: communityKeys.eventsByType(variables.communityId, variables.data.eventType) 
        });
      }
      
      // Also invalidate status-specific queries if we know the status
      if (variables.data.status) {
        queryClient.invalidateQueries({ 
          queryKey: communityKeys.eventsByStatus(variables.communityId, variables.data.status) 
        });
      }
      
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to fetch a single community event
 */
export function useCommunityEvent(communityId: number, eventId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.event(communityId, eventId),
    queryFn: () => communityApi.getCommunityEvent(communityId, eventId),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to register for an event
 */
export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, eventId, notes }: { communityId: number; eventId: number; notes?: string }) => 
      communityApi.registerForEvent(communityId, eventId, notes),
    onSuccess: (_, variables) => {
      // Invalidate specific event and events list
      queryClient.invalidateQueries({ queryKey: communityKeys.event(variables.communityId, variables.eventId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.events(variables.communityId) });
      toast({
        title: "Registration successful",
        description: "You have been registered for the event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to register for event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to cancel event registration
 */
export function useCancelEventRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, eventId }: { communityId: number; eventId: number }) => 
      communityApi.cancelEventRegistration(communityId, eventId),
    onSuccess: (_, variables) => {
      // Invalidate specific event and events list
      queryClient.invalidateQueries({ queryKey: communityKeys.event(variables.communityId, variables.eventId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.events(variables.communityId) });
      toast({
        title: "Registration cancelled",
        description: "Your event registration has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel registration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Join Requests (Admin) ===

/**
 * Hook to fetch community join requests (admin only)
 */
export function useCommunityJoinRequests(communityId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: communityKeys.joinRequests(communityId),
    queryFn: () => communityApi.getCommunityJoinRequests(communityId),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to handle join requests (admin only)
 */
export function useHandleJoinRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      requestId, 
      communityId, 
      status 
    }: { 
      requestId: number; 
      communityId: number; 
      status: 'approved' | 'rejected';
    }) => communityApi.handleJoinRequest(requestId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.joinRequests(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.members(variables.communityId) });
      toast({
        title: `Request ${variables.status}`,
        description: `The join request has been ${variables.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to handle join request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}