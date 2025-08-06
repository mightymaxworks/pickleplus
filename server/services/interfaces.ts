import { User, InsertUser } from "@shared/schema";
import { ProfileUpdateFormData } from "../../client/src/types";

// Interface for the Profile Service
export interface IProfileService {
  // Calculate profile completion percentage
  calculateProfileCompletion(user: User): number;
  
  // Update user profile
  updateProfile(userId: number, profileData: ProfileUpdateFormData): Promise<User>;
  
  // Check if a profile update should award Pickle Points
  shouldAwardPicklePoints(oldCompletion: number, newCompletion: number): boolean;
  
  // Calculate how many Pickle Points to award for a profile update
  calculatePicklePointsAward(oldCompletion: number, newCompletion: number): number;
  
  // Get breakdown of profile fields
  getFieldBreakdown(user: User): {
    completedFields: string[];
    incompleteFields: string[];
    completedCategories: Record<string, number>;
    comingSoonFields?: string[];
  };
  
  // Sync profile completion and award missing milestones
  syncProfileCompletionAndMilestones(userId: number): Promise<User>;
}

// Interface for the XP Service
export interface IXPService {
  // Award XP to a user
  awardXP(userId: number, amount: number, reason: string): Promise<User>;
  
  // Calculate level from XP
  calculateLevel(xp: number): number;
  
  // Apply XP multiplier
  applyMultiplier(userId: number, amount: number): Promise<number>;
  
  // Get tier information for a user
  getUserTier(userId: number): Promise<{
    tier: string;
    tierDescription: string;
    tierProgress: number;
    nextTier: string | null;
    levelUntilNextTier: number;
  }>;
}

// Interface for the User API Service
export interface IUserAPI {
  // Get user details
  getUser(userId: number): Promise<User>;
  
  // Update user profile
  updateUserProfile(userId: number, data: ProfileUpdateFormData): Promise<User>;
  
  // Get profile completion status
  getProfileCompletionStatus(userId: number): Promise<{
    completionPercentage: number;
    completedFields: string[];
    incompleteFields: string[];
    xpEarned: number;
    potentialXp: number;
  }>;
}