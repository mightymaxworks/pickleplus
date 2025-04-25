/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Content Types
 * 
 * This file defines the TypeScript types for social content features
 * Part of Sprint 5: Social Features & UI Polish
 */

export type ContentType = 
  | "journal_entry" 
  | "drill" 
  | "training_plan" 
  | "match_result" 
  | "achievement" 
  | "sage_insight" 
  | "feedback" 
  | "user_connection";

export type ContentVisibility = "public" | "friends" | "private" | "coaches";

export interface SharedContent {
  id: number;
  userId: number;
  contentType: ContentType;
  contentId: number;
  title: string;
  description?: string;
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  shareCount: number;
  highlightedText?: string;
  customTags?: string[];
  customImage?: string;
}

export interface ContentReaction {
  id: number;
  userId: number;
  contentId: number;
  reactionType: "like" | "celebrate" | "insightful" | "helpful";
  createdAt: string;
}

export interface ContentComment {
  id: number;
  userId: number;
  contentId: number;
  text: string;
  parentCommentId?: number;
  createdAt: string;
  updatedAt: string;
  replies?: ContentComment[];
}

export interface ContentReport {
  id: number;
  userId: number;
  contentId: number;
  contentType: string;
  reasonCode: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// API request/response types
export interface ShareContentRequest {
  contentType: ContentType;
  contentId: number;
  userId: number;
  title: string;
  description?: string;
  visibility: ContentVisibility;
  highlightedText?: string;
  customTags?: string[];
  customImage?: string;
}

export interface AddReactionRequest {
  contentId: number;
  reactionType: string;
}

export interface AddCommentRequest {
  contentId: number;
  text: string;
  parentCommentId?: number;
}

export interface ReportContentRequest {
  contentId: number;
  contentType: string;
  reasonCode: string;
  description: string;
}

export interface ContentFeedParams {
  limit?: number;
  offset?: number;
  userId?: number;
  contentType?: ContentType;
}