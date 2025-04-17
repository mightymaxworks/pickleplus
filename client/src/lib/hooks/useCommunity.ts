/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Community Hub Query Hooks
 * 
 * This file provides React Query hooks for the Community Hub functionality.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import * as communityApi from "../api/community";
import { toast } from "@/hooks/use-toast";
import type {
  Community,
  InsertCommunity,
  CommunityPost,
  CommunityEvent,
  CommunityPostComment,
} from "@/types/community";

// Query keys
export const communityKeys = {
  all: ["communities"] as const,
  lists: () => [...communityKeys.all, "list"] as const,
  list: (filters: any) => [...communityKeys.lists(), filters] as const,
  details: () => [...communityKeys.all, "detail"] as const,
  detail: (id: number) => [...communityKeys.details(), id] as const,
  members: (communityId: number) => [...communityKeys.detail(communityId), "members"] as const,
  posts: (communityId: number) => [...communityKeys.detail(communityId), "posts"] as const,
  post: (postId: number) => [...communityKeys.all, "posts", postId] as const,
  postComments: (postId: number) => [...communityKeys.post(postId), "comments"] as const,
  events: (communityId: number) => [...communityKeys.detail(communityId), "events"] as const,
  joinRequests: (communityId: number) => [...communityKeys.detail(communityId), "join-requests"] as const,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.members(variables.communityId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(variables.communityId) });
      toast({
        title: "Community joined",
        description: "You have successfully joined the community.",
      });
    },
    onError: (error: Error) => {
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
    mutationFn: ({ communityId, data }: { communityId: number; data: Omit<CommunityPost, "id" | "communityId" | "userId" | "createdAt" | "updatedAt"> }) => 
      communityApi.createCommunityPost(communityId, data),
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
 * Hook to create an event in a community
 */
export function useCreateCommunityEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, data }: { 
      communityId: number; 
      data: Omit<CommunityEvent, "id" | "communityId" | "createdByUserId" | "createdAt" | "updatedAt">;
    }) => communityApi.createCommunityEvent(communityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.events(variables.communityId) });
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
 * Hook to register for an event
 */
export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, notes }: { eventId: number; notes?: string }) => 
      communityApi.registerForEvent(eventId, notes),
    onSuccess: () => {
      // We don't know the communityId here, so invalidate all events
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
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
    mutationFn: (eventId: number) => communityApi.cancelEventRegistration(eventId),
    onSuccess: () => {
      // We don't know the communityId here, so invalidate all events
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
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