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
const PROFILE_FIELDS: ProfileFields = {
  // Basic fields (30%)
  bio: { weight: 5, category: 'basic' },
  location: { weight: 5, category: 'basic' },
  skillLevel: { weight: 5, category: 'basic' },
  playingSince: { weight: 5, category: 'basic' },
  preferredFormat: { weight: 5, category: 'basic' },
  dominantHand: { weight: 5, category: 'basic' },
  
  // Pickleball-specific fields (40%)
  preferredPosition: { weight: 5, category: 'pickleball' },
  paddleBrand: { weight: 5, category: 'pickleball' },
  paddleModel: { weight: 5, category: 'pickleball' },
  playingStyle: { weight: 5, category: 'pickleball' },
  shotStrengths: { weight: 5, category: 'pickleball' },
  playerGoals: { weight: 5, category: 'pickleball' },
  regularSchedule: { weight: 5, category: 'pickleball' },
  lookingForPartners: { weight: 5, category: 'pickleball' },
  
  // Social/Community fields (20%)
  coach: { weight: 5, category: 'social' },
  clubs: { weight: 5, category: 'social' },
  leagues: { weight: 5, category: 'social' },
  socialHandles: { weight: 5, category: 'social' },
  
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
      // Get the weight from the profile field
      totalWeight += PROFILE_FIELDS[field].weight;
      
      // Check if this field is completed in the user object
      const fieldValue = userWithIndex[field];
      
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
          const obj = fieldValue as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedWeight += PROFILE_FIELDS[field].weight;
          }
        } else {
          completedWeight += PROFILE_FIELDS[field].weight;
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
        profileLastUpdated: new Date(),
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
  } {
    const completedFields: string[] = [];
    const incompleteFields: string[] = [];
    const completedCategories: Record<string, number> = {
      basic: 0,
      pickleball: 0,
      social: 0,
      health: 0
    };
    const categoryTotals: Record<string, number> = {
      basic: 0,
      pickleball: 0,
      social: 0,
      health: 0
    };
    
    // Cast the user to our interface with index signature
    const userWithIndex = user as UserWithIndexSignature;
    
    // Check each field
    for (const field in PROFILE_FIELDS) {
      const category = PROFILE_FIELDS[field].category;
      const weight = PROFILE_FIELDS[field].weight;
      
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
        (completedCategories[category] / categoryTotals[category]) * 100
      );
    }
    
    return {
      completedFields,
      incompleteFields,
      completedCategories
    };
  }
}