/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Content Types
 * 
 * Type definitions for social features, mirroring the database schema from shared/schema/social.ts
 * Part of Sprint 5: Social Features & UI Polish
 */

// Content types
export type ContentType = 
  | 'journal_entry'
  | 'feedback'
  | 'drill'
  | 'training_plan'
  | 'match_result'
  | 'achievement'
  | 'sage_insight'
  | 'user_connection';

// Visibility levels
export type Visibility = 'public' | 'friends' | 'private' | 'coaches';

// Shared content
export interface SharedContent {
  id: number;
  contentType: ContentType;
  contentId: number;
  userId: number;
  title: string;
  description: string | null;
  visibility: Visibility;
  customTags: string[] | null;
  highlightedText: string | null;
  customImage: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isFeatured: boolean;
  isModerationFlagged: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// Content reaction
export interface ContentReaction {
  id: number;
  contentId: number;
  userId: number;
  reactionType: string;
  createdAt: string;
}

// Content comment
export interface ContentComment {
  id: number;
  contentId: number;
  userId: number;
  text: string;
  parentCommentId: number | null;
  likeCount: number;
  isEdited: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string | null;
  // UI-specific properties
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  replies?: ContentComment[];
}

// Coaching recommendation
export interface CoachingRecommendation {
  id: number;
  fromUserId: number;
  toUserId: number;
  contentType: ContentType;
  contentId: number;
  status: string; // pending, accepted, declined, completed
  message: string | null;
  relevanceReason: string | null;
  skillsTargeted: string[] | null;
  respondedAt: string | null;
  completedAt: string | null;
  feedbackRating: number | null;
  feedbackComment: string | null;
  createdAt: string;
  // UI-specific properties
  fromUser?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  content?: SharedContent;
}

// Social feed item
export interface SocialFeedItem {
  id: number;
  contentType: ContentType;
  contentId: number;
  activityType: string; // shared, commented, reacted, recommended, etc.
  userId: number;
  targetUserId: number | null;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  enrichmentData: any | null;
  visibility: Visibility;
  isPinned: boolean;
  isHighlighted: boolean;
  timestamp: string;
  // UI-specific properties
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  targetUser?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// User connection request
export interface UserConnectionRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  connectionType: string; // friend, coach, mentor, etc.
  status: string; // pending, accepted, declined
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  // UI-specific properties
  fromUser?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  toUser?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// User connection
export interface UserConnection {
  id: number;
  userId: number;
  connectedUserId: number;
  connectionType: string; // friend, coach, mentor, etc.
  status: string; // active, blocked, archived
  createdAt: string;
  // UI-specific properties
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  connectedUser?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}