/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community API Types and Utilities
 * 
 * This file contains the types and utility functions for the community API.
 */

export interface Community {
  id: number;
  name: string;
  description: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerPattern?: string;
  location?: string;
  tags?: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  memberCount: number;
  postCount: number;
  eventCount: number;
  createdAt: string;
  updatedAt: string;
  rules?: string;
  guidelines?: string;
}

export interface CommunityMember {
  id: number;
  userId: number;
  communityId: number;
  role: 'member' | 'admin' | 'moderator';
  joinedAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface CommunityPost {
  id: number;
  communityId: number;
  userId: number;
  content: string;
  imageUrls?: string[];
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  userHasLiked?: boolean;
  author?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

export interface CommunityEvent {
  id: number;
  communityId: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  currentAttendees: number;
  createdAt: string;
  updatedAt: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  userIsAttending?: boolean;
}

export interface CommunityComment {
  id: number;
  postId: number;
  userId: number;
  parentId?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  replies?: CommunityComment[];
}

// Use this type for a new post creation
export type NewCommunityPost = {
  content: string;
  isPinned?: boolean;
  imageUrls?: string[];
};

// Join Community Request
export type JoinCommunityRequest = {
  communityId: number;
  message?: string;
};

// Register for event
export type EventRegistrationRequest = {
  eventId: number;
  notes?: string;
};