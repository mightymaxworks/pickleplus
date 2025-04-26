/**
 * PKL-278651-PROF-0006-TYPE - Enhanced User Interface
 * 
 * This file defines the enhanced user interface with extended profile fields.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

/**
 * Enhanced user interface with extended profile fields
 * Includes all base user fields plus additional profile information
 */
export interface EnhancedUser {
  // Base user fields
  id: number;
  username: string;
  email?: string | null;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  avatarInitials: string;
  bio?: string | null;
  location?: string | null;
  yearOfBirth?: number | null;
  
  // Status and verification
  isAdmin?: boolean;
  isCoach?: boolean;
  isVerified?: boolean;
  passportId?: string | null;
  
  // Performance metrics
  level: number;
  xp: number;
  totalMatches: number;
  matchesWon: number;
  matchesLost?: number;
  totalTournaments: number;
  rankingPoints: number;
  
  // Profile-related
  profileCompletionPct: number;
  lastVisit?: Date | string;
  createdAt?: Date | string;
  lastUpdated?: Date | string;
  
  // Equipment preferences
  paddleBrand?: string;
  paddleModel?: string;
  backupPaddleBrand?: string;
  backupPaddleModel?: string;
  otherEquipment?: string;
  
  // Playing preferences
  preferredPosition?: string;
  forehandStrength?: number;
  backhandStrength?: number;
  servePower?: number;
  dinkAccuracy?: number;
  thirdShotConsistency?: number;
  courtCoverage?: number;
  preferredSurface?: string;
  indoorOutdoorPreference?: string;
  
  // Extended profile fields
  height?: string;
  reach?: string;
  competitiveIntensity?: string;
  mentorshipInterest?: boolean;
  homeCourtLocations?: string[];
  travelRadiusKm?: number;
  playerGoals?: string;
  lookingForPartners?: boolean;
  
  // External ratings
  duprRating?: number;
  utprRating?: number;
  wprRating?: number;
  externalRatingsVerified?: boolean;
  
  // Social and privacy
  privacyProfile?: 'public' | 'friends' | 'private';
  
  // Collection-based data
  achievements: any[];
}