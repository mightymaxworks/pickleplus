import { User, InsertUser } from "@shared/schema";
import { ProfileUpdateFormData } from "../../client/src/types";

// Interface for the Profile Service
export interface IProfileService {
  // Calculate profile completion percentage
  calculateProfileCompletion(user: User): number;
  
  // Update user profile
  updateProfile(userId: number, profileData: ProfileUpdateFormData): Promise<User>;
  
  // Check if a profile update should award XP
  shouldAwardXP(oldUser: User, newUser: User): boolean;
  
  // Calculate how much XP to award for a profile update
  calculateXPAward(oldUser: User, newUser: User): number;
}

// Interface for the XP Service
export interface IXPService {
  // Award XP to a user
  awardXP(userId: number, amount: number, reason: string): Promise<User>;
  
  // Calculate level from XP
  calculateLevel(xp: number): number;
  
  // Apply XP multiplier
  applyMultiplier(userId: number, amount: number): Promise<number>;
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