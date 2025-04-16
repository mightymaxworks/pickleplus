/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Client-side Community Types
 * 
 * This file provides TypeScript types for community-related data structures
 * to be used on the client side without importing server-specific dependencies.
 */

// Community model
export interface Community {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  skillLevel: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerPattern: string | null;
  isPrivate: boolean | null;
  requiresApproval: boolean | null;
  tags: string | null;
  memberCount: number;
  eventCount: number;
  postCount: number;
  createdByUserId: number;
  rules: string | null;
  guidelines: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// For creating communities
export interface InsertCommunity {
  name: string;
  description?: string | null;
  location?: string | null;
  skillLevel?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bannerPattern?: string | null;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  tags?: string | null;
  rules?: string | null;
  guidelines?: string | null;
  createdByUserId: number;
}

// Community member model
export interface CommunityMember {
  id: number;
  userId: number;
  communityId: number;
  role: string;
  joinedAt: Date | null;
  isActive: boolean;
  lastActive: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  user?: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
}

// For adding community members
export interface InsertCommunityMember {
  userId: number;
  communityId: number;
  role?: string;
  isActive?: boolean;
}

// Community post model
export interface CommunityPost {
  id: number;
  userId: number;
  communityId: number;
  content: string;
  mediaUrls: any | null;
  likes: number;
  comments: number;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  user?: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  liked?: boolean;
}

// For creating community posts
export interface InsertCommunityPost {
  userId: number;
  communityId: number;
  content: string;
  mediaUrls?: any;
  isPinned?: boolean;
  isAnnouncement?: boolean;
}

// Community event model
export interface CommunityEvent {
  id: number;
  communityId: number;
  createdByUserId: number;
  title: string;
  description: string | null;
  eventDate: Date;
  endDate: Date | null;
  location: string | null;
  isVirtual: boolean;
  virtualMeetingUrl: string | null;
  maxAttendees: number | null;
  currentAttendees: number;
  isPrivate: boolean;
  isRecurring: boolean;
  recurringPattern: string | null;
  repeatFrequency: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  createdBy?: {
    displayName: string;
    username: string;
  };
  isRegistered?: boolean;
}

// For creating community events
export interface InsertCommunityEvent {
  communityId: number;
  createdByUserId: number;
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
}

// Community event attendee model
export interface CommunityEventAttendee {
  id: number;
  eventId: number;
  userId: number;
  status: string;
  registeredAt: Date | null;
  checkedInAt: Date | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  user?: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
}

// For adding event attendees
export interface InsertCommunityEventAttendee {
  eventId: number;
  userId: number;
  status?: string;
  notes?: string | null;
}

// Community post comment model
export interface CommunityPostComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  likes: number;
  parentCommentId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  user?: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  liked?: boolean;
  replies?: CommunityPostComment[];
}

// For creating post comments
export interface InsertCommunityPostComment {
  postId: number;
  userId: number;
  content: string;
  parentCommentId?: number | null;
}

// Community join request model
export interface CommunityJoinRequest {
  id: number;
  communityId: number;
  userId: number;
  message: string | null;
  status: string;
  reviewedByUserId: number | null;
  reviewedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  
  // Joined data
  user?: {
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  reviewedBy?: {
    displayName: string;
    username: string;
  };
}