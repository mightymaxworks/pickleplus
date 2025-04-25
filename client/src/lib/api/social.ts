/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Content API
 * 
 * This file provides client-side API functions for interacting with the Social Content endpoints.
 * Part of Sprint 5: Social Features & UI Polish
 */

import { apiRequest } from "../queryClient";
import type {
  SharedContent,
  ContentReaction,
  ContentComment,
  CoachingRecommendation,
  SocialFeedItem,
  UserConnectionRequest,
  UserConnection
} from "@/types/social";

const BASE_URL = "/api/social";

// === Social Content ===

/**
 * Share content with the community
 */
export async function shareContent(data: {
  contentType: string;
  contentId: number;
  userId: number;
  title: string;
  description?: string;
  visibility?: "public" | "friends" | "private" | "coaches";
  customTags?: string[];
  highlightedText?: string;
  customImage?: string;
}) {
  const response = await apiRequest("POST", `${BASE_URL}/content`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to share content: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as SharedContent;
}

/**
 * Get content feed
 */
export async function getContentFeed(options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/feed/content${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch content feed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as SharedContent[];
}

/**
 * Get content by ID
 */
export async function getContentById(id: number) {
  const response = await apiRequest("GET", `${BASE_URL}/content/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as SharedContent;
}

/**
 * Get user's shared content
 */
export async function getUserSharedContent(userId: number, options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/content/user/${userId}${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user content: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as SharedContent[];
}

/**
 * Update shared content
 */
export async function updateContent(id: number, updates: {
  title?: string;
  description?: string;
  visibility?: "public" | "friends" | "private" | "coaches";
  customTags?: string[];
  highlightedText?: string;
  customImage?: string;
}) {
  const response = await apiRequest("PATCH", `${BASE_URL}/content/${id}`, updates);
  
  if (!response.ok) {
    throw new Error(`Failed to update content: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as SharedContent;
}

/**
 * Delete shared content
 */
export async function deleteContent(id: number) {
  const response = await apiRequest("DELETE", `${BASE_URL}/content/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to delete content: ${response.statusText}`);
  }
  
  return true;
}

// === Reactions ===

/**
 * Add reaction to content
 */
export async function addReaction(contentId: number, reactionType: string) {
  const response = await apiRequest("POST", `${BASE_URL}/content/${contentId}/reactions`, { reactionType });
  
  if (!response.ok) {
    throw new Error(`Failed to add reaction: ${response.statusText}`);
  }
  
  return true;
}

/**
 * Remove reaction from content
 */
export async function removeReaction(contentId: number, reactionType: string) {
  const response = await apiRequest("DELETE", `${BASE_URL}/content/${contentId}/reactions/${reactionType}`);
  
  if (!response.ok) {
    throw new Error(`Failed to remove reaction: ${response.statusText}`);
  }
  
  return true;
}

/**
 * Get reactions for content
 */
export async function getContentReactions(contentId: number) {
  const response = await apiRequest("GET", `${BASE_URL}/content/${contentId}/reactions`);
  
  if (!response.ok) {
    throw new Error(`Failed to get reactions: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as ContentReaction[];
}

/**
 * Check if user has reacted
 */
export async function hasUserReacted(contentId: number, reactionType: string) {
  const response = await apiRequest("GET", `${BASE_URL}/content/${contentId}/reactions/${reactionType}/check`);
  
  if (!response.ok) {
    throw new Error(`Failed to check reaction status: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data?.hasReacted as boolean;
}

// === Comments ===

/**
 * Add comment to content
 */
export async function addComment(contentId: number, text: string, parentCommentId?: number) {
  const data: any = { text };
  if (parentCommentId) data.parentCommentId = parentCommentId;
  
  const response = await apiRequest("POST", `${BASE_URL}/content/${contentId}/comments`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to add comment: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as ContentComment;
}

/**
 * Get comments for content
 */
export async function getContentComments(contentId: number, options?: {
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiRequest("GET", `${BASE_URL}/content/${contentId}/comments${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get comments: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as ContentComment[];
}

/**
 * Get replies to a comment
 */
export async function getCommentReplies(commentId: number) {
  const response = await apiRequest("GET", `${BASE_URL}/comments/${commentId}/replies`);
  
  if (!response.ok) {
    throw new Error(`Failed to get comment replies: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as ContentComment[];
}

// === Coaching Recommendations ===

/**
 * Create recommendation
 */
export async function createRecommendation(data: {
  toUserId: number;
  contentType: string;
  contentId: number;
  message?: string;
  relevanceReason?: string;
  skillsTargeted?: string[];
}) {
  const response = await apiRequest("POST", `${BASE_URL}/recommendations`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to create recommendation: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as CoachingRecommendation;
}

/**
 * Get received recommendations
 */
export async function getReceivedRecommendations() {
  const response = await apiRequest("GET", `${BASE_URL}/recommendations/received`);
  
  if (!response.ok) {
    throw new Error(`Failed to get received recommendations: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as CoachingRecommendation[];
}

/**
 * Get sent recommendations
 */
export async function getSentRecommendations() {
  const response = await apiRequest("GET", `${BASE_URL}/recommendations/sent`);
  
  if (!response.ok) {
    throw new Error(`Failed to get sent recommendations: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as CoachingRecommendation[];
}

/**
 * Update recommendation status
 */
export async function updateRecommendationStatus(
  id: number, 
  status: string, 
  feedbackRating?: number, 
  feedbackComment?: string
) {
  const data: any = { status };
  if (feedbackRating !== undefined) data.feedbackRating = feedbackRating;
  if (feedbackComment) data.feedbackComment = feedbackComment;
  
  const response = await apiRequest("PATCH", `${BASE_URL}/recommendations/${id}`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to update recommendation status: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as CoachingRecommendation;
}

// === User Connections ===

/**
 * Request connection with user
 */
export async function requestConnection(toUserId: number, connectionType: string, message?: string) {
  const data: any = { toUserId, connectionType };
  if (message) data.message = message;
  
  const response = await apiRequest("POST", `${BASE_URL}/connections/request`, data);
  
  if (!response.ok) {
    throw new Error(`Failed to request connection: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as UserConnectionRequest;
}

/**
 * Get pending connection requests
 */
export async function getPendingConnectionRequests() {
  const response = await apiRequest("GET", `${BASE_URL}/connections/requests/pending`);
  
  if (!response.ok) {
    throw new Error(`Failed to get pending connection requests: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as UserConnectionRequest[];
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(requestId: number) {
  const response = await apiRequest("POST", `${BASE_URL}/connections/requests/${requestId}/accept`);
  
  if (!response.ok) {
    throw new Error(`Failed to accept connection request: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as UserConnection[];
}

/**
 * Decline connection request
 */
export async function declineConnectionRequest(requestId: number) {
  const response = await apiRequest("POST", `${BASE_URL}/connections/requests/${requestId}/decline`);
  
  if (!response.ok) {
    throw new Error(`Failed to decline connection request: ${response.statusText}`);
  }
  
  return true;
}

/**
 * Get user connections
 */
export async function getUserConnections() {
  const response = await apiRequest("GET", `${BASE_URL}/connections`);
  
  if (!response.ok) {
    throw new Error(`Failed to get user connections: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data as UserConnection[];
}

/**
 * Remove connection
 */
export async function removeConnection(connectionId: number) {
  const response = await apiRequest("DELETE", `${BASE_URL}/connections/${connectionId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to remove connection: ${response.statusText}`);
  }
  
  return true;
}