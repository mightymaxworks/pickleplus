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
  // Profile Images (10%)
  avatarUrl: { weight: 5, category: 'images' },
  banner_url: { weight: 5, category: 'images' },
  
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

// Pickle Points Awards by profile completion percentage thresholds
const PICKLE_POINTS_REWARD_TIERS = [
  { threshold: 25, reward: 50 },
  { threshold: 50, reward: 100 },
  { threshold: 75, reward: 150 },
  { threshold: 100, reward: 250 }
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
      // Check if we should award Pickle Points for crossing milestones
      let picklePointsAwarded = 0;
      if (this.shouldAwardPicklePoints(previousCompletion, newCompletion, currentUser)) {
        picklePointsAwarded = this.calculatePicklePointsAward(previousCompletion, newCompletion, currentUser);
      }

      // Update user with new completion percentage and award Pickle Points
      const updateData: any = { profileCompletionPct: newCompletion };
      
      if (picklePointsAwarded > 0) {
        const currentPicklePoints = currentUser.picklePoints || 0;
        updateData.picklePoints = currentPicklePoints + picklePointsAwarded;
        
        // Track which milestones have been awarded to prevent duplicates
        const currentMilestones = currentUser.profileMilestonesAwarded || [];
        const newMilestones = [...currentMilestones];
        
        // Add newly achieved milestones
        for (const tier of PICKLE_POINTS_REWARD_TIERS) {
          if (previousCompletion < tier.threshold && newCompletion >= tier.threshold) {
            if (!newMilestones.includes(tier.threshold)) {
              newMilestones.push(tier.threshold);
            }
          }
        }
        
        updateData.profileMilestonesAwarded = newMilestones;
        
        console.log(`[PROFILE-COMPLETION] User ${userId} earned ${picklePointsAwarded} Pickle Points for reaching ${newCompletion}% profile completion`);
      }

      const [finalUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
        
      return finalUser;
    }
    
    return updatedUser;
  }
  
  /**
   * Determine if a profile update should award Pickle Points
   * This happens when the user crosses a completion tier threshold they haven't achieved before
   */
  shouldAwardPicklePoints(oldCompletion: number, newCompletion: number, currentUser?: User): boolean {
    const milestonesAwarded = currentUser?.profileMilestonesAwarded || [];
    
    // Check if the user crossed any threshold they haven't been awarded for
    for (const tier of PICKLE_POINTS_REWARD_TIERS) {
      if (oldCompletion < tier.threshold && 
          newCompletion >= tier.threshold && 
          !milestonesAwarded.includes(tier.threshold)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate the Pickle Points award for a profile update
   */
  calculatePicklePointsAward(oldCompletion: number, newCompletion: number, currentUser?: User): number {
    const milestonesAwarded = currentUser?.profileMilestonesAwarded || [];
    let totalPicklePointsReward = 0;
    
    // Find all the tiers crossed in this update that haven't been awarded before
    for (const tier of PICKLE_POINTS_REWARD_TIERS) {
      if (oldCompletion < tier.threshold && 
          newCompletion >= tier.threshold && 
          !milestonesAwarded.includes(tier.threshold)) {
        totalPicklePointsReward += tier.reward;
      }
    }
    
    return totalPicklePointsReward;
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
  
  /**
   * Recalculate profile completion for a user and award any missing milestone points
   * This is useful for syncing existing users who may have missed milestone rewards
   */
  async syncProfileCompletionAndMilestones(userId: number): Promise<User> {
    // Get current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!currentUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Recalculate actual profile completion percentage
    const actualCompletion = this.calculateProfileCompletion(currentUser);
    const storedCompletion = currentUser.profileCompletionPct || 0;
    const currentMilestones = currentUser.profileMilestonesAwarded || [];
    
    console.log(`[PROFILE-SYNC] User ${userId} (${currentUser.username}): actual=${actualCompletion}%, stored=${storedCompletion}%, milestones=${JSON.stringify(currentMilestones)}`);
    
    // Calculate missing milestone rewards
    let picklePointsToAward = 0;
    const newMilestones = [...currentMilestones];
    
    for (const tier of PICKLE_POINTS_REWARD_TIERS) {
      if (actualCompletion >= tier.threshold && !currentMilestones.includes(tier.threshold)) {
        picklePointsToAward += tier.reward;
        newMilestones.push(tier.threshold);
        console.log(`[PROFILE-SYNC] User ${userId} earned ${tier.reward} points for ${tier.threshold}% milestone`);
      }
    }
    
    // Update user with corrected values
    const updateData: any = { 
      profileCompletionPct: actualCompletion,
      profileMilestonesAwarded: newMilestones
    };
    
    if (picklePointsToAward > 0) {
      const currentPicklePoints = currentUser.picklePoints || 0;
      updateData.picklePoints = currentPicklePoints + picklePointsToAward;
      console.log(`[PROFILE-SYNC] User ${userId} awarded ${picklePointsToAward} total Pickle Points (${currentPicklePoints} -> ${updateData.picklePoints})`);
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
}