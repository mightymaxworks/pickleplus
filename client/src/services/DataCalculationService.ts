/**
 * PKL-278651-PROF-0007-SERV - Data Calculation Service
 * 
 * This service handles all CourtIQ metrics calculations and user performance analytics
 * with frontend-first implementation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { EnhancedUser } from "@/types/enhanced-user";
import { getLevelInfo } from "@/lib/calculateLevel";

// Court IQ dimension codes
export type CourtIQDimension = "TECH" | "TACT" | "PHYS" | "MENT" | "CONS";

// CourtIQ metrics interface
export interface CourtIQMetrics {
  technical: number;    // Technical Skills
  tactical: number;     // Tactical Awareness
  physical: number;     // Physical Fitness
  mental: number;       // Mental Toughness
  consistency: number;  // Consistency
}

// Calculated user metrics from DataCalculationService
export interface CalculatedUserMetrics {
  level: number;
  nextLevelXP: number;
  xpProgressPercentage: number;
  recentPerformance: number;
  overallRating: number;
  ratingTier?: string;
  masteryLevel?: string;
  dimensionRatings?: CourtIQMetrics;
  completionPercentage: number;
}

// Rating system types
export type RatingSystem = "COURTIQ" | "DUPR" | "UTPR" | "WPR";

// Dimension weight configuration
const DIMENSION_WEIGHTS = {
  TECH: 0.25,  // Technical Skills: 25%
  TACT: 0.25,  // Tactical Awareness: 25%
  PHYS: 0.15,  // Physical Fitness: 15%
  MENT: 0.20,  // Mental Toughness: 20%
  CONS: 0.15   // Consistency: 15%
};

// Protection thresholds for ratings
const RATING_PROTECTION = {
  MIN_MATCHES_FOR_ACCURATE: 5,
  BEGINNER_FLOOR: 1000,
  MIN_CHANGE_THRESHOLD: 25,
  VOLATILITY_DAMPENER: 0.8
};

/**
 * Converts a CourtIQ rating to the specified rating system
 * @param courtIQRating - The CourtIQ rating value (1000-3000 scale)
 * @param targetSystem - The target rating system
 * @returns The converted rating in the target system's scale
 */
export function convertRating(courtIQRating: number, targetSystem: RatingSystem): number {
  // Base CourtIQ scale is 1000-3000 where 2000 is advanced intermediate
  
  if (targetSystem === "COURTIQ") {
    return courtIQRating;
  }
  
  switch (targetSystem) {
    case "DUPR":
      // DUPR: 2.0-7.0 scale, increments of 0.25, 4.5 is advanced intermediate
      return 2.0 + ((courtIQRating - 1000) / 2000) * 5.0;
      
    case "UTPR":
      // UTPR: 1.0-6.5 scale, increments of 0.5, 4.0 is advanced intermediate  
      return 1.0 + ((courtIQRating - 1000) / 2000) * 5.5;
      
    case "WPR":
      // WPR: 1-10 scale, 6 is advanced intermediate
      return 1.0 + ((courtIQRating - 1000) / 2000) * 9.0;
      
    default:
      return courtIQRating;
  }
}

/**
 * Data Calculation Service for handling all metrics calculations
 */
export class DataCalculationService {
  /**
   * Calculate all user metrics based on user data
   * @param user - Enhanced user data
   * @returns Calculated metrics
   */
  calculateUserMetrics(user: EnhancedUser): CalculatedUserMetrics {
    // Calculate level info
    const levelInfo = getLevelInfo(user.xp);

    // Calculate rating tier
    const ratingTier = this.calculateRatingTier(this.calculateOverallRating(user));
    
    // Calculate dimension ratings from properties
    const dimensionRatings = this.calculateDimensionRatings(user);
    
    // Calculate recent performance trend
    const recentPerformance = user.totalMatches > 0 ? 
      this.calculatePerformanceTrend(user) : 0;
      
    // Calculate completion percentage
    const completionPercentage = user.profileCompletionPct || 
      this.calculateProfileCompletionPercentage(user);
      
    return {
      ...levelInfo,
      overallRating: this.calculateOverallRating(user),
      ratingTier,
      masteryLevel: this.calculateMasteryLevel(user),
      dimensionRatings,
      recentPerformance,
      completionPercentage
    };
  }
  
  /**
   * Calculate overall CourtIQ rating
   * @param user - User data
   * @returns Overall CourtIQ rating (1000-3000 scale)
   */
  calculateOverallRating(user: EnhancedUser): number {
    // If user has less than minimum matches, use baseline rating
    if (user.totalMatches < RATING_PROTECTION.MIN_MATCHES_FOR_ACCURATE) {
      return Math.max(RATING_PROTECTION.BEGINNER_FLOOR, 1200 + (user.xp * 0.5));
    }
    
    // Base rating from win rate and experience
    const winRate = user.totalMatches > 0 ? (user.matchesWon / user.totalMatches) : 0;
    let baseRating = 1000 + (winRate * 1000) + (Math.min(user.totalMatches, 100) * 5);
    
    // Adjust based on dimension ratings
    const dimensions = this.calculateDimensionRatings(user);
    if (dimensions) {
      const weightedSum = 
        dimensions.technical * DIMENSION_WEIGHTS.TECH +
        dimensions.tactical * DIMENSION_WEIGHTS.TACT +
        dimensions.physical * DIMENSION_WEIGHTS.PHYS +
        dimensions.mental * DIMENSION_WEIGHTS.MENT +
        dimensions.consistency * DIMENSION_WEIGHTS.CONS;
        
      // Scale from 1-5 dimension rating to points
      const dimensionBonus = ((weightedSum - 1) / 4) * 500;
      baseRating += dimensionBonus;
    }
    
    // Adjust based on tournament performance
    if (user.totalTournaments > 0) {
      baseRating += Math.min(user.totalTournaments * 25, 250);
    }
    
    // Apply ranking points
    if (user.rankingPoints > 0) {
      baseRating += Math.min(user.rankingPoints, 500);
    }
    
    // Cap at 3000
    return Math.min(3000, Math.round(baseRating));
  }
  
  /**
   * Calculate rating tier based on overall rating
   * @param rating - Overall CourtIQ rating
   * @returns Rating tier designation
   */
  calculateRatingTier(rating: number): string {
    if (rating >= 2800) return "Elite";
    if (rating >= 2600) return "Professional";
    if (rating >= 2400) return "Expert";
    if (rating >= 2200) return "Advanced";
    if (rating >= 2000) return "Advanced Intermediate";
    if (rating >= 1800) return "Intermediate";
    if (rating >= 1600) return "Intermediate Beginner";
    if (rating >= 1400) return "Developing";
    if (rating >= 1200) return "Beginner";
    return "Novice";
  }
  
  /**
   * Calculate mastery level based on overall progression
   * @param user - User data
   * @returns Mastery level designation
   */
  calculateMasteryLevel(user: EnhancedUser): string {
    // Use a combination of XP, matches played, and rating
    const xpFactor = Math.min(user.xp / 2000, 1); // Max at 2000 XP
    const matchesFactor = Math.min(user.totalMatches / 50, 1); // Max at 50 matches
    const ratingFactor = Math.min((this.calculateOverallRating(user) - 1000) / 1000, 1); // Max at 2000 rating
    
    // Calculate overall mastery score (0-100)
    const masteryScore = Math.round((xpFactor * 0.4 + matchesFactor * 0.3 + ratingFactor * 0.3) * 100);
    
    // Determine mastery level
    if (masteryScore >= 90) return "Grandmaster";
    if (masteryScore >= 80) return "Master";
    if (masteryScore >= 70) return "Diamond";
    if (masteryScore >= 60) return "Platinum";
    if (masteryScore >= 50) return "Gold";
    if (masteryScore >= 40) return "Silver";
    if (masteryScore >= 30) return "Bronze";
    if (masteryScore >= 20) return "Copper";
    if (masteryScore >= 10) return "Novice";
    return "Rookie";
  }
  
  /**
   * Calculate the individual dimension ratings
   * @param user - User data
   * @returns CourtIQ dimension metrics (1-5 scale)
   */
  calculateDimensionRatings(user: EnhancedUser): CourtIQMetrics {
    // Calculate ratings based on available user attributes
    // Each dimension is on a 1-5 scale
    
    // Technical rating from specific skills
    const technical = this.calculateAverageRating([
      user.forehandStrength,
      user.backhandStrength,
      user.servePower,
      user.dinkAccuracy
    ]);
    
    // Tactical based on performance
    const tactical = this.estimateTacticalRating(user);
    
    // Physical based on user attributes
    const physical = this.estimatePhysicalRating(user);
    
    // Mental toughness rating
    const mental = this.estimateMentalRating(user);
    
    // Consistency rating
    const consistency = this.estimateConsistencyRating(user);
    
    return {
      technical,
      tactical,
      physical,
      mental,
      consistency
    };
  }
  
  /**
   * Calculate average rating from available values
   * @param values - Array of rating values
   * @returns Average rating or default if no values available
   */
  private calculateAverageRating(values: (number | undefined)[]): number {
    const validValues = values.filter(val => val !== undefined) as number[];
    
    if (validValues.length === 0) {
      return 3.0; // Default middle value
    }
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return Number((sum / validValues.length).toFixed(1));
  }
  
  /**
   * Estimate tactical rating based on user performance
   * @param user - User data
   * @returns Estimated tactical rating (1-5 scale)
   */
  private estimateTacticalRating(user: EnhancedUser): number {
    // If we have an explicit rating, use it
    if (user.thirdShotConsistency !== undefined) {
      return Math.min(5, Math.max(1, user.thirdShotConsistency));
    }
    
    // Otherwise estimate from performance
    const baseRating = 3.0;
    
    // Adjust based on win rate if enough matches played
    let adjustment = 0;
    if (user.totalMatches >= 5) {
      const winRate = user.matchesWon / user.totalMatches;
      adjustment += (winRate - 0.5) * 2; // +1 for 100% win rate, -1 for 0% win rate
    }
    
    // Adjust based on tournament experience
    if (user.totalTournaments > 0) {
      adjustment += Math.min(user.totalTournaments / 10, 0.5);
    }
    
    // Clamp to 1-5 range and round to nearest decimal
    return Number(Math.min(5, Math.max(1, baseRating + adjustment)).toFixed(1));
  }
  
  /**
   * Estimate physical rating based on user attributes
   * @param user - User data
   * @returns Estimated physical rating (1-5 scale)
   */
  private estimatePhysicalRating(user: EnhancedUser): number {
    // If court coverage is provided, use it as base
    if (user.courtCoverage !== undefined) {
      return Math.min(5, Math.max(1, user.courtCoverage));
    }
    
    // Otherwise estimate from other factors
    const baseRating = 3.0;
    
    // Use total matches as an indicator of physical conditioning
    let adjustment = 0;
    if (user.totalMatches > 0) {
      adjustment += Math.min(user.totalMatches / 50, 0.5);
    }
    
    // Clamp to 1-5 range and round to nearest decimal
    return Number(Math.min(5, Math.max(1, baseRating + adjustment)).toFixed(1));
  }
  
  /**
   * Estimate mental rating based on user performance
   * @param user - User data
   * @returns Estimated mental rating (1-5 scale)
   */
  private estimateMentalRating(user: EnhancedUser): number {
    // Base mental rating
    const baseRating = 3.0;
    
    // Adjust based on win rate in tough matches
    let adjustment = 0;
    
    // Tournament experience suggests mental toughness
    if (user.totalTournaments > 0) {
      adjustment += Math.min(user.totalTournaments / 5, 0.5);
    }
    
    // Experiential attributes
    if (user.competitiveIntensity) {
      if (user.competitiveIntensity === "high") adjustment += 0.5;
      else if (user.competitiveIntensity === "low") adjustment -= 0.5;
    }
    
    // Clamp to 1-5 range and round to nearest decimal
    return Number(Math.min(5, Math.max(1, baseRating + adjustment)).toFixed(1));
  }
  
  /**
   * Estimate consistency rating based on user attributes
   * @param user - User data
   * @returns Estimated consistency rating (1-5 scale)
   */
  private estimateConsistencyRating(user: EnhancedUser): number {
    // Base consistency rating
    const baseRating = 3.0;
    
    // Experience suggests consistency
    let adjustment = 0;
    
    // More matches played indicates consistency
    if (user.totalMatches > 0) {
      adjustment += Math.min(user.totalMatches / 50, 0.5);
    }
    
    // Level progression suggests consistency
    if (user.level > 1) {
      adjustment += Math.min((user.level - 1) / 10, 0.5);
    }
    
    // Clamp to 1-5 range and round to nearest decimal
    return Number(Math.min(5, Math.max(1, baseRating + adjustment)).toFixed(1));
  }
  
  /**
   * Calculate recent performance trend
   * @param user - User data
   * @returns Performance trend percentage (-100 to 100)
   */
  calculatePerformanceTrend(user: EnhancedUser): number {
    // This would normally be calculated from match history
    // but for now we'll use a placeholder based on win rate
    
    if (user.totalMatches < 5) {
      return 0; // Not enough matches to determine trend
    }
    
    // Simulate a performance trend based on win rate
    // A win rate over 50% would be a positive trend
    const winRate = user.matchesWon / user.totalMatches;
    const trendPercentage = (winRate - 0.5) * 100;
    
    // Randomize slightly for realistic variance
    const variance = Math.random() * 10 - 5; // -5 to +5
    
    return Number((trendPercentage + variance).toFixed(1));
  }
  
  /**
   * Calculate profile completion percentage
   * @param user - User data
   * @returns Completion percentage (0-100)
   */
  calculateProfileCompletionPercentage(user: EnhancedUser): number {
    // Define required and optional fields to check
    const requiredFields: (keyof EnhancedUser)[] = [
      'username', 'email', 'displayName', 'avatarUrl'
    ];
    
    const optionalFields: (keyof EnhancedUser)[] = [
      'bio', 'location', 'yearOfBirth', 'paddleBrand', 
      'paddleModel', 'preferredPosition', 'forehandStrength',
      'backhandStrength', 'servePower', 'height', 'reach',
      'competitiveIntensity', 'playerGoals'
    ];
    
    // Calculate completion percentage
    const totalFields = requiredFields.length + optionalFields.length;
    let completedFields = 0;
    
    // Check required fields (higher weight)
    for (const field of requiredFields) {
      if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
        completedFields += 2; // Double weight for required fields
      }
    }
    
    // Check optional fields
    for (const field of optionalFields) {
      if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
        completedFields += 1;
      }
    }
    
    // Calculate percentage (required fields have double weight)
    const maxScore = (requiredFields.length * 2) + optionalFields.length;
    const percentage = Math.round((completedFields / maxScore) * 100);
    
    return Math.min(100, Math.max(0, percentage));
  }
  
  /**
   * Apply rating protection mechanics to ensure fair progression
   * @param currentRating - Current user rating
   * @param calculatedRating - New calculated rating
   * @param matchesPlayed - Total matches played
   * @returns Protected rating after applying protection mechanics
   */
  applyRatingProtection(
    currentRating: number,
    calculatedRating: number,
    matchesPlayed: number
  ): number {
    // If not enough matches, limit volatility
    if (matchesPlayed < RATING_PROTECTION.MIN_MATCHES_FOR_ACCURATE) {
      // Ensure new players don't drop below the beginner floor
      if (calculatedRating < RATING_PROTECTION.BEGINNER_FLOOR) {
        return RATING_PROTECTION.BEGINNER_FLOOR;
      }
      
      // Limit change magnitude for new players
      const change = calculatedRating - currentRating;
      if (Math.abs(change) > RATING_PROTECTION.MIN_CHANGE_THRESHOLD) {
        // Apply dampening factor to large changes
        const protectedChange = change * RATING_PROTECTION.VOLATILITY_DAMPENER;
        return currentRating + protectedChange;
      }
    }
    
    return calculatedRating;
  }
}