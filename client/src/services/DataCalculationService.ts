/**
 * PKL-278651-PROF-0022-CALC - Data Calculation Service
 * 
 * Frontend-first calculation service for various application metrics
 * including XP, profile completion, and other user-related calculations.
 * 
 * This is a core component of the Frontend-First architecture.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { getLevelInfo, calculateLevel } from "@/lib/calculateLevel";
import { EnhancedUser } from "@/types/enhanced-user";
import { apiRequest } from "@/lib/queryClient";

// Re-export level calculation functions for convenience
export { getLevelInfo, calculateLevel };

// Define the CalculatedUserMetrics interface so it can be imported elsewhere
export interface CalculatedUserMetrics {
  level: number;
  nextLevelXP: number;
  xpProgressPercentage: number;
  recentPerformance: number;
  overallRating: number;
  completionPercentage: number;
  pcpRanking: {
    tier: string;
    points: number;
    nextTierThreshold: number;
    progressPercentage: number;
    ratingContribution: number;
  };
}

// The DataCalculationService class will be declared at the end of the file
// after all functions are defined

interface ProfileFieldXpMap {
  [key: string]: number;
}

// XP awarded for completing various profile fields
const PROFILE_FIELD_XP: ProfileFieldXpMap = {
  // Personal Info - Basic fields (5 XP each)
  firstName: 5,
  lastName: 5,
  displayName: 5,
  location: 5,
  yearOfBirth: 5,
  bio: 10, // Bio is worth more as it's more detailed

  // Equipment fields (5 XP each)
  paddleBrand: 5,
  paddleModel: 5,
  backupPaddleBrand: 5,
  backupPaddleModel: 5,
  preferredBall: 5,

  // Playing Preferences (7 XP each - more gameplay relevant)
  playingFrequency: 7,
  preferredPlayFormat: 7,
  preferredPosition: 7,
  playStyle: 7,
  experienceYears: 7,
  skill: 7,

  // Physical attributes (5 XP each)
  height: 5,
  reach: 5,
  dominantHand: 5,

  // External Ratings (8 XP each - more complex info)
  duprRating: 8,
  utprRating: 8,
  wprRating: 8
};

// Threshold bonuses for profile completion
const COMPLETION_BONUS_THRESHOLDS = [
  { threshold: 25, bonus: 10 },  // 25% completion: +10 XP
  { threshold: 50, bonus: 15 },  // 50% completion: +15 XP
  { threshold: 75, bonus: 25 },  // 75% completion: +25 XP
  { threshold: 100, bonus: 50 }, // 100% completion: +50 XP
];

/**
 * Calculate the XP value for completing a specific profile field
 * 
 * @param fieldName - The name of the profile field
 * @returns The XP value for the field, or 0 if not defined
 */
export function calculateProfileFieldXp(fieldName: string): number {
  return PROFILE_FIELD_XP[fieldName] || 0;
}

/**
 * Calculate the total potential XP available from profile completion
 * 
 * @returns The total XP available, including field XP and bonuses
 */
export function calculateTotalPotentialProfileXp(): number {
  // Sum the XP values for all fields
  const fieldXp = Object.values(PROFILE_FIELD_XP).reduce((sum, xp) => sum + xp, 0);
  
  // Sum the XP bonuses for completion thresholds
  const bonusXp = COMPLETION_BONUS_THRESHOLDS.reduce((sum, threshold) => sum + threshold.bonus, 0);
  
  return fieldXp + bonusXp;
}

/**
 * Calculate the bonus XP for reaching a specific profile completion percentage
 * 
 * @param completionPercentage - The profile completion percentage (0-100)
 * @param previousPercentage - The previous completion percentage to avoid awarding bonuses twice
 * @returns The bonus XP to award
 */
export function calculateCompletionBonus(
  completionPercentage: number, 
  previousPercentage: number
): number {
  let bonus = 0;
  
  // Check if user has passed any thresholds since last update
  for (const { threshold, bonus: xpBonus } of COMPLETION_BONUS_THRESHOLDS) {
    if (completionPercentage >= threshold && previousPercentage < threshold) {
      bonus += xpBonus;
    }
  }
  
  return bonus;
}

/**
 * Calculate profile completion percentage based on filled fields
 * 
 * @param user - User data object
 * @returns The profile completion percentage (0-100)
 */
export function calculateProfileCompletionPercentage(user: EnhancedUser): number {
  if (!user) return 0;
  
  const allFields = Object.keys(PROFILE_FIELD_XP);
  const filledFields = allFields.filter(field => {
    const value = user[field as keyof EnhancedUser];
    return value !== null && value !== undefined && value !== '';
  });
  
  return Math.round((filledFields.length / allFields.length) * 100);
}

/**
 * Record a profile field completion and potentially award XP
 * This is part of the frontend-first approach where we calculate locally,
 * then sync with the server.
 * 
 * @param userId - User ID
 * @param fieldName - The name of the field completed
 * @param isFirstTimeCompletion - Whether this is the first time completing this field
 * @param completionPercentage - Current profile completion percentage 
 * @param previousPercentage - Previous profile completion percentage
 * @returns Promise with XP awarded information
 */
export async function recordProfileFieldCompletion(
  userId: number,
  fieldName: string,
  isFirstTimeCompletion: boolean,
  completionPercentage: number,
  previousPercentage: number
): Promise<{ success: boolean; xpAwarded: number; message: string }> {
  try {
    // Only award XP for first-time completions
    if (!isFirstTimeCompletion) {
      return { success: true, xpAwarded: 0, message: "Field already completed" };
    }
    
    // Calculate the XP to award
    const fieldXp = calculateProfileFieldXp(fieldName);
    let totalXp = fieldXp;
    
    // Check for completion bonuses
    const bonusXp = calculateCompletionBonus(completionPercentage, previousPercentage);
    totalXp += bonusXp;
    
    if (totalXp > 0) {
      // Record field completion on the server
      const response = await apiRequest("POST", "/api/profile/field-completion", {
        fieldName,
        fieldType: "profile",
        xpAwarded: totalXp
      });
      
      const data = await response.json();
      
      return {
        success: true,
        xpAwarded: totalXp,
        message: bonusXp > 0 
          ? `You earned ${fieldXp} XP for filling out this field and a bonus ${bonusXp} XP for reaching ${completionPercentage}% completion!`
          : `You earned ${fieldXp} XP for filling out this field!`
      };
    }
    
    return { success: true, xpAwarded: 0, message: "No XP awarded" };
  } catch (error) {
    console.error("Error recording profile field completion:", error);
    return {
      success: false,
      xpAwarded: 0,
      message: "Failed to record completion"
    };
  }
}

/**
 * Calculate the user's overall CourtIQ Rating based on various performance metrics
 * 
 * @param user - User data object
 * @returns Overall rating number (typically in the range of 1000-5000)
 */
export function calculateOverallRating(user: EnhancedUser): number {
  if (!user) return 1000; // Default base rating
  
  // Start with base rating
  let rating = 1000;
  
  // Add contribution from matches played
  if (user.totalMatches) {
    rating += Math.min(user.totalMatches * 50, 500); // Max 500 points from match count
  }
  
  // Add contribution from win percentage
  if (user.totalMatches && user.matchesWon) {
    const winRate = (user.matchesWon / user.totalMatches) * 100;
    rating += Math.min(winRate * 10, 500); // Max 500 points from win rate
  }
  
  // Add contribution from external ratings (if available)
  if (user.duprRating) {
    rating += user.duprRating * 200; // DUPR rating (typically 2.0-6.0) converted to points
  }
  
  // Add contribution from XP
  if (user.xp) {
    rating += Math.min(user.xp, 1000); // Max 1000 points from XP
  }
  
  // Add contribution from profile completion
  const completionPercentage = calculateProfileCompletionPercentage(user);
  rating += completionPercentage * 5; // Max 500 points from 100% completion
  
  return Math.round(rating);
}

// Export the DataCalculationService class for compatibility with existing code
// Define this at the end after all functions are defined to avoid reference errors
export class DataCalculationService {
  // Static methods that mirror the exported functions
  static calculateProfileFieldXp = calculateProfileFieldXp;
  static calculateTotalPotentialProfileXp = calculateTotalPotentialProfileXp;
  static calculateCompletionBonus = calculateCompletionBonus;
  static calculateProfileCompletionPercentage = calculateProfileCompletionPercentage;
  static recordProfileFieldCompletion = recordProfileFieldCompletion;
  static calculateOverallRating = calculateOverallRating;
}