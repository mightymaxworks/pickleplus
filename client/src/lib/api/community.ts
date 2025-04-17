/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community API Types
 * 
 * This file contains type definitions for the community module API.
 */

// Community type
export interface Community {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  postCount: number;
  eventCount: number;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  tags?: string;
  rules?: string;
  guidelines?: string;
  ownerId: number;
  owner?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

// Community post type
export interface CommunityPost {
  id: number;
  communityId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

// Community member type
export interface CommunityMember {
  id: number;
  communityId: number;
  userId: number;
  role: 'member' | 'moderator' | 'admin' | 'owner';
  joinedAt: string;
  status: 'active' | 'pending' | 'banned';
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
  };
}

// Community event type
export interface CommunityEvent {
  id: number;
  communityId: number;
  createdByUserId: number;
  title: string;
  description: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxAttendees: number;
  currentAttendees: number;
  createdAt: string;
  updatedAt: string;
  userIsAttending?: boolean;
  createdBy?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

// Join community request
export interface JoinCommunityRequest {
  communityId: number;
  message?: string;
}

// Create community request
export interface CreateCommunityRequest {
  name: string;
  description: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  location?: string;
  tags?: string;
  rules?: string;
  guidelines?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

// Create post request
export interface CreatePostRequest {
  communityId: number;
  title: string;
  content: string;
  imageUrl?: string;
}

// Create event request
export interface CreateEventRequest {
  communityId: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxAttendees: number;
}

// Update community request
export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  location?: string;
  tags?: string;
  rules?: string;
  guidelines?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}