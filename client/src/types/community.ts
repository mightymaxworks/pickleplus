/**
 * PKL-278651-COMM-0013-SDK
 * Enhanced Client-side Community Types
 * 
 * This file provides TypeScript types for community-related data structures
 * to be used on the client side without importing server-specific dependencies.
 * 
 * @version 3.0.0
 * @lastModified 2025-04-17
 * @changes
 * - Added better documentation for each interface
 * - Enhanced type safety with stricter definitions
 * - Added support for advanced filtering and sorting
 * - Added status types for community events and members
 * @preserves
 * - Core data model compatibility
 * - UI display properties
 */

/**
 * @enum
 * Community Member Role Types
 * Defines the possible roles a user can have in a community
 */
export enum CommunityMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

/**
 * @enum
 * Community Event Status Types
 * Defines the possible statuses for community events
 */
export enum CommunityEventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * @enum
 * Community Join Request Status Types
 * Defines the possible statuses for join requests
 */
export enum CommunityJoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

/**
 * @enum
 * Event Attendee Status Types
 * Defines the possible statuses for event attendance
 */
export enum EventAttendeeStatus {
  REGISTERED = 'registered',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended', 
  CANCELLED = 'cancelled'
}

/**
 * Community Filtering Options
 * Used for advanced filtering of communities
 */
export interface CommunityFilterOptions {
  query?: string;
  skillLevel?: string;
  location?: string;
  tags?: string[];
  memberCountMin?: number;
  memberCountMax?: number;
  hasEvents?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  isMember?: boolean;
}

/**
 * Community Sorting Options
 * Used for sorting community lists
 */
export interface CommunitySortOptions {
  sortBy: 'name' | 'memberCount' | 'eventCount' | 'postCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination Options
 * Used for paginating API results
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Community Model
 * Represents a community entity in the Pickle+ platform
 */
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
  // Extended properties for UI display
  isMember?: boolean;
  featuredTag?: string;
  skill?: string;
  rating?: number;
  events?: number;
  founded?: string;
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

/**
 * Community Member Model
 * Represents a member of a community with their role and status
 */
export interface CommunityMember {
  id: number;
  userId: number;
  communityId: number;
  role: CommunityMemberRole;
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
    email?: string;
    bio?: string | null;
    skillLevel?: string | null;
  };
  
  // Extended properties
  activeDays?: number;
  contribution?: {
    posts: number;
    comments: number;
    events: number;
  };
}

/**
 * Community Member Insert Model
 * Used when adding a new member to a community
 */
export interface InsertCommunityMember {
  userId: number;
  communityId: number;
  role?: CommunityMemberRole;
  isActive?: boolean;
}

/**
 * Media Type
 * Defines the structure for media attachments in posts
 */
export interface PostMedia {
  url: string;
  type: 'image' | 'video' | 'document';
  thumbnailUrl?: string;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Community Post Model
 * Represents a post in a community
 */
export interface CommunityPost {
  id: number;
  userId: number;
  communityId: number;
  content: string;
  mediaUrls: PostMedia[] | null;
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

/**
 * Community Post Insert Model
 * Used when creating a new post in a community
 */
export interface InsertCommunityPost {
  userId: number;
  communityId: number;
  content: string;
  mediaUrls?: PostMedia[];
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