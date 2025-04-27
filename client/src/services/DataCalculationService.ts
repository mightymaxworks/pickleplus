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
// CourtIQ dimension types
export type CourtIQDimension = "TECH" | "TACT" | "PHYS" | "MENT" | "CONS";

// CourtIQ dimension ratings result
export interface DimensionRatings {
  TECH: number;
  TACT: number;
  PHYS: number;
  MENT: number;
  CONS: number;
  // The overall aggregate rating
  overall: number;
}

// PCP tier types
export type PCPTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master";

// PCP tier thresholds
export const PCP_TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 1000,
  Gold: 2500,
  Platinum: 5000,
  Diamond: 10000,
  Master: 25000
};

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

/**
 * Calculate detailed CourtIQ™ dimension ratings for a user
 * This breaks down the overall rating into the five dimensions:
 * Technical, Tactical, Physical, Mental, and Consistency
 * 
 * @param user - User data object
 * @returns Object with ratings for each dimension and overall
 */
export function calculateDimensionRatings(user: EnhancedUser): DimensionRatings {
  if (!user) {
    // Default empty ratings
    return {
      TECH: 2.0,
      TACT: 2.0,
      PHYS: 2.0,
      MENT: 2.0,
      CONS: 2.0,
      overall: 1000
    };
  }
  
  // Use existing CourtIQ ratings if available from the API
  if (user.courtIQ) {
    return {
      TECH: user.courtIQ.technical || 2.0,
      TACT: user.courtIQ.tactical || 2.0,
      PHYS: user.courtIQ.physical || 2.0, 
      MENT: user.courtIQ.mental || 2.0,
      CONS: user.courtIQ.consistency || 2.0,
      overall: calculateOverallRating(user)
    };
  }
  
  // Calculate ratings based on available data if no API ratings
  // Base all dimensions at 2.0 (beginner level)
  const baseDimensionRating = 2.0;
  
  // Technical: influenced by external ratings and playing experience
  let technical = baseDimensionRating;
  if (user.duprRating) {
    technical = Math.max(technical, user.duprRating * 0.8);
  }
  if (user.playingSince) {
    // Longer experience slightly improves technical rating
    // Calculate years of experience based on playingSince (e.g., "2023")
    const currentYear = new Date().getFullYear();
    const startYear = parseInt(user.playingSince);
    if (!isNaN(startYear)) {
      const yearsOfExperience = currentYear - startYear;
      technical += Math.min(yearsOfExperience * 0.1, 0.5);
    }
  }
  
  // Tactical: influenced by match win rate and experience
  let tactical = baseDimensionRating;
  if (user.totalMatches && user.matchesWon) {
    const winRate = user.matchesWon / user.totalMatches;
    tactical += winRate * 2; // Win rate of 50% adds 1.0 to tactical
  }
  
  // Physical: influenced by height, reach, and playing frequency
  let physical = baseDimensionRating;
  if (user.height && user.reach) {
    // Slightly adjust for physical attributes
    physical += 0.3;
  }
  
  // Mental: influenced by close matches and consistency
  let mental = baseDimensionRating;
  if (user.totalMatches && user.totalMatches > 5) {
    // More matches implies more mental experience
    mental += 0.5;
  }
  
  // Consistency: influenced by match history and playing frequency
  let consistency = baseDimensionRating;
  if (user.playingFrequency === 'daily' || user.playingFrequency === 'several_times_week') {
    consistency += 0.7;
  } else if (user.playingFrequency === 'weekly') {
    consistency += 0.4;
  }
  
  // Cap all ratings between 1.0 and 5.0
  const capRating = (rating: number): number => Math.min(5.0, Math.max(1.0, rating));
  
  return {
    TECH: capRating(technical),
    TACT: capRating(tactical),
    PHYS: capRating(physical),
    MENT: capRating(mental),
    CONS: capRating(consistency),
    overall: calculateOverallRating(user)
  };
}

/**
 * Calculate the rating tier based on the overall rating
 */
function calculateRatingTier(overallRating: number): string {
  if (overallRating >= 4.5) {
    return "Elite";
  } else if (overallRating >= 4.0) {
    return "Expert";
  } else if (overallRating >= 3.5) {
    return "Advanced";
  } else if (overallRating >= 3.0) {
    return "Intermediate";
  } else if (overallRating >= 2.0) {
    return "Developing";
  } else {
    return "Beginner";
  }
}

/**
 * Calculate PCP (Pickle Community Points) ranking information
 * @param points - The user's current PCP points
 * @returns Object with tier, points, next tier threshold, progress percentage and rating contribution
 */
function calculatePCPRanking(points: number) {
  // Default to Bronze tier
  let tier: PCPTier = "Bronze";
  let nextTierThreshold = PCP_TIER_THRESHOLDS.Silver;
  
  // Determine current tier and next tier threshold
  if (points >= PCP_TIER_THRESHOLDS.Master) {
    tier = "Master";
    nextTierThreshold = PCP_TIER_THRESHOLDS.Master;
  } else if (points >= PCP_TIER_THRESHOLDS.Diamond) {
    tier = "Diamond";
    nextTierThreshold = PCP_TIER_THRESHOLDS.Master;
  } else if (points >= PCP_TIER_THRESHOLDS.Platinum) {
    tier = "Platinum";
    nextTierThreshold = PCP_TIER_THRESHOLDS.Diamond;
  } else if (points >= PCP_TIER_THRESHOLDS.Gold) {
    tier = "Gold";
    nextTierThreshold = PCP_TIER_THRESHOLDS.Platinum;
  } else if (points >= PCP_TIER_THRESHOLDS.Silver) {
    tier = "Silver";
    nextTierThreshold = PCP_TIER_THRESHOLDS.Gold;
  }
  
  // Calculate progress percentage to next tier
  let progressPercentage = 100;
  if (tier !== "Master") {
    const currentTierThreshold = PCP_TIER_THRESHOLDS[tier];
    const pointsToNextTier = nextTierThreshold - currentTierThreshold;
    const pointsEarnedInCurrentTier = points - currentTierThreshold;
    progressPercentage = Math.min(100, Math.round((pointsEarnedInCurrentTier / pointsToNextTier) * 100));
  }
  
  // Calculate rating contribution (max 500 points)
  const ratingContribution = Math.min(500, Math.floor(points / 50));
  
  return {
    tier,
    points,
    nextTierThreshold,
    progressPercentage,
    ratingContribution
  };
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
  static calculateDimensionRatings = calculateDimensionRatings;
  static calculateRatingTier = calculateRatingTier;
  static calculatePCPRanking = calculatePCPRanking;
}