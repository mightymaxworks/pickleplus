/**
 * Tier-Based Ranking Rules System
 * 
 * This module implements the tier-specific rules for the CourtIQ™ Rating System
 * Based on Sprint PKL-278651-RATE-0003-TIR
 * 
 * The tier rules define behavior such as:
 * - Different point gain/loss rules based on player tiers
 * - Protection mechanics to prevent dramatic rating drops
 * - Tier-specific requirements for maintaining status
 * - Special bonus opportunities based on tier
 */

import { db } from "../../db";
import { eq, and, sql } from "drizzle-orm";
import { users } from "../../../shared/schema";
import {
  ratingTiers,
  playerRatings,
  ratingProtections
} from "../../../shared/courtiq-schema";
import { 
  CompetitiveTier, 
  EventTier, 
  MatchType 
} from "../ranking/rankingSystem";
import { Format, Division } from "./ratingSystem";

// Tier-based point loss settings
export interface TierPointLossRules {
  allowPointLoss: boolean;         // Whether losing results in point loss
  pointLossMultiplier: number;     // Multiplier for point loss (0.0 = no loss, 1.0 = full loss)
  maxPointLossPerMatch: number;    // Maximum points that can be lost in a single match
  protectionActivationThreshold: number; // How many consecutive losses to activate protection
  requiresMinimumMatches: boolean; // Whether a minimum number of matches is required to maintain status
  minimumMatchesPerMonth: number;  // Required matches per month to maintain status
  gracePeriodDays: number;         // Grace period before tier demotion due to inactivity
}

// Tier-based growth opportunity settings
export interface TierGrowthRules {
  bonusPointsForConsistency: number;     // Bonus for playing consistently
  bonusMultiplierForUpsets: number;      // Multiplier for beating higher-rated players
  fastTrackMultiplier: number;           // Fast-track multiplier for underrated players
  coachingBonusPercentage: number;       // Bonus for coaching sessions
  streakBonusThreshold: number;          // Win streak required for bonus
  streakBonusPoints: number;             // Points awarded for achieving streak
  tournamentPerformanceMultiplier: number; // Multiplier for tournament performance
}

// Combined tier rules
export interface TierRules {
  tier: string;                // Tier name
  displayName: string;         // Display name for the tier
  minRating: number;           // Minimum rating for this tier
  maxRating: number;           // Maximum rating for this tier
  description: string;         // Description of tier rules
  colorCode: string;           // Color for UI display
  pointLoss: TierPointLossRules;   // Point loss rules
  growth: TierGrowthRules;         // Growth opportunity rules
  order: number;                   // Sort order (1 = lowest, 10 = highest)
}

/**
 * Default tier rules for the CourtIQ™ Rating System
 * These are used if no custom configuration is found in the database
 */
export const DEFAULT_TIER_RULES: Record<string, TierRules> = {
  // Elite Tier (8.1-9.0)
  "Tournament Titan": {
    tier: "Tournament Titan",
    displayName: "Tournament Titan",
    minRating: 2800,
    maxRating: 3000,
    description: "Elite level play with high stakes competition",
    colorCode: "#9b59b6", // Purple
    pointLoss: {
      allowPointLoss: true,
      pointLossMultiplier: 1.0,
      maxPointLossPerMatch: 50,
      protectionActivationThreshold: 3,
      requiresMinimumMatches: true,
      minimumMatchesPerMonth: 8,
      gracePeriodDays: 15
    },
    growth: {
      bonusPointsForConsistency: 10,
      bonusMultiplierForUpsets: 1.5,
      fastTrackMultiplier: 1.0,
      coachingBonusPercentage: 5,
      streakBonusThreshold: 10,
      streakBonusPoints: 50,
      tournamentPerformanceMultiplier: 1.5
    },
    order: 10
  },
  
  // Elite Tier (8.1-9.0)
  "Pickleball Prophet": {
    tier: "Pickleball Prophet",
    displayName: "Pickleball Prophet",
    minRating: 2600,
    maxRating: 2799,
    description: "Advanced play with significant stakes",
    colorCode: "#f1c40f", // Yellow
    pointLoss: {
      allowPointLoss: true,
      pointLossMultiplier: 0.9,
      maxPointLossPerMatch: 40,
      protectionActivationThreshold: 3,
      requiresMinimumMatches: true,
      minimumMatchesPerMonth: 6,
      gracePeriodDays: 20
    },
    growth: {
      bonusPointsForConsistency: 8,
      bonusMultiplierForUpsets: 1.4,
      fastTrackMultiplier: 1.1,
      coachingBonusPercentage: 7,
      streakBonusThreshold: 8,
      streakBonusPoints: 40,
      tournamentPerformanceMultiplier: 1.4
    },
    order: 9
  },
  
  // Advanced+ Tier (7.2-8.0)
  "Dink Destroyer": {
    tier: "Dink Destroyer",
    displayName: "Dink Destroyer",
    minRating: 2400,
    maxRating: 2599,
    description: "High-level play with competitive stakes",
    colorCode: "#e67e22", // Orange
    pointLoss: {
      allowPointLoss: true,
      pointLossMultiplier: 0.75,
      maxPointLossPerMatch: 30,
      protectionActivationThreshold: 4,
      requiresMinimumMatches: true,
      minimumMatchesPerMonth: 5,
      gracePeriodDays: 25
    },
    growth: {
      bonusPointsForConsistency: 7,
      bonusMultiplierForUpsets: 1.3,
      fastTrackMultiplier: 1.2,
      coachingBonusPercentage: 10,
      streakBonusThreshold: 7,
      streakBonusPoints: 35,
      tournamentPerformanceMultiplier: 1.3
    },
    order: 8
  },
  
  // Advanced Tier (7.2-8.0)
  "Smash Master": {
    tier: "Smash Master",
    displayName: "Smash Master",
    minRating: 2200,
    maxRating: 2399,
    description: "Advanced play with some competitive pressure",
    colorCode: "#e74c3c", // Red
    pointLoss: {
      allowPointLoss: true,
      pointLossMultiplier: 0.6,
      maxPointLossPerMatch: 25,
      protectionActivationThreshold: 4,
      requiresMinimumMatches: true,
      minimumMatchesPerMonth: 4,
      gracePeriodDays: 30
    },
    growth: {
      bonusPointsForConsistency: 6,
      bonusMultiplierForUpsets: 1.25,
      fastTrackMultiplier: 1.25,
      coachingBonusPercentage: 12,
      streakBonusThreshold: 6,
      streakBonusPoints: 30,
      tournamentPerformanceMultiplier: 1.25
    },
    order: 7
  },
  
  // Intermediate+ Tier (6.3-7.1)
  "Court Commander": {
    tier: "Court Commander",
    displayName: "Court Commander",
    minRating: 2000,
    maxRating: 2199,
    description: "Strong intermediate play with development focus",
    colorCode: "#3498db", // Blue
    pointLoss: {
      allowPointLoss: true,
      pointLossMultiplier: 0.4,
      maxPointLossPerMatch: 20,
      protectionActivationThreshold: 5,
      requiresMinimumMatches: false,
      minimumMatchesPerMonth: 3,
      gracePeriodDays: 35
    },
    growth: {
      bonusPointsForConsistency: 5,
      bonusMultiplierForUpsets: 1.2,
      fastTrackMultiplier: 1.3,
      coachingBonusPercentage: 15,
      streakBonusThreshold: 5,
      streakBonusPoints: 25,
      tournamentPerformanceMultiplier: 1.2
    },
    order: 6
  },
  
  // Intermediate Tier (5.4-6.2)
  "Volley Veteran": {
    tier: "Volley Veteran",
    displayName: "Volley Veteran",
    minRating: 1750,
    maxRating: 1999,
    description: "Intermediate play with minimal pressure",
    colorCode: "#2196F3", // Blue
    pointLoss: {
      allowPointLoss: false,
      pointLossMultiplier: 0.0,
      maxPointLossPerMatch: 0,
      protectionActivationThreshold: 999,
      requiresMinimumMatches: false,
      minimumMatchesPerMonth: 0,
      gracePeriodDays: 45
    },
    growth: {
      bonusPointsForConsistency: 4,
      bonusMultiplierForUpsets: 1.15,
      fastTrackMultiplier: 1.4,
      coachingBonusPercentage: 20,
      streakBonusThreshold: 4,
      streakBonusPoints: 20,
      tournamentPerformanceMultiplier: 1.15
    },
    order: 5
  },
  
  // Intermediate- Tier (4.5-5.3)
  "Kitchen Keeper": {
    tier: "Kitchen Keeper",
    displayName: "Kitchen Keeper",
    minRating: 1500,
    maxRating: 1749,
    description: "Developing intermediate play with learning focus",
    colorCode: "#4CAF50", // Green
    pointLoss: {
      allowPointLoss: false,
      pointLossMultiplier: 0.0,
      maxPointLossPerMatch: 0,
      protectionActivationThreshold: 999,
      requiresMinimumMatches: false,
      minimumMatchesPerMonth: 0,
      gracePeriodDays: 60
    },
    growth: {
      bonusPointsForConsistency: 3,
      bonusMultiplierForUpsets: 1.1,
      fastTrackMultiplier: 1.5,
      coachingBonusPercentage: 25,
      streakBonusThreshold: 3,
      streakBonusPoints: 15,
      tournamentPerformanceMultiplier: 1.1
    },
    order: 4
  },
  
  // Beginner+ Tier (2.7-4.4)
  "Rally Rookie": {
    tier: "Rally Rookie",
    displayName: "Rally Rookie",
    minRating: 1250,
    maxRating: 1499,
    description: "Active beginner focused on skill development",
    colorCode: "#8BC34A", // Light Green
    pointLoss: {
      allowPointLoss: false,
      pointLossMultiplier: 0.0,
      maxPointLossPerMatch: 0,
      protectionActivationThreshold: 999,
      requiresMinimumMatches: false,
      minimumMatchesPerMonth: 0,
      gracePeriodDays: 90
    },
    growth: {
      bonusPointsForConsistency: 2,
      bonusMultiplierForUpsets: 1.05,
      fastTrackMultiplier: 2.0,
      coachingBonusPercentage: 30,
      streakBonusThreshold: 2,
      streakBonusPoints: 10,
      tournamentPerformanceMultiplier: 1.05
    },
    order: 3
  },
  
  // Beginner Tier (0-2.6)
  "Dink Dabbler": {
    tier: "Dink Dabbler",
    displayName: "Dink Dabbler",
    minRating: 1000,
    maxRating: 1249,
    description: "Beginning player learning the basics",
    colorCode: "#8D99AE", // Slate Gray
    pointLoss: {
      allowPointLoss: false,
      pointLossMultiplier: 0.0,
      maxPointLossPerMatch: 0,
      protectionActivationThreshold: 999,
      requiresMinimumMatches: false,
      minimumMatchesPerMonth: 0,
      gracePeriodDays: 120
    },
    growth: {
      bonusPointsForConsistency: 1,
      bonusMultiplierForUpsets: 1.0,
      fastTrackMultiplier: 2.5,
      coachingBonusPercentage: 50,
      streakBonusThreshold: 2,
      streakBonusPoints: 5,
      tournamentPerformanceMultiplier: 1.0
    },
    order: 2
  }
};

/**
 * TierRulesSystem class
 * Handles tier-specific ranking rules and protection mechanics
 */
export class TierRulesSystem {
  constructor() {}
  
  /**
   * Initialize tier rules in the database
   * This should be called during system setup
   */
  async initializeTierRulesInDatabase(): Promise<void> {
    // Implement in future release if needed
    // For now, we're using the DEFAULT_TIER_RULES constant
  }
  
  /**
   * Get tier rules for a specific tier
   * @param tierName Tier name to get rules for
   * @returns The tier rules or null if not found
   */
  async getTierRules(tierName: string): Promise<TierRules | null> {
    // For now, use the default rules
    return DEFAULT_TIER_RULES[tierName] || null;
  }
  
  /**
   * Get tier rules for a player based on their current rating
   * @param userId User ID to get tier rules for
   * @param division Division to check
   * @param format Format to check
   * @returns The tier rules or null if not found
   */
  async getTierRulesForPlayer(
    userId: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES
  ): Promise<TierRules | null> {
    // Get player's current rating and tier
    const playerRating = await db.query.playerRatings.findFirst({
      where: and(
        eq(playerRatings.userId, userId),
        eq(playerRatings.division, division),
        eq(playerRatings.format, format)
      )
    });
    
    if (!playerRating) {
      return null;
    }
    
    // Get the tier rules
    return this.getTierRules(playerRating.tier);
  }
  
  /**
   * Apply tier-specific point calculation modifiers
   * @param userId User ID
   * @param basePoints Base points from standard calculation
   * @param isWinner Whether the user won the match
   * @param division Division
   * @param format Format
   * @param matchType Match type
   * @param eventTier Event tier
   * @param opponentRating Opponent's rating (for upset calculations)
   * @returns Modified points after applying tier rules
   */
  async applyTierRules(
    userId: number,
    basePoints: number,
    isWinner: boolean,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    matchType: MatchType = MatchType.CASUAL,
    eventTier: EventTier = EventTier.LOCAL,
    opponentRating?: number
  ): Promise<{
    modifiedPoints: number;
    explanation: string[];
    appliedRules: string[];
  }> {
    // Get tier rules for player
    const tierRules = await this.getTierRulesForPlayer(userId, division, format);
    
    if (!tierRules) {
      return {
        modifiedPoints: basePoints,
        explanation: ["Standard point calculation applied (no tier rules found)"],
        appliedRules: []
      };
    }
    
    let finalPoints = basePoints;
    const explanation: string[] = [];
    const appliedRules: string[] = [];
    
    // Handle point loss for losses
    if (!isWinner && tierRules.pointLoss.allowPointLoss) {
      const pointLoss = Math.min(
        basePoints * tierRules.pointLoss.pointLossMultiplier,
        tierRules.pointLoss.maxPointLossPerMatch
      );
      
      finalPoints = -pointLoss;
      explanation.push(`Applied ${tierRules.displayName} tier point loss rule: ${pointLoss} points`);
      appliedRules.push("tier_point_loss");
      
      // Check if player has loss protection
      const hasProtection = await this.checkPlayerLossProtection(userId, division, format);
      if (hasProtection) {
        finalPoints = 0;
        explanation.push("Loss protection activated: no points lost");
        appliedRules.push("loss_protection");
      }
    }
    
    // Apply win streak bonus if applicable
    if (isWinner) {
      const streakBonus = await this.checkAndApplyStreakBonus(userId, tierRules, division, format);
      if (streakBonus > 0) {
        finalPoints += streakBonus;
        explanation.push(`Win streak bonus: +${streakBonus} points`);
        appliedRules.push("win_streak_bonus");
      }
      
      // Apply upset bonus if opponent rating is significantly higher
      if (opponentRating && opponentRating > 0) {
        const playerRating = await this.getPlayerRating(userId, division, format);
        if (playerRating && opponentRating > playerRating + 100) {
          const upsetBonus = Math.round(basePoints * (tierRules.growth.bonusMultiplierForUpsets - 1));
          finalPoints += upsetBonus;
          explanation.push(`Upset bonus for beating higher-rated player: +${upsetBonus} points`);
          appliedRules.push("upset_bonus");
        }
      }
      
      // Apply tournament performance multiplier
      if (matchType === MatchType.TOURNAMENT && eventTier !== EventTier.LOCAL) {
        const tournamentBonus = Math.round(basePoints * (tierRules.growth.tournamentPerformanceMultiplier - 1));
        finalPoints += tournamentBonus;
        explanation.push(`Tournament performance bonus: +${tournamentBonus} points`);
        appliedRules.push("tournament_bonus");
      }
      
      // Apply fast track multiplier for underrated players
      if (await this.isPlayerUnderrated(userId, division, format)) {
        const fastTrackBonus = Math.round(basePoints * (tierRules.growth.fastTrackMultiplier - 1));
        finalPoints += fastTrackBonus;
        explanation.push(`Fast track bonus for underrated player: +${fastTrackBonus} points`);
        appliedRules.push("fast_track_bonus");
      }
    }
    
    // Apply consistency bonus for players who meet the minimum matches per month
    if (await this.playerMeetsActivityRequirements(userId, tierRules, division, format)) {
      finalPoints += tierRules.growth.bonusPointsForConsistency;
      explanation.push(`Consistency bonus: +${tierRules.growth.bonusPointsForConsistency} points`);
      appliedRules.push("consistency_bonus");
    }
    
    return {
      modifiedPoints: Math.round(finalPoints),
      explanation,
      appliedRules
    };
  }
  
  /**
   * Get player's current rating
   * @param userId User ID
   * @param division Division
   * @param format Format
   * @returns Player's rating or null if not found
   */
  private async getPlayerRating(
    userId: number,
    division: Division,
    format: Format
  ): Promise<number | null> {
    const playerRating = await db.query.playerRatings.findFirst({
      where: and(
        eq(playerRatings.userId, userId),
        eq(playerRatings.division, division),
        eq(playerRatings.format, format)
      )
    });
    
    return playerRating ? playerRating.rating : null;
  }
  
  /**
   * Check if a player has active loss protection
   * @param userId User ID to check
   * @param division Division to check
   * @param format Format to check
   * @returns True if player has loss protection, false otherwise
   */
  private async checkPlayerLossProtection(
    userId: number,
    division: Division,
    format: Format
  ): Promise<boolean> {
    // Check for active rating protection
    const protection = await db.query.ratingProtections.findFirst({
      where: and(
        eq(ratingProtections.userId, userId),
        eq(ratingProtections.protectionType, "streak_breaker"),
        sql`remaining_uses > 0`,
        sql`expiration_date > NOW()`
      )
    });
    
    return protection !== undefined;
  }
  
  /**
   * Check if a player is likely underrated based on win pattern
   * @param userId User ID to check
   * @param division Division to check
   * @param format Format to check
   * @returns True if player is underrated, false otherwise
   */
  private async isPlayerUnderrated(
    userId: number,
    division: Division,
    format: Format
  ): Promise<boolean> {
    // For the MVP, we'll use a simplified check:
    // A player is considered underrated if their win ratio is > 75% in their last 8 matches
    const matchesPlayed = await db.execute<{ total: number, wins: number }>(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN winner_id = ${userId} THEN 1 ELSE 0 END) as wins
      FROM matches
      WHERE (player1_id = ${userId} OR player2_id = ${userId})
        AND division = ${division}
        AND format = ${format}
      ORDER BY created_at DESC
      LIMIT 8
    `);
    
    if (!matchesPlayed[0] || matchesPlayed[0].total < 4) {
      return false; // Not enough data
    }
    
    const winRatio = matchesPlayed[0].wins / matchesPlayed[0].total;
    return winRatio > 0.75;
  }
  
  /**
   * Check if player meets activity requirements for tier
   * @param userId User ID to check
   * @param tierRules Tier rules to check against
   * @param division Division to check
   * @param format Format to check
   * @returns True if player meets requirements, false otherwise
   */
  private async playerMeetsActivityRequirements(
    userId: number,
    tierRules: TierRules,
    division: Division,
    format: Format
  ): Promise<boolean> {
    if (!tierRules.pointLoss.requiresMinimumMatches) {
      return true; // No requirements
    }
    
    // Check matches played in the last 30 days
    const matchesPlayed = await db.execute<{ count: number }>(sql`
      SELECT COUNT(*) as count
      FROM matches
      WHERE (player1_id = ${userId} OR player2_id = ${userId})
        AND division = ${division}
        AND format = ${format}
        AND created_at > NOW() - INTERVAL '30 days'
    `);
    
    return matchesPlayed[0] && matchesPlayed[0].count >= tierRules.pointLoss.minimumMatchesPerMonth;
  }
  
  /**
   * Check for and apply win streak bonus if applicable
   * @param userId User ID to check
   * @param tierRules Tier rules to check against
   * @param division Division to check
   * @param format Format to check
   * @returns Bonus points for streak or 0 if no streak
   */
  private async checkAndApplyStreakBonus(
    userId: number,
    tierRules: TierRules,
    division: Division,
    format: Format
  ): Promise<number> {
    // Check current win streak
    const matches = await db.execute<{ winner_id: number }>(sql`
      SELECT winner_id
      FROM matches
      WHERE (player1_id = ${userId} OR player2_id = ${userId})
        AND division = ${division}
        AND format = ${format}
      ORDER BY created_at DESC
      LIMIT ${tierRules.growth.streakBonusThreshold}
    `);
    
    if (matches.length < tierRules.growth.streakBonusThreshold) {
      return 0; // Not enough matches played
    }
    
    // Check if all matches are wins
    const allWins = matches.every(match => match.winner_id === userId);
    
    return allWins ? tierRules.growth.streakBonusPoints : 0;
  }
}

// Create singleton instance
export const tierRulesSystem = new TierRulesSystem();