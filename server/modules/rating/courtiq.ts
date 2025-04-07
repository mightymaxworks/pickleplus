/**
 * CourtIQ™ Rating System Implementation
 * 
 * This module provides the core rating calculation algorithms and utilities
 * for the CourtIQ™ rating system. It handles rating adjustments, tier
 * assignments, and points calculations.
 */

import { db } from "../../db";
import { eq, and, or, sql, desc, asc, inArray, lt, between } from "drizzle-orm";
import { serverEventBus, ServerEvents } from "../../core/events/eventBus";
import { 
  playerRatings, 
  ratingHistory,
  ratingTiers,
  rankingPoints,
  pointsHistory,
  PlayerRating,
  RatingTier,
  InsertPlayerRating,
  InsertRatingHistory,
  InsertRankingPoints,
  InsertPointsHistory,
  ratingProtections,
  tournamentEligibility
} from "../../../shared/courtiq-schema";
import { users } from "../../../shared/schema";
import { seasons } from "../../../shared/courtiq-schema";

/**
 * Main CourtIQ service class
 */
export class CourtIQService {
  
  /**
   * Initialize a new player in the CourtIQ system
   * @param userId The user's ID
   * @param initialRating Optional initial rating (defaults to 1000)
   * @param divisions Array of divisions to initialize
   * @param formats Array of formats to initialize
   */
  async initializePlayer(
    userId: number, 
    initialRating: number = 1000,
    divisions: string[] = ["19+", "35+", "50+", "60+", "70+"],
    formats: string[] = ["singles", "mens_doubles", "womens_doubles", "mixed_doubles"]
  ): Promise<void> {
    // Get user's birth year to determine eligible divisions
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { yearOfBirth: true }
    });
    
    if (!user || !user.yearOfBirth) {
      throw new Error("User not found or birth year not specified");
    }
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - user.yearOfBirth;
    
    // Filter divisions based on age eligibility
    const eligibleDivisions = divisions.filter(div => {
      const minAge = parseInt(div.replace('+', ''), 10);
      return age >= minAge;
    });
    
    // Get all tiers for reference
    const allTiers = await db.query.ratingTiers.findMany({
      orderBy: [asc(ratingTiers.order)]
    });
    
    if (allTiers.length === 0) {
      // If no tiers exist, create default tiers
      await this.initializeDefaultTiers();
      allTiers.push(...await db.query.ratingTiers.findMany({
        orderBy: [asc(ratingTiers.order)]
      }));
    }
    
    // Find the correct tier for the initial rating
    const initialTier = this.findTierForRating(initialRating, allTiers);
    
    // Create a rating entry for each eligible division and format
    for (const division of eligibleDivisions) {
      for (const format of formats) {
        // Apply slight rating adjustments for divisions/formats
        let adjustedRating = initialRating;
        
        // Create player rating record
        const newRating: InsertPlayerRating = {
          userId,
          rating: adjustedRating,
          tier: initialTier.name,
          confidenceLevel: 0, // Low confidence for new ratings
          matchesPlayed: 0,
          division,
          format,
          isProvisional: true,
          seasonHighRating: adjustedRating,
          allTimeHighRating: adjustedRating,
        };
        
        await db.insert(playerRatings).values(newRating);
      }
    }
    
    // Initialize protection mechanics for new player
    await db.insert(ratingProtections).values({
      userId,
      protectionType: "challenge_match",
      remainingUses: 5,
      refreshDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Refresh in 1 month
      notes: "Initial challenge match protection"
    });
    
    // Initialize ranking points for current season
    const currentSeason = await this.getCurrentSeason();
    
    if (currentSeason) {
      for (const division of eligibleDivisions) {
        for (const format of formats) {
          await db.insert(rankingPoints).values({
            userId,
            points: 0,
            season: currentSeason.code,
            division,
            format
          });
        }
      }
    }
    
    // Fire event that player has been initialized
    await serverEventBus.publish("courtiq:player_initialized", { userId });
  }
  
  /**
   * Find the tier corresponding to a specific rating
   */
  private findTierForRating(rating: number, tiers: RatingTier[]): RatingTier {
    for (const tier of tiers) {
      if (rating >= tier.minRating && rating <= tier.maxRating) {
        return tier;
      }
    }
    
    // If no tier found (shouldn't happen with proper tier setup)
    return tiers[0]; // Return lowest tier as fallback
  }
  
  /**
   * Create default tier structure if none exists
   */
  async initializeDefaultTiers(): Promise<void> {
    const defaultTiers = [
      {
        name: "Dink Dabbler",
        minRating: 1000,
        maxRating: 1199,
        colorCode: "#6c757d", // Gray
        protectionLevel: 100, // Full protection
        description: "Beginning your pickleball journey",
        order: 1
      },
      {
        name: "Paddle Prospect",
        minRating: 1200,
        maxRating: 1399,
        colorCode: "#28a745", // Green
        protectionLevel: 100, // Full protection 
        description: "Developing consistent play",
        order: 2
      },
      {
        name: "Rally Ranger",
        minRating: 1400,
        maxRating: 1599,
        colorCode: "#17a2b8", // Teal
        protectionLevel: 75, // Strong protection
        description: "Building a strategic approach",
        order: 3
      },
      {
        name: "Volley Voyager",
        minRating: 1600,
        maxRating: 1799,
        colorCode: "#007bff", // Blue
        protectionLevel: 50, // Medium protection
        description: "Developing advanced techniques",
        order: 4
      },
      {
        name: "Spin Specialist",
        minRating: 1800,
        maxRating: 1999,
        colorCode: "#6f42c1", // Purple
        protectionLevel: 25, // Light protection
        description: "Mastering shot variations",
        order: 5
      },
      {
        name: "Kitchen Commander",
        minRating: 2000,
        maxRating: 2199,
        colorCode: "#fd7e14", // Orange
        protectionLevel: 10, // Minimal protection
        description: "Dominating the non-volley zone",
        order: 6
      },
      {
        name: "Smash Sovereign",
        minRating: 2200,
        maxRating: 2399,
        colorCode: "#e83e8c", // Pink
        protectionLevel: 0, // No protection
        description: "Power and precision combined",
        order: 7
      },
      {
        name: "Court Crusader",
        minRating: 2400,
        maxRating: 2599,
        colorCode: "#dc3545", // Red
        protectionLevel: 0, // No protection
        description: "Elite competitive play",
        order: 8
      },
      {
        name: "Pickleball Prophet",
        minRating: 2600,
        maxRating: 2799,
        colorCode: "#f1c40f", // Yellow
        protectionLevel: 0, // No protection
        description: "Anticipating every move",
        order: 9
      },
      {
        name: "Tournament Titan",
        minRating: 2800,
        maxRating: 3000,
        colorCode: "#9b59b6", // Purple
        protectionLevel: 0, // No protection
        description: "The pinnacle of the sport",
        order: 10
      }
    ];
    
    for (const tier of defaultTiers) {
      await db.insert(ratingTiers).values(tier);
    }
  }
  
  /**
   * Calculate rating adjustment for a match
   * This is the core ELO calculation function
   */
  calculateRatingChange(
    playerRating: number,
    opponentRating: number,
    outcome: number, // 1 for win, 0.5 for draw, 0 for loss
    kFactor: number
  ): {
    ratingChange: number;
    expectedOutcome: number;
    actualOutcome: number;
  } {
    // Calculate expected outcome using ELO formula
    const expectedOutcome = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    
    // Calculate rating change: K * (actual - expected)
    const ratingChange = Math.round(kFactor * (outcome - expectedOutcome));
    
    return {
      ratingChange,
      expectedOutcome,
      actualOutcome: outcome
    };
  }
  
  /**
   * Get the appropriate K-factor for a match based on context
   */
  determineKFactor(
    matchType: string, // "casual", "league", "tournament"
    tournamentLevel?: string, // "club", "district", "city", "state", "regional", "national", "international"
    tournamentRound?: string, // "round_robin", "early_rounds", "quarter_final", "semi_final", "final"
    playerMatchCount?: number // Number of matches the player has played
  ): number {
    // Base K-factors
    const K_CASUAL = 12;
    const K_LEAGUE = 15;
    
    // Tournament K-factors by level
    const tournamentKFactors: Record<string, number> = {
      "club": 24,
      "district": 32,
      "city": 36,
      "state": 44,
      "regional": 52,
      "national": 60,
      "international": 70
    };
    
    // Round multipliers for tournaments
    const roundMultipliers: Record<string, number> = {
      "round_robin": 1.0,
      "early_rounds": 1.0,
      "quarter_final": 1.1,
      "semi_final": 1.2,
      "final": 1.3
    };
    
    // New player adjustment (first 20 matches)
    let newPlayerMultiplier = 1.0;
    if (playerMatchCount !== undefined && playerMatchCount < 20) {
      // Higher K-factor for new players, gradually reducing as they play more matches
      newPlayerMultiplier = 1.5 - (playerMatchCount * 0.025); // 1.5 to 1.0 over 20 matches
    }
    
    // Calculate final K-factor
    let kFactor: number;
    
    if (matchType === "casual") {
      kFactor = K_CASUAL;
    } else if (matchType === "league") {
      kFactor = K_LEAGUE;
    } else if (matchType === "tournament") {
      // Get base tournament K-factor or fallback to club level
      kFactor = tournamentLevel ? tournamentKFactors[tournamentLevel] : tournamentKFactors["club"];
      
      // Apply round multiplier if applicable
      if (tournamentRound && roundMultipliers[tournamentRound]) {
        kFactor *= roundMultipliers[tournamentRound];
      }
    } else {
      // Unknown match type, use casual as fallback
      kFactor = K_CASUAL;
    }
    
    // Apply new player multiplier
    kFactor *= newPlayerMultiplier;
    
    // Round to nearest integer
    return Math.round(kFactor);
  }
  
  /**
   * Apply rating adjustment to a player
   */
  async applyRatingChange(
    playerRatingId: number,
    ratingChange: number,
    matchId: number | null,
    reason: string,
    kFactor: number,
    expectedOutcome: number,
    actualOutcome: number,
    notes?: string
  ): Promise<void> {
    // First get the current rating
    const rating = await db.query.playerRatings.findFirst({
      where: eq(playerRatings.id, playerRatingId)
    });
    
    if (!rating) {
      throw new Error(`Player rating not found with ID ${playerRatingId}`);
    }
    
    // Get tiers for reference
    const tiers = await db.query.ratingTiers.findMany({
      orderBy: [asc(ratingTiers.order)]
    });
    
    // Get current tier
    const currentTier = tiers.find(t => t.name === rating.tier);
    
    if (!currentTier) {
      throw new Error(`Tier not found: ${rating.tier}`);
    }
    
    // Apply protection mechanics for rating loss
    // Protection only applies to negative rating changes
    let adjustedRatingChange = ratingChange;
    
    if (ratingChange < 0) {
      // Apply tier-based protection
      const protectionFactor = currentTier.protectionLevel / 100;
      adjustedRatingChange = Math.round(ratingChange * (1 - protectionFactor));
      
      // Check for challenge match protection
      const challengeProtection = await db.query.ratingProtections.findFirst({
        where: and(
          eq(ratingProtections.userId, rating.userId),
          eq(ratingProtections.protectionType, "challenge_match"),
          sql`${ratingProtections.remainingUses} > 0`
        )
      });
      
      if (challengeProtection && challengeProtection.remainingUses > 0) {
        // If player has challenge match protection and opts to use it,
        // completely negate the negative rating change
        // This would typically be triggered by player choice in the UI
        // adjustedRatingChange = 0;
        
        // Update remaining uses
        // await db.update(ratingProtections)
        //   .set({ remainingUses: challengeProtection.remainingUses - 1 })
        //   .where(eq(ratingProtections.id, challengeProtection.id));
      }
    }
    
    // Calculate new rating
    const newRating = rating.rating + adjustedRatingChange;
    
    // Find new tier based on the new rating
    const newTier = this.findTierForRating(newRating, tiers);
    
    // Update high watermarks if applicable
    const seasonHighRating = Math.max(rating.seasonHighRating || 0, newRating);
    const allTimeHighRating = Math.max(rating.allTimeHighRating || 0, newRating);
    
    // Create rating history record
    const historyRecord: InsertRatingHistory = {
      playerRatingId,
      oldRating: rating.rating,
      newRating,
      ratingChange: adjustedRatingChange,
      matchId,
      reason,
      kFactor,
      // Convert decimal values to strings as required by the schema
      expectedOutcome: expectedOutcome.toString(),
      actualOutcome: actualOutcome.toString(),
      notes
    };
    
    await db.insert(ratingHistory).values(historyRecord);
    
    // Update player rating
    await db.update(playerRatings)
      .set({
        rating: newRating,
        tier: newTier.name,
        matchesPlayed: rating.matchesPlayed + 1,
        lastMatchDate: new Date(),
        isProvisional: rating.matchesPlayed < 15, // No longer provisional after 15 matches
        seasonHighRating,
        allTimeHighRating,
        updatedAt: new Date()
      })
      .where(eq(playerRatings.id, playerRatingId));
    
    // Fire event if player changed tiers
    if (newTier.name !== rating.tier) {
      await serverEventBus.publish("courtiq:tier_changed", {
        userId: rating.userId,
        oldTier: rating.tier,
        newTier: newTier.name,
        division: rating.division,
        format: rating.format
      });
    }
  }
  
  /**
   * Award ranking points to a player
   * This is separate from rating changes and always positive
   */
  async awardRankingPoints(
    userId: number,
    points: number,
    division: string,
    format: string,
    source: string,
    sourceId?: number,
    multiplier: number = 1.0,
    notes?: string
  ): Promise<void> {
    // Get current season
    const currentSeason = await this.getCurrentSeason();
    
    if (!currentSeason) {
      throw new Error("No active season found");
    }
    
    // Calculate points with multiplier
    const adjustedPoints = Math.round(points * multiplier);
    
    // Record points history
    const pointsRecord: InsertPointsHistory = {
      userId,
      points: adjustedPoints,
      season: currentSeason.code,
      division,
      format,
      source,
      sourceId,
      // Convert multiplier to string as required by the schema
      multiplier: multiplier.toString(),
      notes,
      // Set default values for new fields
      basePoints: points,
      ratingDifferential: null, // Optional field
      bonusPoints: adjustedPoints - points // Calculate bonus from multiplier
    };
    
    await db.insert(pointsHistory).values(pointsRecord);
    
    // Update total points for the season
    const existingPoints = await db.query.rankingPoints.findFirst({
      where: and(
        eq(rankingPoints.userId, userId),
        eq(rankingPoints.season, currentSeason.code),
        eq(rankingPoints.division, division),
        eq(rankingPoints.format, format)
      )
    });
    
    if (existingPoints) {
      // Update existing record
      await db.update(rankingPoints)
        .set({
          points: existingPoints.points + adjustedPoints,
          lastUpdated: new Date()
        })
        .where(eq(rankingPoints.id, existingPoints.id));
    } else {
      // Create new record
      const newPoints: InsertRankingPoints = {
        userId,
        points: adjustedPoints,
        season: currentSeason.code,
        division,
        format
      };
      
      await db.insert(rankingPoints).values(newPoints);
    }
    
    // Fire event for points earned
    await serverEventBus.publish("courtiq:points_earned", {
      userId,
      points: adjustedPoints,
      season: currentSeason.code,
      division,
      format,
      source
    });
  }
  
  /**
   * Get the current active season
   */
  async getCurrentSeason() {
    return await db.query.seasons.findFirst({
      where: eq(seasons.isActive, true)
    });
  }
  
  /**
   * Get player's rating for a specific division and format
   */
  async getPlayerRating(userId: number, division: string, format: string): Promise<PlayerRating | undefined> {
    return await db.query.playerRatings.findFirst({
      where: and(
        eq(playerRatings.userId, userId),
        eq(playerRatings.division, division),
        eq(playerRatings.format, format)
      )
    });
  }
  
  /**
   * Get all divisions a player is eligible for
   */
  async getEligibleDivisions(userId: number): Promise<string[]> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { yearOfBirth: true }
    });
    
    if (!user || !user.yearOfBirth) {
      return [];
    }
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - user.yearOfBirth;
    
    const allDivisions = ["19+", "35+", "50+", "60+", "70+"];
    return allDivisions.filter(div => {
      const minAge = parseInt(div.replace('+', ''), 10);
      return age >= minAge;
    });
  }
  
  /**
   * Calculate division multiplier when playing in younger divisions
   */
  calculateDivisionMultiplier(playerAge: number, divisionMinAge: number): number {
    // Default multiplier is 1.0 (no adjustment)
    if (playerAge < divisionMinAge) {
      return 1.0; // Not eligible for this division
    }
    
    // Calculate age brackets difference
    const playerBracket = Math.floor(playerAge / 15); // 19-34, 35-49, 50-64, 65-79, 80+
    const divisionBracket = Math.floor(divisionMinAge / 15);
    const bracketDifference = playerBracket - divisionBracket;
    
    if (bracketDifference <= 0) {
      return 1.0; // Playing in age-appropriate or older division
    }
    
    // Apply multiplier based on brackets difference
    // Each bracket grants a 0.10 multiplier
    return 1.0 + (bracketDifference * 0.10);
  }
  
  /**
   * Main entry point for processing match results in the CourtIQ system
   * This method adapts the unified interface to the specific processing methods
   */
  async processMatch({
    matchId,
    players,
    format,
    division,
    matchType,
    eventTier,
    tournamentRound
  }: {
    matchId: number;
    players: Array<{ 
      userId: number; 
      partnerId?: number | null; 
      score?: number; 
      isWinner: boolean 
    }>;
    format: string;
    division: string;
    matchType: string;
    eventTier?: string;
    tournamentRound?: string;
  }): Promise<any> {
    // Validate input
    if (!players || players.length !== 2) {
      throw new Error("Match processing requires exactly 2 players/teams");
    }

    if (!format) {
      throw new Error("Match format is required");
    }

    // Determine if singles or doubles based on format and partner presence
    const isSingles = format === "singles" || 
      (players.every(p => !p.partnerId || p.partnerId === null));

    if (isSingles) {
      // Process as singles match
      const player1 = players[0];
      const player2 = players[1];
      const winnerId = players.find(p => p.isWinner)?.userId;

      if (!winnerId) {
        throw new Error("Winner ID is required for match processing");
      }

      await this.processMatchSingles(
        player1.userId,
        player2.userId,
        winnerId,
        matchType,
        division,
        eventTier,
        tournamentRound
      );

      return {
        success: true,
        format: "singles",
        matchId
      };
    } else {
      // Process as doubles match
      const team1 = players[0];
      const team2 = players[1];
      
      if (!team1.partnerId || !team2.partnerId) {
        throw new Error("Partner IDs are required for doubles match processing");
      }
      
      // Determine winning team
      const winningTeamId = team1.isWinner ? 1 : 2;

      // Figure out doubles format type
      let doublesFormat: "mens_doubles" | "womens_doubles" | "mixed_doubles";
      switch (format) {
        case "mens_doubles":
        case "womens_doubles":
        case "mixed_doubles":
          doublesFormat = format as "mens_doubles" | "womens_doubles" | "mixed_doubles";
          break;
        default:
          // Default to mixed doubles if format is unclear
          doublesFormat = "mixed_doubles";
      }

      await this.processMatchDoubles(
        team1.userId,
        team1.partnerId,
        team2.userId,
        team2.partnerId,
        winningTeamId,
        matchType,
        division,
        doublesFormat,
        eventTier,
        tournamentRound
      );

      return {
        success: true,
        format: "doubles",
        matchId
      };
    }
  }

  /**
   * Process a singles match and update player ratings
   * This is called by the main processMatch method for singles format matches
   */
  async processMatchSingles(
    player1Id: number,
    player2Id: number,
    winnerId: number,
    matchType: string,
    division: string,
    tournamentLevel?: string,
    tournamentRound?: string
  ): Promise<void> {
    // Determine outcome
    const player1Outcome = (winnerId === player1Id) ? 1 : 0;
    const player2Outcome = (winnerId === player2Id) ? 1 : 0;
    
    // Get player ratings
    const player1Rating = await this.getPlayerRating(player1Id, division, "singles");
    const player2Rating = await this.getPlayerRating(player2Id, division, "singles");
    
    if (!player1Rating || !player2Rating) {
      throw new Error("One or both players don't have ratings for this division and format");
    }
    
    // Determine K-factors
    const player1KFactor = this.determineKFactor(
      matchType,
      tournamentLevel,
      tournamentRound,
      player1Rating.matchesPlayed
    );
    
    const player2KFactor = this.determineKFactor(
      matchType,
      tournamentLevel,
      tournamentRound,
      player2Rating.matchesPlayed
    );
    
    // Calculate rating changes
    const player1Update = this.calculateRatingChange(
      player1Rating.rating,
      player2Rating.rating,
      player1Outcome,
      player1KFactor
    );
    
    const player2Update = this.calculateRatingChange(
      player2Rating.rating,
      player1Rating.rating,
      player2Outcome,
      player2KFactor
    );
    
    // Apply rating changes
    await this.applyRatingChange(
      player1Rating.id,
      player1Update.ratingChange,
      null, // Match ID would be provided in a real implementation
      "match_result",
      player1KFactor,
      player1Update.expectedOutcome,
      player1Update.actualOutcome,
      `Singles match against ${player2Id}`
    );
    
    await this.applyRatingChange(
      player2Rating.id,
      player2Update.ratingChange,
      null, // Match ID
      "match_result",
      player2KFactor,
      player2Update.expectedOutcome,
      player2Update.actualOutcome,
      `Singles match against ${player1Id}`
    );
    
    // Award ranking points for the winner
    const basePoints = this.determineBasePoints(matchType, tournamentLevel, tournamentRound);
    
    if (winnerId === player1Id) {
      // Calculate opponent strength multiplier (stronger opponents = more points)
      const strengthMultiplier = this.calculateOpponentStrengthMultiplier(player1Rating.rating, player2Rating.rating);
      
      // Award points to player 1
      await this.awardRankingPoints(
        player1Id,
        basePoints,
        division,
        "singles",
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `Singles victory against ${player2Id}`
      );
    } else {
      // Calculate opponent strength multiplier
      const strengthMultiplier = this.calculateOpponentStrengthMultiplier(player2Rating.rating, player1Rating.rating);
      
      // Award points to player 2
      await this.awardRankingPoints(
        player2Id,
        basePoints,
        division,
        "singles",
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `Singles victory against ${player1Id}`
      );
    }
  }
  
  /**
   * Determine base points for a match/tournament
   */
  private determineBasePoints(
    matchType: string,
    tournamentLevel?: string,
    tournamentRound?: string
  ): number {
    // Base points by match type
    const basePoints: Record<string, number> = {
      "casual": 10,
      "league": 15,
      "tournament": 20
    };
    
    // Tournament level multipliers
    const tournamentMultipliers: Record<string, number> = {
      "club": 1.0,
      "district": 1.2,
      "city": 1.3,
      "state": 1.5,
      "regional": 1.8,
      "national": 2.0,
      "international": 2.5
    };
    
    // Round multipliers
    const roundMultipliers: Record<string, number> = {
      "round_robin": 1.0,
      "early_rounds": 1.0,
      "quarter_final": 1.2,
      "semi_final": 1.5,
      "final": 2.0
    };
    
    // Calculate points
    let points = basePoints[matchType] || basePoints["casual"];
    
    if (matchType === "tournament" && tournamentLevel) {
      points *= tournamentMultipliers[tournamentLevel] || 1.0;
      
      if (tournamentRound) {
        points *= roundMultipliers[tournamentRound] || 1.0;
      }
    }
    
    return Math.round(points);
  }
  
  /**
   * Calculate multiplier based on opponent strength
   */
  private calculateOpponentStrengthMultiplier(playerRating: number, opponentRating: number): number {
    // Calculate the rating difference (can be positive or negative)
    const ratingDifference = opponentRating - playerRating;
    
    // Base multiplier is 1.0
    // For each 100 rating points the opponent is above the player, add 0.1 to the multiplier
    // For each 100 rating points the opponent is below the player, subtract 0.05 from the multiplier
    // Minimum multiplier is 0.8 (even for very weak opponents)
    // Maximum multiplier is 1.5 (even for very strong opponents)
    
    let multiplier = 1.0;
    
    if (ratingDifference > 0) {
      // Opponent is stronger
      multiplier += (ratingDifference / 100) * 0.1;
      // Cap at 1.5
      multiplier = Math.min(multiplier, 1.5);
    } else {
      // Opponent is weaker
      multiplier += (ratingDifference / 100) * 0.05;
      // Floor at 0.8
      multiplier = Math.max(multiplier, 0.8);
    }
    
    return multiplier;
  }
  
  /**
   * Process a doubles match and update ratings
   */
  async processMatchDoubles(
    team1Player1Id: number,
    team1Player2Id: number,
    team2Player1Id: number,
    team2Player2Id: number,
    winningTeamId: 1 | 2, // 1 = team1, 2 = team2
    matchType: string,
    division: string,
    format: "mens_doubles" | "womens_doubles" | "mixed_doubles",
    tournamentLevel?: string,
    tournamentRound?: string
  ): Promise<void> {
    // Determine outcomes
    const team1Outcome = (winningTeamId === 1) ? 1 : 0;
    const team2Outcome = (winningTeamId === 2) ? 1 : 0;
    
    // Get player ratings
    const team1Player1Rating = await this.getPlayerRating(team1Player1Id, division, format);
    const team1Player2Rating = await this.getPlayerRating(team1Player2Id, division, format);
    const team2Player1Rating = await this.getPlayerRating(team2Player1Id, division, format);
    const team2Player2Rating = await this.getPlayerRating(team2Player2Id, division, format);
    
    if (!team1Player1Rating || !team1Player2Rating || !team2Player1Rating || !team2Player2Rating) {
      throw new Error("One or more players don't have ratings for this division and format");
    }
    
    // Calculate team ratings (simple average)
    const team1AverageRating = (team1Player1Rating.rating + team1Player2Rating.rating) / 2;
    const team2AverageRating = (team2Player1Rating.rating + team2Player2Rating.rating) / 2;
    
    // Determine K-factors
    const team1Player1KFactor = this.determineKFactor(
      matchType, tournamentLevel, tournamentRound, team1Player1Rating.matchesPlayed
    );
    const team1Player2KFactor = this.determineKFactor(
      matchType, tournamentLevel, tournamentRound, team1Player2Rating.matchesPlayed
    );
    const team2Player1KFactor = this.determineKFactor(
      matchType, tournamentLevel, tournamentRound, team2Player1Rating.matchesPlayed
    );
    const team2Player2KFactor = this.determineKFactor(
      matchType, tournamentLevel, tournamentRound, team2Player2Rating.matchesPlayed
    );
    
    // Calculate individual contribution factors for players
    // More experienced players have higher contribution factors
    const team1Player1Contribution = this.calculateContributionFactor(team1Player1Rating.matchesPlayed);
    const team1Player2Contribution = this.calculateContributionFactor(team1Player2Rating.matchesPlayed);
    const team2Player1Contribution = this.calculateContributionFactor(team2Player1Rating.matchesPlayed);
    const team2Player2Contribution = this.calculateContributionFactor(team2Player2Rating.matchesPlayed);
    
    // Normalize contributions within teams
    const team1Total = team1Player1Contribution + team1Player2Contribution;
    const team2Total = team2Player1Contribution + team2Player2Contribution;
    
    const team1Player1NormalizedContribution = team1Player1Contribution / team1Total;
    const team1Player2NormalizedContribution = team1Player2Contribution / team1Total;
    const team2Player1NormalizedContribution = team2Player1Contribution / team2Total;
    const team2Player2NormalizedContribution = team2Player2Contribution / team2Total;
    
    // Calculate rating changes based on team average rating
    // but adjust based on individual contribution
    
    // Team 1 Player 1
    const team1Player1Update = this.calculateRatingChange(
      team1Player1Rating.rating,
      team2AverageRating,
      team1Outcome,
      team1Player1KFactor
    );
    
    // Adjust based on contribution
    team1Player1Update.ratingChange = Math.round(
      team1Player1Update.ratingChange * (0.5 + (team1Player1NormalizedContribution * 0.5))
    );
    
    // Team 1 Player 2
    const team1Player2Update = this.calculateRatingChange(
      team1Player2Rating.rating,
      team2AverageRating,
      team1Outcome,
      team1Player2KFactor
    );
    
    // Adjust based on contribution
    team1Player2Update.ratingChange = Math.round(
      team1Player2Update.ratingChange * (0.5 + (team1Player2NormalizedContribution * 0.5))
    );
    
    // Team 2 Player 1
    const team2Player1Update = this.calculateRatingChange(
      team2Player1Rating.rating,
      team1AverageRating,
      team2Outcome,
      team2Player1KFactor
    );
    
    // Adjust based on contribution
    team2Player1Update.ratingChange = Math.round(
      team2Player1Update.ratingChange * (0.5 + (team2Player1NormalizedContribution * 0.5))
    );
    
    // Team 2 Player 2
    const team2Player2Update = this.calculateRatingChange(
      team2Player2Rating.rating,
      team1AverageRating,
      team2Outcome,
      team2Player2KFactor
    );
    
    // Adjust based on contribution
    team2Player2Update.ratingChange = Math.round(
      team2Player2Update.ratingChange * (0.5 + (team2Player2NormalizedContribution * 0.5))
    );
    
    // Apply cross-skill partnership protection
    // If there's a big skill gap between partners, limit rating loss for stronger player
    this.applyPartnershipProtection(team1Player1Update, team1Player1Rating.rating, team1Player2Rating.rating);
    this.applyPartnershipProtection(team1Player2Update, team1Player2Rating.rating, team1Player1Rating.rating);
    this.applyPartnershipProtection(team2Player1Update, team2Player1Rating.rating, team2Player2Rating.rating);
    this.applyPartnershipProtection(team2Player2Update, team2Player2Rating.rating, team2Player1Rating.rating);
    
    // Apply rating changes
    await this.applyRatingChange(
      team1Player1Rating.id,
      team1Player1Update.ratingChange,
      null, // Match ID
      "match_result",
      team1Player1KFactor,
      team1Player1Update.expectedOutcome,
      team1Player1Update.actualOutcome,
      `${format} match with partner ${team1Player2Id} vs ${team2Player1Id}/${team2Player2Id}`
    );
    
    await this.applyRatingChange(
      team1Player2Rating.id,
      team1Player2Update.ratingChange,
      null, // Match ID
      "match_result",
      team1Player2KFactor,
      team1Player2Update.expectedOutcome,
      team1Player2Update.actualOutcome,
      `${format} match with partner ${team1Player1Id} vs ${team2Player1Id}/${team2Player2Id}`
    );
    
    await this.applyRatingChange(
      team2Player1Rating.id,
      team2Player1Update.ratingChange,
      null, // Match ID
      "match_result",
      team2Player1KFactor,
      team2Player1Update.expectedOutcome,
      team2Player1Update.actualOutcome,
      `${format} match with partner ${team2Player2Id} vs ${team1Player1Id}/${team1Player2Id}`
    );
    
    await this.applyRatingChange(
      team2Player2Rating.id,
      team2Player2Update.ratingChange,
      null, // Match ID
      "match_result",
      team2Player2KFactor,
      team2Player2Update.expectedOutcome,
      team2Player2Update.actualOutcome,
      `${format} match with partner ${team2Player1Id} vs ${team1Player1Id}/${team1Player2Id}`
    );
    
    // Award points to winning team members
    const basePoints = this.determineBasePoints(matchType, tournamentLevel, tournamentRound);
    
    if (winningTeamId === 1) {
      // Calculate opponent strength multiplier
      const strengthMultiplier = this.calculateOpponentStrengthMultiplier(team1AverageRating, team2AverageRating);
      
      // Award points to team 1
      await this.awardRankingPoints(
        team1Player1Id,
        basePoints,
        division,
        format,
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `${format} victory with partner ${team1Player2Id}`
      );
      
      await this.awardRankingPoints(
        team1Player2Id,
        basePoints,
        division,
        format,
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `${format} victory with partner ${team1Player1Id}`
      );
    } else {
      // Calculate opponent strength multiplier
      const strengthMultiplier = this.calculateOpponentStrengthMultiplier(team2AverageRating, team1AverageRating);
      
      // Award points to team 2
      await this.awardRankingPoints(
        team2Player1Id,
        basePoints,
        division,
        format,
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `${format} victory with partner ${team2Player2Id}`
      );
      
      await this.awardRankingPoints(
        team2Player2Id,
        basePoints,
        division,
        format,
        "match_win",
        undefined, // Match ID - use undefined instead of null
        strengthMultiplier,
        `${format} victory with partner ${team2Player1Id}`
      );
    }
  }
  
  /**
   * Calculate player contribution factor based on experience
   */
  private calculateContributionFactor(matchesPlayed: number): number {
    // For new players, contribution is lower
    // For experienced players, contribution is higher
    // Contribution factor ranges from 0.5 to 1.0
    
    if (matchesPlayed < 20) {
      return 0.5 + (matchesPlayed * 0.025); // 0.5 to 1.0 over 20 matches
    }
    
    return 1.0;
  }
  
  /**
   * Apply partnership protection for rating loss
   * This prevents excessive rating loss when playing with a much weaker partner
   */
  private applyPartnershipProtection(
    ratingUpdate: { ratingChange: number, expectedOutcome: number, actualOutcome: number },
    playerRating: number,
    partnerRating: number
  ): void {
    // Only apply for rating losses
    if (ratingUpdate.ratingChange >= 0) {
      return;
    }
    
    // Calculate rating gap
    const ratingGap = playerRating - partnerRating;
    
    // If player is substantially stronger than partner
    if (ratingGap > 200) {
      // Apply protection factor based on gap size
      const protectionFactor = Math.min(ratingGap / 500, 0.75); // Max 75% protection
      
      // Reduce rating loss
      ratingUpdate.ratingChange = Math.round(
        ratingUpdate.ratingChange * (1 - protectionFactor)
      );
    }
  }

  /**
   * Calculate ranking points for a match based on match type, event tier, and rating differential
   * @param matchData Match data including players, outcome, context
   * @returns Object containing point calculation details
   */
  /**
   * Calculate ranking points for a match with updated conservative point allocation
   */
  async calculateRankingPointsForMatch(matchData: {
    matchType: string;                      // "casual", "league", "tournament"
    eventTier?: string;                     // "local", "regional", "national", "international"
    winner: {
      userId: number;
      division: string;
      format: string;
    };
    loser: {
      userId: number;
      division: string;
      format: string;
    };
    tournamentFormat?: {                    // New tournament format information
      stageType?: string;                   // "round_robin", "qualifying", "knockout", "consolation"
      isFirstRound?: boolean;               // Whether this is a first round match
      isFinal?: boolean;                    // Whether this is a tournament final match
      isSemiFinal?: boolean;                // Whether this is a tournament semi-final
      roundNumber?: number;                 // Round number in the tournament
      stageCompleted?: boolean;             // Whether a complete stage was completed (e.g., qualified for main draw)
    };
    participantCount?: number;              // Number of participants in the event
    matchQuality?: {                        // Match quality information
      scorePointDifferential?: number;      // Point differential in the final game
      qualityMultiplier?: number;           // Pre-calculated match quality multiplier (0.9, 1.0, 1.1)
    };
  }): Promise<{
    total: number;
    base: number;
    ratingBonus: number;
    stageMultiplier: number;
    qualityMultiplier: number;
    basePointsExplanation: string;
    bonusExplanation: string;
    contextualFactors: string[];
  }> {
    // Get player ratings
    const winnerRating = await this.getPlayerRating(
      matchData.winner.userId,
      matchData.winner.division,
      matchData.winner.format
    );
    
    const loserRating = await this.getPlayerRating(
      matchData.loser.userId,
      matchData.loser.division,
      matchData.loser.format
    );
    
    if (!winnerRating || !loserRating) {
      throw new Error("Player ratings not found");
    }
    
    // Base points based on match type and event tier with the new conservative values
    let basePoints: number;
    let basePointsExplanation: string;
    
    // Base point structure from our updated conservative guidelines
    switch (matchData.matchType) {
      case "casual":
        basePoints = 2; // Reduced from 10 to 2
        basePointsExplanation = "Casual match victory";
        break;
      case "league":
        if (matchData.eventTier === "premium" || matchData.eventTier === "regional") {
          basePoints = 10; // Reduced from 30 to 10
          basePointsExplanation = "Premium/Regional league match victory";
        } else {
          basePoints = 5; // Reduced from 20 to 5
          basePointsExplanation = "Local league match victory";
        }
        break;
      case "tournament":
        switch (matchData.eventTier) {
          case "local":
            basePoints = 8; // Reduced from 25 to 8
            basePointsExplanation = "Local tournament match victory";
            break;
          case "regional":
            basePoints = 15; // Reduced from 40 to 15
            basePointsExplanation = "Regional tournament match victory";
            break;
          case "national":
            basePoints = 30; // Reduced from 70 to 30
            basePointsExplanation = "National tournament match victory";
            break;
          case "international":
            basePoints = 60; // Reduced from 100 to 60
            basePointsExplanation = "International tournament match victory";
            break;
          default:
            basePoints = 8; // Default to local tournament
            basePointsExplanation = "Tournament match victory";
        }
        break;
      default:
        basePoints = 2; // Default to casual match
        basePointsExplanation = "Match victory";
    }
    
    // Calculate rating differential bonus
    const ratingDiff = Math.max(0, loserRating.rating - winnerRating.rating);
    
    // Apply the reduced rating differential bonus (0.5 per 50 points)
    const ratingBonus = Math.floor(ratingDiff / 50) * 0.5;
    const roundedRatingBonus = Math.round(ratingBonus * 2) / 2; // Round to nearest 0.5
    
    // Generate explanation for the bonus
    let bonusExplanation = "";
    if (roundedRatingBonus > 0) {
      bonusExplanation = `Upset bonus: +${roundedRatingBonus} points for defeating a player rated ${ratingDiff} points higher`;
    } else {
      bonusExplanation = "No rating differential bonus";
    }
    
    // Stage multiplier for tournament format types
    let stageMultiplier = 1.0;
    const isTournament = matchData.matchType === "tournament";
    const tournamentFormat = matchData.tournamentFormat || {};
    const isTournamentFinal = tournamentFormat.isFinal || false;
    const isSemiFinal = tournamentFormat.isSemiFinal || false;
    
    // Additional contextual factors
    const contextualFactors: string[] = [];
    
    // Apply tournament stage multipliers
    if (isTournament) {
      if (tournamentFormat.stageType === "round_robin") {
        stageMultiplier = 0.5; // 50% of base points for round robin matches
        contextualFactors.push(`Round robin match: base points × 0.5`);
      } else if (tournamentFormat.stageType === "qualifying") {
        stageMultiplier = 0.4; // 40% of base points for qualifying matches
        contextualFactors.push(`Qualifying match: base points × 0.4`);
        
        // Add qualifying bonus if applicable
        if (tournamentFormat.stageCompleted) {
          // This would be handled separately in a different method that awards a one-time bonus
          contextualFactors.push(`Qualified for main draw (bonus awarded separately)`);
        }
      } else if (tournamentFormat.stageType === "consolation") {
        stageMultiplier = 0.3; // 30% of base points for consolation matches
        contextualFactors.push(`Consolation match: base points × 0.3`);
      } else if (isTournamentFinal) {
        stageMultiplier = 2.0; // 200% for finals
        contextualFactors.push(`Tournament final: base points × 2.0`);
      } else if (isSemiFinal) {
        stageMultiplier = 1.5; // 150% for semifinals
        contextualFactors.push(`Tournament semi-final: base points × 1.5`);
      } else if (tournamentFormat.roundNumber) {
        // Apply round-based multipliers for knockout stages
        const roundNumber = tournamentFormat.roundNumber;
        if (roundNumber >= 3) { // Quarterfinals or later
          stageMultiplier = 1.2; // 120% for quarterfinals and beyond
          contextualFactors.push(`Advanced tournament round: base points × 1.2`);
        }
      }
    }
    
    // Apply match quality multiplier
    let qualityMultiplier = 1.0;
    if (matchData.matchQuality) {
      if (matchData.matchQuality.qualityMultiplier) {
        qualityMultiplier = matchData.matchQuality.qualityMultiplier;
      } else if (matchData.matchQuality.scorePointDifferential !== undefined) {
        const differential = matchData.matchQuality.scorePointDifferential;
        if (differential <= 2) {
          qualityMultiplier = 1.1; // Close match bonus
          contextualFactors.push(`Close match: total points × 1.1`);
        } else if (differential >= 7) {
          qualityMultiplier = 0.9; // Decisive victory adjustment
          contextualFactors.push(`Decisive victory: total points × 0.9`);
        }
      }
    }
    
    // Participant count scaling (retained from previous implementation)
    if (matchData.participantCount && matchData.participantCount > 20) {
      const sizeMultiplier = Math.min(0.8 + (matchData.participantCount / 100), 1.2);
      if (sizeMultiplier > 1.0) {
        contextualFactors.push(`Large event bonus: total points × ${sizeMultiplier.toFixed(2)} (${matchData.participantCount} participants)`);
        qualityMultiplier *= sizeMultiplier;
      }
    }
    
    // Calculate adjusted base points with stage multiplier
    const adjustedBasePoints = basePoints * stageMultiplier;
    
    // Calculate total points before quality multiplier
    const subtotal = adjustedBasePoints + roundedRatingBonus;
    
    // Apply quality multiplier to the total
    const total = Math.round(subtotal * qualityMultiplier * 10) / 10; // Round to nearest 0.1
    
    return {
      total,
      base: basePoints,
      ratingBonus: roundedRatingBonus,
      stageMultiplier,
      qualityMultiplier,
      basePointsExplanation,
      bonusExplanation,
      contextualFactors
    };
  }

  /**
   * Calculate and award points for a losing player
   * Implements the losers points system for inclusivity
   */
  async calculateLoserPoints(
    matchData: {
      matchType: string;                  // "casual", "league", "tournament"
      eventTier?: string;                 // "local", "regional", "national", "international"
      winnerId: number;                   // ID of the winning player (needed for reference)
      loserId: number;                    // ID of the losing player
      division: string;                   // Age division
      format: string;                     // Format type (singles, doubles, etc.)
      pointsWinnerReceived: number;       // How many points the winner received
      tournamentFormat?: {
        stageType?: string;               // "round_robin", "qualifying", "knockout", "consolation"
        isFirstRound?: boolean;           // Whether this is a first round match
        isFinal?: boolean;                // Whether this is a tournament final match
      };
      matchQuality?: {
        scorePointDifferential?: number;  // Score differential
        qualityMultiplier?: number;       // Pre-calculated quality multiplier
      };
    }
  ): Promise<{
    points: number;
    explanation: string;
  }> {
    let basePoints = 0;
    let pointsExplanation = "";
    let loserRatio = 0; // Percentage of winner's points
    
    // Determine percentage of winner's points based on match context
    if (matchData.tournamentFormat?.isFinal) {
      // Tournament runner-up gets significant points
      loserRatio = 0.6; // 60% of winner's points
      pointsExplanation = "Tournament runner-up";
    } else if (matchData.matchType === "casual") {
      loserRatio = 0.25; // 25% of winner's points (0.5 points for 2-point casual matches)
      pointsExplanation = "Casual match participation";
    } else if (matchData.matchType === "league") {
      loserRatio = 0.2; // 20% of winner's points
      pointsExplanation = "League match participation";
    } else if (matchData.matchType === "tournament") {
      if (matchData.tournamentFormat?.isFirstRound) {
        loserRatio = 0.2; // 20% for first round loss
        pointsExplanation = "Tournament first round participation";
      } else {
        loserRatio = 0.25; // 25% for later round loss
        pointsExplanation = "Tournament match participation";
      }
    }
    
    // Calculate base points
    basePoints = matchData.pointsWinnerReceived * loserRatio;
    
    // Apply match quality multiplier for losers if available
    let qualityMultiplier = 1.0;
    if (matchData.matchQuality) {
      if (matchData.matchQuality.qualityMultiplier) {
        qualityMultiplier = matchData.matchQuality.qualityMultiplier;
      } else if (matchData.matchQuality.scorePointDifferential !== undefined) {
        const differential = matchData.matchQuality.scorePointDifferential;
        if (differential <= 2) {
          // Close match - both players get bonus
          qualityMultiplier = 1.1;
          pointsExplanation += " (close match bonus +10%)";
        } else if (differential >= 7) {
          // Decisive loss - loser actually gets a bonus for learning opportunity
          qualityMultiplier = 1.1;
          pointsExplanation += " (competitive learning bonus +10%)";
        }
      }
    }
    
    // Calculate final points with multiplier
    const points = Math.round(basePoints * qualityMultiplier * 10) / 10; // Round to nearest 0.1
    
    // Award the points to the loser
    // Award points to the loser (with correct arguments for awardRankingPoints)
    await this.awardRankingPoints(
      matchData.loserId,
      points,
      matchData.division,
      matchData.format,
      "match_participation",
      undefined, // sourceId
      qualityMultiplier,
      pointsExplanation
    );
    
    return { points, explanation: pointsExplanation };
  }
  
  /**
   * Award ranking points with enhanced tracking of rating differentials
   * Extended version of the basic awardRankingPoints method
   */
  async awardEnhancedRankingPoints(
    userId: number,
    pointsDetails: {
      total: number;
      base: number;
      ratingBonus: number;
      basePointsExplanation: string;
      bonusExplanation: string;
      contextualFactors: string[];
    },
    division: string,
    format: string,
    source: string,
    matchType: string,
    eventTier?: string,
    winType?: string,
    sourceId?: number,
    ratingDifferential?: number,
    multiplier: number = 1.0,
    notes?: string
  ): Promise<void> {
    // Get current season
    const currentSeason = await this.getCurrentSeason();
    
    if (!currentSeason) {
      throw new Error("No active season found");
    }
    
    // Calculate points with multiplier (if any additional multiplier is applied)
    const adjustedTotal = Math.round(pointsDetails.total * multiplier);
    
    // Record enhanced points history
    const pointsRecord: InsertPointsHistory = {
      userId,
      points: adjustedTotal,
      season: currentSeason.code,
      division,
      format,
      source,
      sourceId,
      // Convert multiplier to string for the schema
      multiplier: multiplier.toString(),
      notes,
      // Enhanced fields
      basePoints: pointsDetails.base,
      ratingDifferential,
      bonusPoints: pointsDetails.ratingBonus,
      bonusSource: pointsDetails.bonusExplanation,
      eventTier,
      matchType,
      winType
    };
    
    await db.insert(pointsHistory).values(pointsRecord);
    
    // Update total points for the season
    const existingPoints = await db.query.rankingPoints.findFirst({
      where: and(
        eq(rankingPoints.userId, userId),
        eq(rankingPoints.season, currentSeason.code),
        eq(rankingPoints.division, division),
        eq(rankingPoints.format, format)
      )
    });
    
    if (existingPoints) {
      // Update existing record with enhanced tracking
      await db.update(rankingPoints)
        .set({
          points: existingPoints.points + adjustedTotal,
          lastUpdated: new Date(),
          totalMatches: existingPoints.totalMatches + 1,
          winsCount: existingPoints.winsCount + 1,
          // Update tournament count if this is a tournament match
          tournamentCount: matchType === "tournament" 
            ? (existingPoints.tournamentCount || 0) + 1 
            : existingPoints.tournamentCount || 0,
          // Update high watermarks if applicable
          seasonHighPoints: Math.max(existingPoints.points + adjustedTotal, existingPoints.seasonHighPoints || 0),
          allTimeHighPoints: Math.max(existingPoints.points + adjustedTotal, existingPoints.allTimeHighPoints || 0)
        })
        .where(eq(rankingPoints.id, existingPoints.id));
    } else {
      // Create new record with enhanced fields
      const newPoints: InsertRankingPoints = {
        userId,
        points: adjustedTotal,
        season: currentSeason.code,
        division,
        format,
        totalMatches: 1,
        winsCount: 1,
        lossesCount: 0,
        tournamentCount: matchType === "tournament" ? 1 : 0,
        seasonHighPoints: adjustedTotal,
        allTimeHighPoints: adjustedTotal,
        tier: this.getCompetitiveTierForPoints(adjustedTotal)
      };
      
      await db.insert(rankingPoints).values(newPoints);
    }
    
    // Fire event
    await serverEventBus.publish(CourtIQEvents.POINTS_EARNED, {
      userId,
      points: adjustedTotal,
      season: currentSeason.code,
      division,
      format,
      source,
      details: pointsDetails
    });
  }

  /**
   * Determine competitive tier based on accumulated points
   * This is different from rating tiers and used for ranking displays
   */
  private getCompetitiveTierForPoints(points: number): string {
    if (points < 100) return "Novice";
    if (points < 250) return "Contender";
    if (points < 500) return "Competitor";
    if (points < 1000) return "Elite";
    if (points < 2000) return "Master";
    return "Champion";
  }
  
  /**
   * Calculate match quality multiplier based on score differential
   * @param scoreWinner The score of the winning player/team
   * @param scoreLoser The score of the losing player/team  
   * @param isWinner Whether this calculation is for the winner (affects multiplier value)
   * @returns Match quality multiplier (0.9, 1.0, or 1.1)
   */
  calculateMatchQualityMultiplier(
    scoreWinner: string,
    scoreLoser: string,
    isWinner: boolean
  ): number {
    try {
      // Parse scores to get the final game difference
      const parseGameScore = (scoreStr: string): number[] => {
        return scoreStr.split('-').map(s => {
          const num = parseInt(s.trim(), 10);
          return isNaN(num) ? 0 : num;
        });
      };
      
      const winnerGames = parseGameScore(scoreWinner);
      const loserGames = parseGameScore(scoreLoser);
      
      if (winnerGames.length === 0 || loserGames.length === 0) {
        return 1.0; // Default multiplier if parsing fails
      }
      
      // Get the last game scores (final game of the match)
      const lastGameWinner = winnerGames[winnerGames.length - 1] || 0;
      const lastGameLoser = loserGames[loserGames.length - 1] || 0;
      
      // Calculate point differential in the final game
      const differential = Math.abs(lastGameWinner - lastGameLoser);
      
      if (differential <= 2) {
        // Close match: Both players get 1.1x (winner and loser)
        return 1.1;
      } else if (differential >= 7) {
        // Decisive victory:
        // Winner gets 0.9x (slightly reduced as it wasn't highly competitive)
        // Loser gets 1.1x (learning bonus for playing a much better opponent)
        return isWinner ? 0.9 : 1.1;
      }
      
      return 1.0; // Default: no adjustment for normal matches
    } catch (error) {
      console.error("Error calculating match quality multiplier:", error);
      return 1.0; // Default to no adjustment on error
    }
  }

  /**
   * Check if a player is eligible for a tournament based on their rating and ranking points
   */
  async checkTournamentEligibility(
    userId: number,
    tournamentData: {
      id: number;
      name: string;
      division: string;
      format: string;
      level: string; // "open", "local", "regional", "national", "premier"
      ratingRequirement?: number;
      pointsRequirement?: number;
    }
  ): Promise<{
    isEligible: boolean;
    meetsRatingReq: boolean;
    meetsPointsReq: boolean;
    qualifiesByExceptionalSkill: boolean;
    qualifiesByProvenCompetitor: boolean;
    userRating: number;
    userRankingPoints: number;
    qualificationPath: string;
    requirementDetails: {
      ratingRequirement: number;
      pointsRequirement: number;
      exceptionalSkillRatingBonus: number;
      exceptionalSkillPointsPercentage: number;
      provenCompetitorPointsBonus: number;
      provenCompetitorRatingPercentage: number;
    };
  }> {
    // If no specific requirements provided, check the tournament eligibility table
    let eligibilityConfig;
    
    if (!tournamentData.ratingRequirement || !tournamentData.pointsRequirement) {
      eligibilityConfig = await db.query.tournamentEligibility.findFirst({
        where: eq(tournamentEligibility.level, tournamentData.level)
      });
      
      if (!eligibilityConfig) {
        // No configuration found, use default requirements based on level
        eligibilityConfig = this.getDefaultTournamentRequirements(tournamentData.level);
      }
    } else {
      // Use provided requirements
      eligibilityConfig = {
        ratingRequirement: tournamentData.ratingRequirement,
        pointsRequirement: tournamentData.pointsRequirement,
        exceptionalSkillRatingBonus: 200,
        exceptionalSkillPointsPercentage: 60,
        provenCompetitorPointsBonus: 150,
        provenCompetitorRatingPercentage: 80,
        name: tournamentData.name,
        level: tournamentData.level
      };
    }
    
    // Get player rating
    const playerRating = await this.getPlayerRating(
      userId, 
      tournamentData.division, 
      tournamentData.format
    );
    
    if (!playerRating) {
      throw new Error(`Rating not found for player ${userId} in ${tournamentData.division} ${tournamentData.format}`);
    }
    
    // Get current season
    const currentSeason = await this.getCurrentSeason();
    
    if (!currentSeason) {
      throw new Error("No active season found");
    }
    
    // Get player ranking points
    const playerRankingPoints = await db.query.rankingPoints.findFirst({
      where: and(
        eq(rankingPoints.userId, userId),
        eq(rankingPoints.season, currentSeason.code),
        eq(rankingPoints.division, tournamentData.division),
        eq(rankingPoints.format, tournamentData.format)
      )
    });
    
    const points = playerRankingPoints?.points || 0;
    
    // Get rating and points requirements with type safety
    const ratingRequirement = eligibilityConfig.ratingRequirement || 0;
    const pointsRequirement = eligibilityConfig.pointsRequirement || 0;
    const exceptionalSkillRatingBonus = eligibilityConfig.exceptionalSkillRatingBonus || 200;
    const exceptionalSkillPointsPercentage = eligibilityConfig.exceptionalSkillPointsPercentage || 60;
    const provenCompetitorPointsBonus = eligibilityConfig.provenCompetitorPointsBonus || 150;
    const provenCompetitorRatingPercentage = eligibilityConfig.provenCompetitorRatingPercentage || 80;
    
    // Check standard eligibility
    const meetsRatingReq = playerRating.rating >= ratingRequirement;
    const meetsPointsReq = points >= pointsRequirement;
    
    // Check exceptional skill path - high rating can compensate for lower points
    const exceptionalSkillRatingReq = ratingRequirement + exceptionalSkillRatingBonus;
    const exceptionalSkillPointsReq = Math.floor(pointsRequirement * (exceptionalSkillPointsPercentage / 100));
    
    const qualifiesByExceptionalSkill = 
      (playerRating.rating >= exceptionalSkillRatingReq) && 
      (points >= exceptionalSkillPointsReq);
    
    // Check proven competitor path - high points can compensate for lower rating
    const provenCompetitorPointsReq = Math.floor(pointsRequirement * (1 + provenCompetitorPointsBonus / 100));
    const provenCompetitorRatingReq = Math.floor(ratingRequirement * (provenCompetitorRatingPercentage / 100));
    
    const qualifiesByProvenCompetitor = 
      (points >= provenCompetitorPointsReq) && 
      (playerRating.rating >= provenCompetitorRatingReq);
    
    // Overall eligibility
    const isEligible = 
      (meetsRatingReq && meetsPointsReq) || 
      qualifiesByExceptionalSkill || 
      qualifiesByProvenCompetitor;
    
    // Determine qualification path for display
    let qualificationPath = "Not Eligible";
    
    if (meetsRatingReq && meetsPointsReq) {
      qualificationPath = "Standard Qualification";
    } else if (qualifiesByExceptionalSkill) {
      qualificationPath = "Exceptional Skill Qualification";
    } else if (qualifiesByProvenCompetitor) {
      qualificationPath = "Proven Competitor Qualification";
    }
    
    return {
      isEligible,
      meetsRatingReq,
      meetsPointsReq,
      qualifiesByExceptionalSkill,
      qualifiesByProvenCompetitor,
      userRating: playerRating.rating,
      userRankingPoints: points,
      qualificationPath,
      requirementDetails: {
        ratingRequirement,
        pointsRequirement,
        exceptionalSkillRatingBonus,
        exceptionalSkillPointsPercentage,
        provenCompetitorPointsBonus,
        provenCompetitorRatingPercentage
      }
    };
  }

  /**
   * Get default tournament requirements when no specific configuration exists
   */
  private getDefaultTournamentRequirements(level: string): {
    ratingRequirement: number;
    pointsRequirement: number;
    exceptionalSkillRatingBonus: number;
    exceptionalSkillPointsPercentage: number;
    provenCompetitorPointsBonus: number;
    provenCompetitorRatingPercentage: number;
    name: string;
    level: string;
  } {
    switch (level) {
      case "open":
        return {
          ratingRequirement: 0,
          pointsRequirement: 0,
          exceptionalSkillRatingBonus: 0,
          exceptionalSkillPointsPercentage: 0,
          provenCompetitorPointsBonus: 0,
          provenCompetitorRatingPercentage: 0,
          name: "Open Play",
          level: "open"
        };
      case "local":
        return {
          ratingRequirement: 1300,
          pointsRequirement: 100,
          exceptionalSkillRatingBonus: 200,
          exceptionalSkillPointsPercentage: 60,
          provenCompetitorPointsBonus: 150,
          provenCompetitorRatingPercentage: 80,
          name: "Local Championship",
          level: "local"
        };
      case "regional":
        return {
          ratingRequirement: 1500,
          pointsRequirement: 250,
          exceptionalSkillRatingBonus: 200,
          exceptionalSkillPointsPercentage: 60,
          provenCompetitorPointsBonus: 150,
          provenCompetitorRatingPercentage: 80,
          name: "Regional Championship",
          level: "regional"
        };
      case "national":
        return {
          ratingRequirement: 1800,
          pointsRequirement: 600,
          exceptionalSkillRatingBonus: 200,
          exceptionalSkillPointsPercentage: 60,
          provenCompetitorPointsBonus: 150,
          provenCompetitorRatingPercentage: 80,
          name: "National Championship",
          level: "national"
        };
      case "premier":
        return {
          ratingRequirement: 2000,
          pointsRequirement: 1000,
          exceptionalSkillRatingBonus: 200,
          exceptionalSkillPointsPercentage: 60,
          provenCompetitorPointsBonus: 150,
          provenCompetitorRatingPercentage: 80,
          name: "Premier Invitational",
          level: "premier"
        };
      default:
        return {
          ratingRequirement: 0,
          pointsRequirement: 0,
          exceptionalSkillRatingBonus: 200,
          exceptionalSkillPointsPercentage: 60,
          provenCompetitorPointsBonus: 150,
          provenCompetitorRatingPercentage: 80,
          name: "Default Tournament",
          level: level
        };
    }
  }
}

// Export singleton instance
export const courtIQService = new CourtIQService();

// Register event handlers
serverEventBus.subscribe(ServerEvents.USER_CREATED, async (data: { userId: number }) => {
  try {
    // Initialize ratings for new user
    await courtIQService.initializePlayer(data.userId);
  } catch (error) {
    console.error("Error initializing player ratings:", error);
  }
});

// Export event names
export const CourtIQEvents = {
  PLAYER_INITIALIZED: "courtiq:player_initialized",
  RATING_CHANGED: "courtiq:rating_changed",
  TIER_CHANGED: "courtiq:tier_changed",
  POINTS_EARNED: "courtiq:points_earned",
  SEASON_STARTED: "courtiq:season_started",
  SEASON_ENDED: "courtiq:season_ended"
};