import { User } from "@shared/schema";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ProfileUpdateFormData } from "../../client/src/types";
import { IProfileService } from "./interfaces";

// Type for profile fields
type ProfileFieldConfig = {
  weight: number;
  category: string;
  comingSoon?: boolean;
}

type ProfileFields = {
  [key: string]: ProfileFieldConfig;
}

// Interface to allow indexing User with strings
interface UserWithIndexSignature extends User {
  [key: string]: any;
}

// Define the fields that contribute to profile completion
// with their respective weights (total should be 100)
export const PROFILE_FIELDS: ProfileFields = {
  // Basic fields (25%)
  bio: { weight: 3, category: 'basic' },
  location: { weight: 3, category: 'basic' },
  skillLevel: { weight: 3, category: 'basic' },
  playingSince: { weight: 3, category: 'basic' },
  preferredFormat: { weight: 3, category: 'basic' },
  dominantHand: { weight: 2, category: 'basic' },
  yearOfBirth: { weight: 2, category: 'basic' },
  height: { weight: 2, category: 'basic' },
  reach: { weight: 2, category: 'basic' },
  privateMessagePreference: { weight: 2, category: 'basic' },
  
  // Equipment preferences (15%)
  preferredPosition: { weight: 3, category: 'equipment' },
  paddleBrand: { weight: 3, category: 'equipment' },
  paddleModel: { weight: 3, category: 'equipment' },
  backupPaddleBrand: { weight: 2, category: 'equipment' },
  backupPaddleModel: { weight: 2, category: 'equipment' },
  otherEquipment: { weight: 2, category: 'equipment' },
  
  // Playing style and preferences (20%)
  playingStyle: { weight: 3, category: 'playing' },
  shotStrengths: { weight: 3, category: 'playing' },
  regularSchedule: { weight: 3, category: 'playing' },
  lookingForPartners: { weight: 3, category: 'playing' },
  playerGoals: { weight: 3, category: 'playing' },
  preferredSurface: { weight: 2, category: 'playing' },
  indoorOutdoorPreference: { weight: 2, category: 'playing' },
  competitiveIntensity: { weight: 1, category: 'playing' },
  
  // Performance self-assessment (15%)
  forehandStrength: { weight: 2.5, category: 'performance' },
  backhandStrength: { weight: 2.5, category: 'performance' },
  servePower: { weight: 2.5, category: 'performance' },
  dinkAccuracy: { weight: 2.5, category: 'performance' },
  thirdShotConsistency: { weight: 2.5, category: 'performance' },
  courtCoverage: { weight: 2.5, category: 'performance' },
  
  // Social/Community fields (15%)
  // Coaching-related fields marked as "Coming Soon" - not counted in profile completion
  coach: { weight: 0, category: 'social', comingSoon: true },
  clubs: { weight: 0, category: 'social', comingSoon: true },
  leagues: { weight: 0, category: 'social', comingSoon: true },
  socialHandles: { weight: 0, category: 'social', comingSoon: true },
  mentorshipInterest: { weight: 5, category: 'social' }, // Increased weight to compensate
  homeCourtLocations: { weight: 10, category: 'social' }, // Increased weight to compensate
  
  // Health fields (10%)
  mobilityLimitations: { weight: 3, category: 'health' },
  preferredMatchDuration: { weight: 3, category: 'health' },
  fitnessLevel: { weight: 4, category: 'health' }
};

// XP Awards by profile completion percentage thresholds
const XP_REWARD_TIERS = [
  { threshold: 25, reward: 25 },
  { threshold: 50, reward: 50 },
  { threshold: 75, reward: 75 },
  { threshold: 100, reward: 100 }
];

export class ProfileService implements IProfileService {
  /**
   * Calculate the profile completion percentage based on filled fields
   */
  calculateProfileCompletion(user: User): number {
    if (!user) return 0;
    
    // Cast the user to our interface with index signature
    const userWithIndex = user as UserWithIndexSignature;
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    // Calculate total possible weight
    for (const field in PROFILE_FIELDS) {
      const fieldConfig = PROFILE_FIELDS[field];
      // Skip "Coming Soon" fields
      if (fieldConfig.comingSoon === true) {
        continue;
      }
      
      // Get the weight from the profile field
      totalWeight += fieldConfig.weight;
      
      // Check if this field is completed in the user object
      const fieldValue = userWithIndex[field];
      
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
          const obj = fieldValue as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedWeight += fieldConfig.weight;
          }
        } else {
          completedWeight += fieldConfig.weight;
        }
      }
    }
    
    // Calculate percentage (0-100)
    return Math.round((completedWeight / totalWeight) * 100);
  }
  
  /**
   * Update a user's profile with the provided data
   */
  async updateProfile(userId: number, profileData: ProfileUpdateFormData): Promise<User> {
    // Get the current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!currentUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Calculate previous completion percentage
    const previousCompletion = this.calculateProfileCompletion(currentUser);
    
    // Update the user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profileData,
        lastUpdated: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    // Calculate new completion percentage
    const newCompletion = this.calculateProfileCompletion(updatedUser);
    
    // Update the profile completion percentage if it changed
    if (newCompletion !== previousCompletion) {
      const [finalUser] = await db
        .update(users)
        .set({
          profileCompletionPct: newCompletion
        })
        .where(eq(users.id, userId))
        .returning();
        
      return finalUser;
    }
    
    return updatedUser;
  }
  
  /**
   * Determine if a profile update should award XP
   * This happens when the user crosses a completion tier threshold
   */
  shouldAwardXP(oldUser: User, newUser: User): boolean {
    const oldCompletion = oldUser.profileCompletionPct || 0;
    const newCompletion = newUser.profileCompletionPct || 0;
    
    // Check if the user crossed any threshold
    for (const tier of XP_REWARD_TIERS) {
      if (oldCompletion < tier.threshold && newCompletion >= tier.threshold) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate the XP award for a profile update
   */
  calculateXPAward(oldUser: User, newUser: User): number {
    const oldCompletion = oldUser.profileCompletionPct || 0;
    const newCompletion = newUser.profileCompletionPct || 0;
    
    let totalXpReward = 0;
    
    // Find all the tiers crossed in this update
    for (const tier of XP_REWARD_TIERS) {
      if (oldCompletion < tier.threshold && newCompletion >= tier.threshold) {
        totalXpReward += tier.reward;
      }
    }
    
    return totalXpReward;
  }
  
  /**
   * Get a breakdown of completed and incomplete profile fields
   */
  getFieldBreakdown(user: User): {
    completedFields: string[];
    incompleteFields: string[];
    completedCategories: Record<string, number>;
    comingSoonFields?: string[];
  } {
    const completedFields: string[] = [];
    const incompleteFields: string[] = [];
    const comingSoonFields: string[] = [];
    const completedCategories: Record<string, number> = {
      basic: 0,
      equipment: 0,
      playing: 0,
      performance: 0,
      social: 0,
      health: 0
    };
    const categoryTotals: Record<string, number> = {
      basic: 0,
      equipment: 0,
      playing: 0,
      performance: 0,
      social: 0,
      health: 0
    };
    
    // Cast the user to our interface with index signature
    const userWithIndex = user as UserWithIndexSignature;
    
    // Check each field
    for (const field in PROFILE_FIELDS) {
      const fieldConfig = PROFILE_FIELDS[field];
      const category = fieldConfig.category;
      const weight = fieldConfig.weight;
      const isComingSoon = fieldConfig.comingSoon === true;
      
      // Skip "Coming Soon" fields in completion calculation
      if (isComingSoon) {
        comingSoonFields.push(field);
        continue;
      }
      
      // Add to category total
      categoryTotals[category] += weight;
      
      // Check if this field is completed in the user object
      const fieldValue = userWithIndex[field];
      
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
          const obj = fieldValue as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedFields.push(field);
            completedCategories[category] += weight;
          } else {
            incompleteFields.push(field);
          }
        } else {
          completedFields.push(field);
          completedCategories[category] += weight;
        }
      } else {
        incompleteFields.push(field);
      }
    }
    
    // Convert category completion to percentages
    for (const category in completedCategories) {
      completedCategories[category] = Math.round(
        (completedCategories[category] / (categoryTotals[category] || 1)) * 100
      );
    }
    
    return {
      completedFields,
      incompleteFields,
      completedCategories,
      comingSoonFields
    };
  }
}