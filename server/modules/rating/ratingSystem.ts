/**
 * CourtIQ™ Rating System
 * 
 * This module handles the rating system for Pickle+, which tracks player skill levels
 * across different divisions (age groups) and formats (singles, doubles, mixed).
 * 
 * The rating system uses an ELO-based algorithm with adjustments specific to pickleball,
 * taking into account factors like:
 * - Match format (singles vs doubles)
 * - Player experience level (provisional vs established)
 * - Score differentials
 * - Tournament vs casual play
 * 
 * Ratings range from 1000 (beginner) to 2500 (professional level).
 */

import { db } from "../../db";
import { 
  eq, and, or, sql, desc, asc, gt, lt, gte, lte, 
  isNull, inArray, not, between
} from "drizzle-orm";
import { serverEventBus, ServerEvents } from "../../core/events/eventBus";
import { users } from "../../../shared/schema";
import { 
  playerRatings, 
  playerRatingConstraint,
  ratingHistory, 
  ratingTiers,
  PlayerRating,
  InsertPlayerRating,
  InsertRatingHistory,
  RatingTier
} from "../../../shared/courtiq-schema";
import { xpSystem } from "../xp/xpSystem";

// Export events that other modules can listen for
export const CourtIQEvents = {
  RATING_UPDATED: "courtiq.rating.updated" as const,
  RATING_INITIALIZED: "courtiq.rating.initialized" as const,
  TIER_CHANGED: "courtiq.rating.tier_changed" as const,
  CONFIDENCE_UPDATED: "courtiq.rating.confidence_updated" as const,
  SEASON_ENDED: "courtiq.rating.season_ended" as const
};

// Division types for age groups
export enum Division {
  OPEN = "19+",
  SENIORS_35 = "35+",
  SENIORS_50 = "50+",
  SENIORS_60 = "60+",
  SENIORS_70 = "70+"
}

// Format types for play styles
export enum Format {
  SINGLES = "singles",
  MENS_DOUBLES = "mens_doubles",
  WOMENS_DOUBLES = "womens_doubles",
  MIXED_DOUBLES = "mixed_doubles"
}

// K-factor configurations for different scenarios
// K-factor determines how much a rating changes after a match
interface KFactorConfig {
  provisionalMin: number;   // Minimum K for provisional players (less than 5 matches)
  provisionalMax: number;   // Maximum K for provisional players
  establishedMin: number;   // Minimum K for established players
  establishedMax: number;   // Maximum K for established players
  tournamentBonus: number;  // Additional K for tournament matches
}

// K-factor settings for different formats
const K_FACTORS: Record<Format, KFactorConfig> = {
  [Format.SINGLES]: {
    provisionalMin: 40,
    provisionalMax: 80,
    establishedMin: 16,
    establishedMax: 32,
    tournamentBonus: 8
  },
  [Format.MENS_DOUBLES]: {
    provisionalMin: 35,
    provisionalMax: 70,
    establishedMin: 12,
    establishedMax: 24,
    tournamentBonus: 6
  },
  [Format.WOMENS_DOUBLES]: {
    provisionalMin: 35,
    provisionalMax: 70,
    establishedMin: 12,
    establishedMax: 24,
    tournamentBonus: 6
  },
  [Format.MIXED_DOUBLES]: {
    provisionalMin: 35,
    provisionalMax: 70,
    establishedMin: 12,
    establishedMax: 24,
    tournamentBonus: 6
  }
};

// Match outcome multipliers based on score differential
// These adjust ELO calculations to better reflect dominance in a win
interface ScoreDifferentialMultiplier {
  threshold: number;  // Point differential threshold
  multiplier: number; // Multiplier to apply to ELO change
}

// Multipliers for different score differentials
const SCORE_MULTIPLIERS: ScoreDifferentialMultiplier[] = [
  { threshold: 1, multiplier: 1.0 },   // Very close match
  { threshold: 3, multiplier: 1.1 },   // Moderately close
  { threshold: 5, multiplier: 1.2 },   // Clear win
  { threshold: 8, multiplier: 1.3 },   // Dominant win
  { threshold: 11, multiplier: 1.5 }   // Complete blowout
];

export class RatingSystem {
  constructor() {}
  
  /**
   * Initialize the rating tiers in the database
   * This only needs to be called once during system setup
   */
  async initializeRatingTiersInDatabase(): Promise<void> {
    // Check if tiers already exist
    const existingTiers = await db.select({ count: sql<number>`count(*)` })
      .from(ratingTiers)
      .execute();
    
    if (existingTiers[0] && existingTiers[0].count > 0) {
      console.log(`Rating tiers already initialized (${existingTiers[0].count} tiers found)`);
      return;
    }
    
    // Define the 10 rating tiers
    const tiers = [
      {
        name: "Dink Dabbler",
        minRating: 1000,
        maxRating: 1249,
        color: "#8D99AE", // Slate Gray
        icon: "paddle-basic",
        description: "Just getting started with the basics of pickleball",
        order: 1
      },
      {
        name: "Rally Rookie",
        minRating: 1250,
        maxRating: 1499,
        color: "#8BC34A", // Light Green
        icon: "paddle-bronze",
        description: "Developing consistency in rallies and basic shot selection",
        order: 2
      },
      {
        name: "Kitchen Keeper",
        minRating: 1500,
        maxRating: 1749,
        color: "#4CAF50", // Green
        icon: "paddle-silver",
        description: "Comfortable at the kitchen line with good dink control",
        order: 3
      },
      {
        name: "Volley Veteran",
        minRating: 1750,
        maxRating: 1999,
        color: "#2196F3", // Blue
        icon: "paddle-gold",
        description: "Strong volleying ability and tactical awareness",
        order: 4
      },
      {
        name: "Spin Specialist",
        minRating: 2000,
        maxRating: 2149,
        color: "#3F51B5", // Indigo
        icon: "paddle-platinum",
        description: "Advanced shot variety with effective spin techniques",
        order: 5
      },
      {
        name: "Drop Shot Dynamo",
        minRating: 2150,
        maxRating: 2299,
        color: "#9C27B0", // Purple
        icon: "paddle-diamond",
        description: "Precision shot placement and excellent third-shot drops",
        order: 6
      },
      {
        name: "Smash Surgeon",
        minRating: 2300,
        maxRating: 2399,
        color: "#E91E63", // Pink
        icon: "paddle-ruby",
        description: "Powerful and precise offensive play with killer smashes",
        order: 7
      },
      {
        name: "Court Commander",
        minRating: 2400,
        maxRating: 2449,
        color: "#F44336", // Red
        icon: "paddle-emerald",
        description: "Controls the pace and flow of matches with strategic mastery",
        order: 8
      },
      {
        name: "Pickleball Pro",
        minRating: 2450,
        maxRating: 2499,
        color: "#FF9800", // Orange
        icon: "paddle-sapphire",
        description: "Tournament-level player with comprehensive skills",
        order: 9
      },
      {
        name: "Grandmaster",
        minRating: 2500,
        maxRating: 3000, // Cap at 3000 for system integrity
        color: "#540D6E", // Deep Purple
        icon: "paddle-legendary",
        description: "Elite player at the pinnacle of the sport",
        order: 10
      }
    ];
    
    // Insert all tiers into the database
    try {
      for (const tier of tiers) {
        await db.insert(ratingTiers).values({
          name: tier.name,
          minRating: tier.minRating,
          maxRating: tier.maxRating,
          color: tier.color,
          icon: tier.icon,
          description: tier.description,
          order: tier.order
        });
      }
      console.log(`Initialized ${tiers.length} rating tiers in the database`);
    } catch (error) {
      console.error("Error initializing rating tiers:", error);
      throw error;
    }
  }
  
  /**
   * Initialize a player's rating for a specific division and format
   * @param userId User ID
   * @param initialRating Starting rating (default 1000)
   * @param division Age division
   * @param format Play format
   */
  async initializePlayerRating(
    userId: number,
    initialRating: number = 1000,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES
  ): Promise<PlayerRating> {
    // Check if rating already exists for this division/format
    const existingRating = await db.query.playerRatings.findFirst({
      where: and(
        eq(playerRatings.userId, userId),
        eq(playerRatings.division, division),
        eq(playerRatings.format, format)
      )
    });
    
    if (existingRating) {
      return existingRating;
    }
    
    // Get the appropriate tier for this rating
    const tier = await this.getTierForRating(initialRating);
    
    // Create the new player rating using direct SQL
    const [newRating] = await db.execute<PlayerRating>(sql`
      INSERT INTO player_ratings (
        user_id, rating, tier, confidence_level, matches_played,
        division, format, is_provisional, season_high_rating, all_time_high_rating,
        created_at, updated_at
      ) VALUES (
        ${userId}, ${initialRating}, ${tier.name}, 0, 0,
        ${division}, ${format}, TRUE, ${initialRating}, ${initialRating},
        NOW(), NOW()
      )
      RETURNING *
    `);
    
    // Create initial rating history entry using direct SQL
    await db.execute(sql`
      INSERT INTO rating_history (
        player_rating_id, old_rating, new_rating, rating_change,
        reason, notes, created_at
      ) VALUES (
        ${newRating.id}, ${initialRating}, ${initialRating}, 0,
        'initial_rating', ${`Initial rating for ${format} in ${division} division`}, NOW()
      )
    `);
    
    // Fire event for rating initialization
    await serverEventBus.publish(CourtIQEvents.RATING_INITIALIZED, {
      userId,
      ratingId: newRating.id,
      rating: initialRating,
      division,
      format,
      tier: tier.name
    });
    
    return newRating;
  }
  
  /**
   * Get the appropriate tier for a rating value
   * @param rating Rating value
   */
  async getTierForRating(rating: number): Promise<RatingTier> {
    // Use direct SQL instead of the query builder to avoid Drizzle ORM issues
    const [tier] = await db.execute<RatingTier>(
      sql`SELECT * FROM rating_tiers WHERE min_rating <= ${rating} AND max_rating >= ${rating} LIMIT 1`
    );
    
    if (!tier) {
      // Fallback to lowest tier if no match (shouldn't happen with proper ranges)
      const [fallbackTier] = await db.execute<RatingTier>(
        sql`SELECT * FROM rating_tiers ORDER BY min_rating ASC LIMIT 1`
      );
      
      if (!fallbackTier) {
        throw new Error("No rating tiers found in the database");
      }
      
      return fallbackTier;
    }
    
    return tier;
  }
  
  /**
   * Calculate new ratings for a match between two players/teams
   * @param winnerIds IDs of winning player(s) [1 for singles, 2 for doubles]
   * @param loserIds IDs of losing player(s) [1 for singles, 2 for doubles]
   * @param winnerScore Winning score
   * @param loserScore Losing score
   * @param division Age division
   * @param format Play format
   * @param isTournament Whether this was a tournament match
   */
  async calculateRatingsForMatch(
    winnerIds: number[],
    loserIds: number[],
    winnerScore: number,
    loserScore: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    isTournament: boolean = false
  ): Promise<{
    winnerRatings: PlayerRating[],
    loserRatings: PlayerRating[],
    winnerChanges: number[],
    loserChanges: number[]
  }> {
    // Validate player counts for the format
    if (format === Format.SINGLES && (winnerIds.length !== 1 || loserIds.length !== 1)) {
      throw new Error("Singles format requires exactly one player per side");
    }
    if (format !== Format.SINGLES && (winnerIds.length !== 2 || loserIds.length !== 2)) {
      throw new Error("Doubles formats require exactly two players per side");
    }
    
    // Get or initialize ratings for all players
    const winnerRatings: PlayerRating[] = [];
    const loserRatings: PlayerRating[] = [];
    
    for (const winnerId of winnerIds) {
      let rating = await db.query.playerRatings.findFirst({
        where: and(
          eq(playerRatings.userId, winnerId),
          eq(playerRatings.division, division),
          eq(playerRatings.format, format)
        )
      });
      
      if (!rating) {
        rating = await this.initializePlayerRating(winnerId, 1000, division, format);
      }
      
      winnerRatings.push(rating);
    }
    
    for (const loserId of loserIds) {
      let rating = await db.query.playerRatings.findFirst({
        where: and(
          eq(playerRatings.userId, loserId),
          eq(playerRatings.division, division),
          eq(playerRatings.format, format)
        )
      });
      
      if (!rating) {
        rating = await this.initializePlayerRating(loserId, 1000, division, format);
      }
      
      loserRatings.push(rating);
    }
    
    // Calculate team ratings for doubles
    const winnerTeamRating = format === Format.SINGLES 
      ? winnerRatings[0].rating 
      : (winnerRatings[0].rating + winnerRatings[1].rating) / 2;
      
    const loserTeamRating = format === Format.SINGLES 
      ? loserRatings[0].rating 
      : (loserRatings[0].rating + loserRatings[1].rating) / 2;
    
    // Calculate expected outcome using ELO formula
    const expectedWinnerOutcome = this.calculateExpectedOutcome(winnerTeamRating, loserTeamRating);
    const expectedLoserOutcome = 1 - expectedWinnerOutcome;
    
    // Actual outcome is always 1 for winner, 0 for loser in a decisive match
    const actualWinnerOutcome = 1.0;
    const actualLoserOutcome = 0.0;
    
    // Calculate score differential for multiplier
    const scoreDifferential = winnerScore - loserScore;
    const scoreMultiplier = this.getScoreDifferentialMultiplier(scoreDifferential);
    
    // Calculate K-factors for all players
    const winnerKFactors = winnerRatings.map(rating => 
      this.calculateKFactor(
        rating.isProvisional, 
        rating.matchesPlayed, 
        isTournament, 
        format
      )
    );
    
    const loserKFactors = loserRatings.map(rating => 
      this.calculateKFactor(
        rating.isProvisional, 
        rating.matchesPlayed, 
        isTournament, 
        format
      )
    );
    
    // Calculate rating changes
    const winnerChanges = winnerKFactors.map(k => 
      Math.round(k * (actualWinnerOutcome - expectedWinnerOutcome) * scoreMultiplier)
    );
    
    const loserChanges = loserKFactors.map(k => 
      Math.round(k * (actualLoserOutcome - expectedLoserOutcome) * scoreMultiplier)
    );
    
    // Update all player ratings and create history entries
    for (let i = 0; i < winnerRatings.length; i++) {
      const rating = winnerRatings[i];
      const change = winnerChanges[i];
      const userId = winnerIds[i];
      
      await this.updatePlayerRating(
        rating,
        change,
        winnerKFactors[i],
        expectedWinnerOutcome,
        true, // isWinner
        isTournament,
        scoreMultiplier
      );
    }
    
    for (let i = 0; i < loserRatings.length; i++) {
      const rating = loserRatings[i];
      const change = loserChanges[i];
      const userId = loserIds[i];
      
      await this.updatePlayerRating(
        rating,
        change,
        loserKFactors[i],
        expectedLoserOutcome,
        false, // isWinner
        isTournament,
        scoreMultiplier
      );
    }
    
    return {
      winnerRatings,
      loserRatings,
      winnerChanges,
      loserChanges
    };
  }
  
  /**
   * Calculate the expected outcome using the ELO formula
   * @param rating1 First player/team rating
   * @param rating2 Second player/team rating
   * @returns Number between 0 and 1 representing probability of player1 winning
   */
  private calculateExpectedOutcome(rating1: number, rating2: number): number {
    return 1.0 / (1.0 + Math.pow(10, (rating2 - rating1) / 400));
  }
  
  /**
   * Get the appropriate multiplier based on score differential
   * @param scoreDifferential Point differential (winner - loser)
   */
  private getScoreDifferentialMultiplier(scoreDifferential: number): number {
    // Sort from highest to lowest threshold
    const sortedMultipliers = [...SCORE_MULTIPLIERS].sort((a, b) => b.threshold - a.threshold);
    
    for (const { threshold, multiplier } of sortedMultipliers) {
      if (scoreDifferential >= threshold) {
        return multiplier;
      }
    }
    
    // Default multiplier if no thresholds are met (shouldn't happen)
    return 1.0;
  }
  
  /**
   * Calculate the K-factor for a player
   * @param isProvisional Whether the player has a provisional rating
   * @param matchesPlayed Number of matches the player has played
   * @param isTournament Whether this is a tournament match
   * @param format The match format
   */
  private calculateKFactor(
    isProvisional: boolean, 
    matchesPlayed: number, 
    isTournament: boolean,
    format: Format
  ): number {
    const config = K_FACTORS[format];
    
    let kFactor: number;
    
    if (isProvisional) {
      // For provisional ratings, K decreases as matches increase
      const provisionalRange = config.provisionalMax - config.provisionalMin;
      const matchFactor = Math.min(matchesPlayed, 10) / 10; // 0 to 1 over first 10 matches
      kFactor = config.provisionalMax - (provisionalRange * matchFactor);
    } else {
      // For established ratings, K is lower and more stable
      kFactor = config.establishedMin;
    }
    
    // Add tournament bonus if applicable
    if (isTournament) {
      kFactor += config.tournamentBonus;
    }
    
    return kFactor;
  }
  
  /**
   * Update a player's rating after a match
   * @param rating The player's current rating record
   * @param ratingChange The calculated rating change
   * @param kFactor The K-factor used
   * @param expectedOutcome The expected outcome from ELO calculation
   * @param isWinner Whether this player won the match
   * @param isTournament Whether this was a tournament match
   * @param scoreMultiplier The multiplier based on score differential
   */
  private async updatePlayerRating(
    rating: PlayerRating,
    ratingChange: number,
    kFactor: number,
    expectedOutcome: number,
    isWinner: boolean,
    isTournament: boolean,
    scoreMultiplier: number
  ): Promise<PlayerRating> {
    const oldRating = rating.rating;
    const newRating = Math.max(1000, oldRating + ratingChange); // Minimum 1000 rating
    const matchesPlayed = rating.matchesPlayed + 1;
    
    // Update provisional status (no longer provisional after 10 matches)
    const isProvisional = matchesPlayed < 10;
    
    // Update confidence level (0-100)
    const confidenceBase = Math.min(matchesPlayed * 10, 80); // Base confidence from matches played
    const confidenceVariance = Math.abs(expectedOutcome - (isWinner ? 1 : 0)) * 20; // 0-20 points off for surprising results
    const confidenceLevel = Math.max(0, Math.min(100, confidenceBase - confidenceVariance));
    
    // Check if tier has changed
    const oldTier = rating.tier;
    const newTierInfo = await this.getTierForRating(newRating);
    const tierChanged = oldTier !== newTierInfo.name;
    
    // Update high water marks if needed
    const seasonHighRating = newRating > (rating.seasonHighRating || 0) 
      ? newRating 
      : rating.seasonHighRating;
      
    const allTimeHighRating = newRating > (rating.allTimeHighRating || 0)
      ? newRating
      : rating.allTimeHighRating;
    
    // Update the rating in the database
    const [updatedRating] = await db.update(playerRatings)
      .set({
        rating: newRating,
        tier: newTierInfo.name,
        confidenceLevel,
        matchesPlayed,
        isProvisional,
        lastMatchDate: new Date(),
        seasonHighRating,
        allTimeHighRating,
        updatedAt: new Date()
      })
      .where(eq(playerRatings.id, rating.id))
      .returning();
    
    // Create rating history entry using direct SQL to avoid ORM issues
    await db.execute(sql`
      INSERT INTO rating_history (
        player_rating_id, old_rating, new_rating, rating_change, 
        reason, k_factor, expected_outcome, actual_outcome, 
        score_differential, was_win, notes, created_at
      ) VALUES (
        ${rating.id}, ${oldRating}, ${newRating}, ${ratingChange},
        ${isTournament ? "tournament_match" : "match_result"}, ${kFactor}, 
        ${expectedOutcome}, ${isWinner ? 1.0 : 0.0}, 
        ${scoreMultiplier}, ${isWinner}, 
        ${`${isWinner ? "Win" : "Loss"} ${isTournament ? "in tournament" : ""}`},
        NOW()
      )
    `);
    
    // Fire rating updated event
    await serverEventBus.publish(CourtIQEvents.RATING_UPDATED, {
      userId: rating.userId,
      ratingId: rating.id,
      oldRating,
      newRating,
      change: ratingChange,
      division: rating.division,
      format: rating.format,
      isWin: isWinner,
      isTournament
    });
    
    // Fire confidence updated event
    await serverEventBus.publish(CourtIQEvents.CONFIDENCE_UPDATED, {
      userId: rating.userId,
      ratingId: rating.id,
      oldConfidence: rating.confidenceLevel,
      newConfidence: confidenceLevel,
      matchesPlayed
    });
    
    // Fire tier changed event if tier changed
    if (tierChanged) {
      await serverEventBus.publish(CourtIQEvents.TIER_CHANGED, {
        userId: rating.userId,
        ratingId: rating.id,
        oldTier,
        newTier: newTierInfo.name,
        oldRating,
        newRating
      });
      
      // Award XP for tier promotion if rating increased
      if (ratingChange > 0) {
        await xpSystem.awardXP(
          rating.userId,
          "tier_promotion",
          250, // XP for tier promotion
          undefined,
          100,
          `Promoted to ${newTierInfo.name} tier`
        );
      }
    }
    
    return updatedRating;
  }
  
  /**
   * Get a player's current rating for a specific division and format
   * @param userId User ID
   * @param division Age division
   * @param format Play format
   */
  async getPlayerRating(
    userId: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES
  ): Promise<PlayerRating | null> {
    // Use direct SQL to avoid ORM issues
    const [rating] = await db.execute<PlayerRating>(sql`
      SELECT * FROM player_ratings
      WHERE user_id = ${userId}
        AND division = ${division}
        AND format = ${format}
      LIMIT 1
    `);
    
    return rating || null;
  }
  
  /**
   * Get all ratings for a player across all divisions and formats
   * @param userId User ID
   */
  async getAllPlayerRatings(userId: number): Promise<PlayerRating[]> {
    // Use direct SQL to avoid ORM issues
    const ratings = await db.execute<PlayerRating[]>(sql`
      SELECT * FROM player_ratings
      WHERE user_id = ${userId}
      ORDER BY division ASC, format ASC
    `);
    
    return ratings;
  }
  
  /**
   * Get a player's rating history for a specific division and format
   * @param userId User ID
   * @param division Age division
   * @param format Play format
   * @param limit Maximum number of history entries to return
   */
  async getPlayerRatingHistory(
    userId: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    limit: number = 10
  ): Promise<any[]> {
    // First, get the rating ID
    const rating = await this.getPlayerRating(userId, division, format);
    
    if (!rating) {
      return [];
    }
    
    // Then get the history for this rating using direct SQL
    const history = await db.execute(sql`
      SELECT * FROM rating_history 
      WHERE player_rating_id = ${rating.id}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    
    return history;
  }
  
  /**
   * Get the leaderboard for a specific division and format
   * @param division Age division
   * @param format Play format
   * @param limit Maximum number of players to return
   * @param offset Pagination offset
   */
  async getLeaderboard(
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    // Use direct SQL to avoid ORM issues
    const leaderboard = await db.execute(sql`
      SELECT 
        pr.id, 
        pr.user_id as "userId", 
        pr.rating, 
        pr.tier, 
        pr.matches_played as "matchesPlayed",
        u.username,
        u.display_name as "displayName"
      FROM player_ratings pr
      JOIN users u ON pr.user_id = u.id
      WHERE 
        pr.division = ${division}
        AND pr.format = ${format}
        AND pr.matches_played >= 5
      ORDER BY pr.rating DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return leaderboard.map(entry => ({
      id: entry.id,
      userId: entry.userId,
      rating: entry.rating,
      tier: entry.tier,
      matchesPlayed: entry.matchesPlayed,
      division,
      format,
      user: {
        username: entry.username,
        displayName: entry.displayName
      }
    }));
  }
  
  /**
   * Get all available rating tiers
   */
  async getAllRatingTiers(): Promise<RatingTier[]> {
    // Use direct SQL to avoid ORM issues
    const tiers = await db.execute<RatingTier[]>(
      sql`SELECT * FROM rating_tiers ORDER BY "order" ASC`
    );
    
    return tiers;
  }
}

// Export singleton instance
export const ratingSystem = new RatingSystem();