/**
 * PKL-278651-COMM-0022-DISC
 * Community Types
 * 
 * This file defines the types used for the community feature.
 */

/**
 * Enum for community member roles
 */
export enum CommunityMemberRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner'
}

/**
 * Enum for community event types
 */
export enum CommunityEventType {
  MATCH_PLAY = 'match_play',
  CLINIC = 'clinic',
  TOURNAMENT = 'tournament',
  SOCIAL = 'social',
  WORKSHOP = 'workshop',
  LEAGUE = 'league'
}

/**
 * Enum for community event status
 */
export enum CommunityEventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Enum for event attendee status
 */
export enum EventAttendeeStatus {
  REGISTERED = 'registered',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended',
  CANCELLED = 'cancelled'
}

/**
 * Enum for community join request status
 */
export enum CommunityJoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

/**
 * PKL-278651-COMM-0032-UI-ALIGN 
 * Enhanced Community interface
 */
export interface Community {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  isMember?: boolean;
  isCreator?: boolean;
  isDefault?: boolean;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  tags?: string;
  skillLevel?: string;
  memberCount: number;
  postCount: number;
  eventCount: number;
  featuredTag?: string;
  // Enhanced visual properties
  themeColor?: string;
  accentColor?: string;
  bannerPattern?: 'grid' | 'dots' | 'diagonal' | 'waves';
}

export interface CommunityPost {
  id: number;
  communityId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  isLikedByUser?: boolean;
  authorName?: string;
  authorAvatar?: string;
}

export interface CommunityEvent {
  id: number;
  communityId: number;
  creatorId: number;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  currentAttendees: number;
  createdAt: Date;
  updatedAt: Date;
  isAttending?: boolean;
  creatorName?: string;
  creatorAvatar?: string;
  eventType: CommunityEventType;
  status: CommunityEventStatus;
  registrationStatus?: EventAttendeeStatus;
  skillLevel?: string;
  requiresApproval?: boolean;
}

export interface CommunityMember {
  id: number;
  communityId: number;
  userId: number;
  role: string;
  joinedAt: Date;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  passportId?: string;
  skillLevel?: string;
}

export interface CommunityJoinRequest {
  id: number;
  communityId: number;
  userId: number;
  message?: string;
  status: CommunityJoinRequestStatus;
  reviewedByUserId: number | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  user?: {
    username?: string;
    displayName?: string;
    avatarUrl?: string | null;
    email?: string;
    skillLevel?: string;
    playerRating?: number;
  };
}