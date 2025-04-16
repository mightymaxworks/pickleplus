/**
 * PKL-278651-ADMIN-0015-USER
 * Shared Types
 * 
 * This file contains shared type definitions used across the application.
 */

/**
 * User Model
 */
export interface User {
  id: number;
  username: string;
  email: string | null;
  password?: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarInitials: string | null;
  birthYear: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  experience: string | null;
  verified: boolean | null;
  verifiedAt: Date | null;
  passportId: string | null;
  xp: number;
  level: number;
  rankingPoints: number | null;
  preferredHand: string | null;
  preferredSide: string | null;
  paddleBrand: string | null;
  paddleModel: string | null;
  playStyle: string | null;
  isAdmin: boolean | null;
  isCoach: boolean | null;
  isFoundingMember: boolean | null;
  isTestData: boolean | null;
  profileCompletionPct: number | null;
  duprRating: number | null;
  ratingTier: string | null;
  consecutiveLoginDays: number | null;
  lastLoginAt: Date | null;
  lastActivityAt: Date | null;
  primaryPhone: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastUpdated: Date | null;
}