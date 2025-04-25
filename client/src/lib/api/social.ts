/**
 * PKL-278651-SAGE-0011-SOCIAL - Social API Integration
 * 
 * This file provides the API integration for social content features
 * Part of Sprint 5: Social Features & UI Polish
 */

import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShareContentRequest, 
  AddReactionRequest, 
  AddCommentRequest, 
  ReportContentRequest,
  ContentFeedParams
} from "@/types/social";

// API endpoints
const ENDPOINTS = {
  FEED: "/api/social/feed",
  CONTENT: "/api/social/content",
  REACTIONS: "/api/social/reactions",
  COMMENTS: "/api/social/comments",
  REPORTS: "/api/social/reports"
};

// Get content feed
export async function getContentFeed(params?: ContentFeedParams) {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.userId) queryParams.append("userId", params.userId.toString());
  if (params?.contentType) queryParams.append("contentType", params.contentType);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const res = await apiRequest("GET", `${ENDPOINTS.FEED}${queryString}`);
  return await res.json();
}

// Get content by ID
export async function getContentById(contentId: number) {
  const res = await apiRequest("GET", `${ENDPOINTS.CONTENT}/${contentId}`);
  return await res.json();
}

// Share content
export async function shareContent(data: ShareContentRequest) {
  const res = await apiRequest("POST", ENDPOINTS.CONTENT, data);
  return await res.json();
}

// Update shared content
export async function updateContent(contentId: number, data: Partial<ShareContentRequest>) {
  const res = await apiRequest("PATCH", `${ENDPOINTS.CONTENT}/${contentId}`, data);
  return await res.json();
}

// Delete shared content
export async function deleteContent(contentId: number) {
  const res = await apiRequest("DELETE", `${ENDPOINTS.CONTENT}/${contentId}`);
  return await res.json();
}

// Get content reactions
export async function getContentReactions(contentId: number) {
  const res = await apiRequest("GET", `${ENDPOINTS.REACTIONS}?contentId=${contentId}`);
  return await res.json();
}

// Add reaction to content
export async function addReaction(data: AddReactionRequest) {
  const res = await apiRequest("POST", ENDPOINTS.REACTIONS, data);
  return await res.json();
}

// Remove reaction from content
export async function removeReaction(data: AddReactionRequest) {
  const res = await apiRequest("DELETE", `${ENDPOINTS.REACTIONS}`, data);
  return await res.json();
}

// Get content comments
export async function getContentComments(contentId: number) {
  const res = await apiRequest("GET", `${ENDPOINTS.COMMENTS}?contentId=${contentId}`);
  return await res.json();
}

// Add comment to content
export async function addComment(data: AddCommentRequest) {
  const res = await apiRequest("POST", ENDPOINTS.COMMENTS, data);
  return await res.json();
}

// Report content
export async function reportContent(data: ReportContentRequest) {
  const res = await apiRequest("POST", ENDPOINTS.REPORTS, data);
  return await res.json();
}