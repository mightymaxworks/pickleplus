/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Community Hub API Service
 * 
 * This file provides client-side API functions for interacting with the Community Hub endpoints.
 */

import { apiRequest } from "../queryClient";
import type {
  Community,
  InsertCommunity,
  CommunityMember,
  InsertCommunityMember,
  CommunityPost,
  InsertCommunityPost,
  CommunityEvent,
  InsertCommunityEvent,
  CommunityEventAttendee,
  InsertCommunityEventAttendee,
  CommunityPostComment,
  InsertCommunityPostComment,
  CommunityJoinRequest,
} from "@/types/community";

const BASE_URL = "/api/communities";

// === Communities ===

/**
 * Fetch all communities with optional filtering
 */
export async function getCommunities(options?: {
  limit?: number;
  offset?: number;
  query?: string;
  skillLevel?: string;
  location?: string;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.query) params.append("query", options.query);
  if (options?.skillLevel) params.append("skillLevel", options.skillLevel);
  if (options?.location) params.append("location", options.location);
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch communities: ${response.statusText}`);
  }
  
  return response.json() as Promise<Community[]>;
}

/**
 * Fetch a single community by ID
 */
export async function getCommunity(id: number) {
  const response = await apiRequest("GET", `${BASE_URL}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch community: ${response.statusText}`);
  }
  
  return response.json() as Promise<Community>;
}

/**
 * Create a new community
 */
export async function createCommunity(data: InsertCommunity) {
  const response = await apiRequest("POST", BASE_URL, data);
  
  if (!response.ok) {
    throw new Error(`Failed to create community: ${response.statusText}`);
  }
  
  return response.json() as Promise<Community>;
}

/**
 * Update a community
 */
export async function updateCommunity(id: number, data: Partial<InsertCommunity>) {
  const response = await apiRequest("PATCH", `${BASE_URL}/${id}`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to update community: ${response.statusText}`);
  }
  
  return response.json() as Promise<Community>;
}

/**
 * Get communities where the current user is a member
 */
export async function getMyCommunitiesList(options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/my${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch my communities: ${response.statusText}`);
  }
  
  return response.json() as Promise<Community[]>;
}

// === Community Members ===

/**
 * Fetch members of a community
 */
export async function getCommunityMembers(communityId: number, options?: {
  limit?: number;
  offset?: number;
  role?: string;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.role) params.append("role", options.role);
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/${communityId}/members${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch community members: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityMember[]>;
}

/**
 * Join a community
 */
export async function joinCommunity(communityId: number, message?: string) {
  const data = message ? { message } : {};
  const response = await apiRequest("POST", `${BASE_URL}/${communityId}/join`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to join community: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityMember>;
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: number) {
  const response = await apiRequest("POST", `${BASE_URL}/${communityId}/leave`);
  
  if (!response.ok) {
    throw new Error(`Failed to leave community: ${response.statusText}`);
  }
  
  return response.json();
}

// === Community Posts ===

/**
 * Fetch posts from a community
 */
export async function getCommunityPosts(communityId: number, options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/${communityId}/posts${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch community posts: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityPost[]>;
}

/**
 * Create a post in a community
 */
export async function createCommunityPost(communityId: number, data: Omit<InsertCommunityPost, "communityId" | "userId">) {
  const response = await apiRequest("POST", `${BASE_URL}/${communityId}/posts`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to create post: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityPost>;
}

/**
 * Fetch a single post
 */
export async function getCommunityPost(postId: number) {
  const response = await apiRequest("GET", `${BASE_URL}/posts/${postId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityPost>;
}

/**
 * Like a community post
 */
export async function likeCommunityPost(postId: number) {
  const response = await apiRequest("POST", `${BASE_URL}/posts/${postId}/like`);
  
  if (!response.ok) {
    throw new Error(`Failed to like post: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Unlike a community post
 */
export async function unlikeCommunityPost(postId: number) {
  const response = await apiRequest("DELETE", `${BASE_URL}/posts/${postId}/like`);
  
  if (!response.ok) {
    throw new Error(`Failed to unlike post: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Delete a community post
 */
export async function deleteCommunityPost(postId: number) {
  const response = await apiRequest("DELETE", `${BASE_URL}/posts/${postId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to delete post: ${response.statusText}`);
  }
  
  return response.json();
}

// === Post Comments ===

/**
 * Fetch comments for a post
 */
export async function getPostComments(postId: number) {
  const response = await apiRequest("GET", `${BASE_URL}/posts/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityPostComment[]>;
}

/**
 * Create a comment on a post
 */
export async function createPostComment(postId: number, data: {
  content: string;
  parentCommentId?: number;
}) {
  const response = await apiRequest("POST", `${BASE_URL}/posts/${postId}/comments`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to create comment: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityPostComment>;
}

// === Community Events ===

/**
 * Fetch events for a community
 */
export async function getCommunityEvents(communityId: number, options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/${communityId}/events${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch community events: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityEvent[]>;
}

/**
 * Create an event in a community
 */
export async function createCommunityEvent(communityId: number, data: Omit<InsertCommunityEvent, "communityId" | "createdByUserId">) {
  const response = await apiRequest("POST", `${BASE_URL}/${communityId}/events`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityEvent>;
}

/**
 * Register for a community event
 */
export async function registerForEvent(eventId: number, notes?: string) {
  const data = notes ? { notes } : {};
  const response = await apiRequest("POST", `${BASE_URL}/events/${eventId}/register`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to register for event: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityEventAttendee>;
}

/**
 * Cancel registration for a community event
 */
export async function cancelEventRegistration(eventId: number) {
  const response = await apiRequest("DELETE", `${BASE_URL}/events/${eventId}/register`);
  
  if (!response.ok) {
    throw new Error(`Failed to cancel event registration: ${response.statusText}`);
  }
  
  return response.json();
}

// === Community Join Requests ===

/**
 * Fetch pending join requests for a community (admin only)
 */
export async function getCommunityJoinRequests(communityId: number) {
  const response = await apiRequest("GET", `${BASE_URL}/${communityId}/join-requests`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch join requests: ${response.statusText}`);
  }
  
  return response.json() as Promise<CommunityJoinRequest[]>;
}

/**
 * Handle a join request (admin only)
 */
export async function handleJoinRequest(requestId: number, status: 'approved' | 'rejected') {
  const response = await apiRequest("PATCH", `${BASE_URL}/join-requests/${requestId}`, { status });
  
  if (!response.ok) {
    throw new Error(`Failed to ${status} join request: ${response.statusText}`);
  }
  
  return response.json();
}