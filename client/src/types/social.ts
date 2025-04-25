/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Types
 * 
 * Type definitions for social content features
 * Part of Sprint 5: Social Features & UI Polish
 */

// Content types supported by the social system
export type ContentType = 
  | "journal_entry" 
  | "drill" 
  | "training_plan" 
  | "match_result" 
  | "achievement" 
  | "sage_insight" 
  | "feedback" 
  | "user_connection";

// Visibility options for shared content
export type Visibility = "public" | "friends" | "private" | "coaches";

// Reaction types for content
export type ReactionType = "like" | "celebrate" | "insightful" | "helpful";

// Report reason types
export type ReportReason = 
  | "inappropriate" 
  | "spam" 
  | "offensive" 
  | "incorrect" 
  | "other";

// Shared content interface
export interface SharedContent {
  id: number;
  contentType: ContentType;
  contentId: number;
  userId: number;
  title: string;
  description?: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  stats?: {
    commentCount: number;
    reactionCount: number;
    viewCount: number;
  };
  highlightedText?: string;
  customTags?: string[];
  customImage?: string;
  isPinned?: boolean;
  isHighlighted?: boolean;
}

// Content comment interface
export interface ContentComment {
  id: number;
  contentId: number;
  userId: number;
  text: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  isEdited?: boolean;
  parentCommentId?: number;
  replies?: ContentComment[];
}

// Content reaction interface
export interface ContentReaction {
  id: number;
  contentId: number;
  userId: number;
  reactionType: ReactionType;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

// Request interfaces

// Parameters for retrieving content feed
export interface ContentFeedParams {
  limit?: number;
  offset?: number;
  userId?: number;
  contentType?: ContentType;
}

// Request to share content
export interface ShareContentRequest {
  contentType: ContentType;
  contentId: number;
  userId: number;
  title: string;
  description?: string;
  visibility: Visibility;
  highlightedText?: string;
  customTags?: string[];
  customImage?: string;
}

// Request to add a reaction to content
export interface AddReactionRequest {
  contentId: number;
  userId: number;
  reactionType: ReactionType;
}

// Request to add a comment to content
export interface AddCommentRequest {
  contentId: number;
  userId: number;
  text: string;
  parentCommentId?: number;
}

// Request to report content
export interface ReportContentRequest {
  contentId: number;
  userId: number;
  reason: ReportReason;
  details?: string;
}