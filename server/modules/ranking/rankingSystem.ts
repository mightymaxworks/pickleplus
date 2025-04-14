/**
 * CourtIQ™ Ranking System
 * 
 * This module handles the competitive ranking system for Pickle+, which tracks player standing
 * across different divisions (age groups) and formats (singles, doubles, mixed).
 * 
 * The ranking system uses a points-based algorithm with adjustments for:
 * - Match format (singles vs doubles)
 * - Tournament vs casual play
 * - Event tier (local, regional, national)
 * - Opponent difficulty
 * - Score differentials
 * - Seasonal decay
 * 
 * Ranking points are used for tournament qualification and seasonal leaderboards.
 */

import { db } from "../../db";
import { 
  eq, and, or, sql, desc, asc, gt, lt, gte, lte, 
  isNull, inArray, not, between
} from "drizzle-orm";
import { serverEventBus } from "../../core/events/eventBus";
import { users, rankingHistory, matches, tournaments } from "../../../shared/schema";
import { 
  rankingPoints,
  playerRatings,
  rankingTiers,
  type RankingTier
} from "../../../shared/courtiq-schema";
import { xpSystem } from "../xp/xpSystem";
import { Division, Format } from "../rating/ratingSystem";
import { tierRulesSystem } from "../rating/tierRules";

// Export events that other modules can listen for
export const CourtIQRankingEvents = {
  POINTS_AWARDED: "courtiq.ranking.points_awarded" as const,
  TIER_CHANGED: "courtiq.ranking.tier_changed" as const,
  QUALIFICATION_ACHIEVED: "courtiq.ranking.qualification_achieved" as const,
  SEASON_ENDED: "courtiq.ranking.season_ended" as const
};

// Competitive ranking tiers (different from skill rating tiers)
export enum CompetitiveTier {
  CHALLENGER = "challenger",
  CONTENDER = "contender",
  ELITE = "elite",
  MASTER = "master",
  GRANDMASTER = "grandmaster"
}

// Match types
export enum MatchType {
  CASUAL = "casual",
  LEAGUE = "league",
  TOURNAMENT = "tournament"
}

// Event tiers
export enum EventTier {
  LOCAL = "local",         // Local events, casual tournaments
  REGIONAL = "regional",   // Regional events, state tournaments
  NATIONAL = "national",   // National events, major tournaments
  MAJOR = "major"          // Premier events, professional tournaments
}

// Point allocation structure
interface PointAllocation {
  base: number;                // Base points
  winBonus: number;            // Additional points for winning
  qualityFactor: number;       // Multiplier based on opponent quality
  matchTypeMultiplier: number; // Multiplier based on match type
  eventTierMultiplier: number; // Multiplier based on event importance
  formatMultiplier: number;    // Multiplier for singles vs doubles
}

// Base points by match type
const BASE_POINTS: Record<MatchType, number> = {
  [MatchType.CASUAL]: 5,
  [MatchType.LEAGUE]: 10,
  [MatchType.TOURNAMENT]: 15
};

// Win bonuses by match type
const WIN_BONUS: Record<MatchType, number> = {
  [MatchType.CASUAL]: 5,
  [MatchType.LEAGUE]: 10,
  [MatchType.TOURNAMENT]: 15
};

// Event tier multipliers
const EVENT_TIER_MULTIPLIERS: Record<EventTier, number> = {
  [EventTier.LOCAL]: 1.0,
  [EventTier.REGIONAL]: 1.5,
  [EventTier.NATIONAL]: 2.0,
  [EventTier.MAJOR]: 3.0
};

// Format multipliers
const FORMAT_MULTIPLIERS: Record<Format, number> = {
  [Format.SINGLES]: 1.2,
  [Format.MENS_DOUBLES]: 1.0,
  [Format.WOMENS_DOUBLES]: 1.0,
  [Format.MIXED_DOUBLES]: 1.0
};

// Quality Factors: How many points to award for beating higher/lower rated players
const QUALITY_FACTORS = {
  MUCH_HIGHER: 1.5,  // Opponent 300+ points higher
  HIGHER: 1.25,      // Opponent 100-299 points higher
  EVEN: 1.0,         // Opponent within 100 points
  LOWER: 0.75,       // Opponent 100-299 points lower
  MUCH_LOWER: 0.5    // Opponent 300+ points lower
};

// Decay settings
const DECAY_SETTINGS = {
  RATE_PER_WEEK: 0.05,    // 5% decay per week of inactivity
  GRACE_PERIOD_DAYS: 14,  // No decay for 14 days
  MAX_DECAY: 0.50,        // Maximum 50% decay
  PROTECTION_PERIOD: 30   // New/returning players protected for 30 days
};

// Tier threshold values - competitive tiers based on ranking points
const TIER_THRESHOLDS: Record<CompetitiveTier, number> = {
  [CompetitiveTier.CHALLENGER]: 0,        // 0+ points
  [CompetitiveTier.CONTENDER]: 500,       // 500+ points
  [CompetitiveTier.ELITE]: 1500,          // 1500+ points
  [CompetitiveTier.MASTER]: 3000,         // 3000+ points
  [CompetitiveTier.GRANDMASTER]: 6000     // 6000+ points
};

// Current season identifier
const CURRENT_SEASON = "2025-S1"; // 2025 Season 1

/**
 * The main Ranking System class
 */
export class RankingSystem {
  constructor() {}

  /**
   * Initialize ranking tiers in the database
   * This only needs to be called once during system setup
   */
  async initializeRankingTiersInDatabase(): Promise<void> {
    // Check if tiers already exist
    const existingTiers = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*) as count FROM ranking_tiers`
    );
    
    if (existingTiers[0] && existingTiers[0].count > 0) {
      console.log(`Ranking tiers already initialized (${existingTiers[0].count} tiers found)`);
      return;
    }
    
    // Define the tiers
    const tiers: RankingTier[] = [
      {
        id: 1,
        name: CompetitiveTier.CHALLENGER,
        description: "The starting tier for all players",
        minPoints: TIER_THRESHOLDS[CompetitiveTier.CHALLENGER],
        maxPoints: TIER_THRESHOLDS[CompetitiveTier.CONTENDER] - 1,
        badgeUrl: null,
        colorCode: "#8D99AE", // Slate Gray
        order: 1,
        benefits: ["Participation in local tournaments"]
      },
      {
        id: 2,
        name: CompetitiveTier.CONTENDER,
        description: "Regular competitive players",
        minPoints: TIER_THRESHOLDS[CompetitiveTier.CONTENDER],
        maxPoints: TIER_THRESHOLDS[CompetitiveTier.ELITE] - 1,
        badgeUrl: null,
        colorCode: "#2B2D42", // Dark Blue
        order: 2,
        benefits: ["Automatic qualification for regional events", "Priority registration"]
      },
      {
        id: 3,
        name: CompetitiveTier.ELITE,
        description: "Elevated competitive status",
        minPoints: TIER_THRESHOLDS[CompetitiveTier.ELITE],
        maxPoints: TIER_THRESHOLDS[CompetitiveTier.MASTER] - 1,
        badgeUrl: null,
        colorCode: "#EF233C", // Red
        order: 3,
        benefits: ["Qualification for national events", "Elite player badge", "Early access to tournaments"]
      },
      {
        id: 4,
        name: CompetitiveTier.MASTER,
        description: "Master-level competitive status",
        minPoints: TIER_THRESHOLDS[CompetitiveTier.MASTER],
        maxPoints: TIER_THRESHOLDS[CompetitiveTier.GRANDMASTER] - 1,
        badgeUrl: null,
        colorCode: "#D90429", // Crimson
        order: 4,
        benefits: ["Qualification for major events", "Master player badge", "Exclusive tournaments"]
      },
      {
        id: 5,
        name: CompetitiveTier.GRANDMASTER,
        description: "The highest competitive status",
        minPoints: TIER_THRESHOLDS[CompetitiveTier.GRANDMASTER],
        maxPoints: 99999,
        badgeUrl: null,
        colorCode: "#540D6E", // Purple
        order: 5,
        benefits: ["Automatic invitation to championships", "Grandmaster player badge", "Special recognition"]
      }
    ];
    
    // Insert tiers into database
    for (const tier of tiers) {
      await db.execute(sql`
        INSERT INTO ranking_tiers (
          name, description, min_points, max_points, 
          badge_url, color_code, "order", benefits
        ) VALUES (
          ${tier.name}, ${tier.description}, ${tier.minPoints}, ${tier.maxPoints}, 
          ${tier.badgeUrl}, ${tier.colorCode}, ${tier.order}, ${tier.benefits}
        )
      `);
    }
    
    console.log(`Initialized ${tiers.length} ranking tiers in the database`);
  }

  /**
   * Calculate points for a match
   * @param userId User to calculate points for
   * @param opponentIds Opponent IDs (1 for singles, 2 for doubles)
   * @param isWinner Whether the user won the match
   * @param division Age division
   * @param format Play format
   * @param matchType Match type (casual, league, tournament)
   * @param eventTier Event tier for tournaments/leagues
   * @param scoreDifferential Score differential (optional)
   * @param matchId Match ID (optional)
   * @param tournamentId Tournament ID (optional)
   * @param qualityMultiplier Optional override for quality factor (0.5 to 1.5)
   * @param notes Optional notes about the ranking change
   */
  async calculatePoints(
    userId: number,
    opponentIds: number[],
    isWinner: boolean,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    matchType: MatchType = MatchType.CASUAL,
    eventTier: EventTier = EventTier.LOCAL,
    scoreDifferential?: number,
    matchId?: number,
    tournamentId?: number,
    qualityMultiplier?: number,
    notes?: string
  ): Promise<{
    base: number;
    winBonus: number;
    qualityFactor: number;
    matchTypeMultiplier: number;
    eventTierMultiplier: number;
    formatMultiplier: number;
    total: number;
    tierRulesApplied?: boolean;
    tierExplanation?: string[];
    appliedRules?: string[];
  }> {
    // 1. Get base points
    const basePoints = BASE_POINTS[matchType];
    
    // 2. Apply win bonus if applicable
    const winBonus = isWinner ? WIN_BONUS[matchType] : 0;
    
    // 3. Determine quality factor based on player ratings
    let qualityFactor = qualityMultiplier || 1.0;
    
    if (!qualityMultiplier) {
      // Calculate based on ratings if not provided
      qualityFactor = await this.calculateQualityFactor(userId, opponentIds, division, format);
    }
    
    // 4. Apply match type multiplier
    const matchTypeMultiplier = 1.0; // Base multiplier
    
    // 5. Apply event tier multiplier
    const eventTierMultiplier = EVENT_TIER_MULTIPLIERS[eventTier];
    
    // 6. Apply format multiplier
    const formatMultiplier = FORMAT_MULTIPLIERS[format];
    
    // 7. Calculate standard total points
    const standardTotalPoints = Math.round(
      (basePoints + winBonus) * 
      qualityFactor * 
      matchTypeMultiplier * 
      eventTierMultiplier * 
      formatMultiplier
    );
    
    // 8. Apply tier-specific rules
    // Get opponent average rating for tier rules
    let avgOpponentRating = 0;
    if (opponentIds.length > 0) {
      const opponentRatings = await Promise.all(
        opponentIds.map(async (id) => {
          const rating = await db.query.playerRatings.findFirst({
            where: and(
              eq(playerRatings.userId, id),
              eq(playerRatings.division, division),
              eq(playerRatings.format, format)
            ),
            columns: { rating: true }
          });
          return rating ? rating.rating : 0;
        })
      );
      
      const validRatings = opponentRatings.filter(r => r > 0);
      avgOpponentRating = validRatings.length > 0 
        ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length 
        : 0;
    }
    
    // Apply tier rules
    const tierRulesResult = await tierRulesSystem.applyTierRules(
      userId,
      standardTotalPoints,
      isWinner,
      division,
      format,
      matchType,
      eventTier,
      avgOpponentRating
    );
    
    // Use the modified points from tier rules
    const totalPoints = tierRulesResult.modifiedPoints;
    
    // 9. Add ranking history record
    if (matchId || tournamentId) {
      const userRanking = await this.getUserRankingPoints(userId, division, format);
      const oldRanking = userRanking?.points || 0;
      const newRanking = oldRanking + totalPoints;
      
      // Create ranking history entry
      await db.execute(sql`
        INSERT INTO ranking_history (
          user_id, old_ranking, new_ranking, reason, 
          match_id, tournament_id, created_at,
          notes
        ) VALUES (
          ${userId}, ${oldRanking}, ${newRanking}, 
          ${isWinner ? 'match_win' : 'match_participation'}, 
          ${matchId}, ${tournamentId}, NOW(),
          ${tierRulesResult.explanation.join(', ')}
        )
      `);
    }
    
    // 10. Return the point breakdown with tier rule information
    return {
      base: basePoints,
      winBonus,
      qualityFactor,
      matchTypeMultiplier,
      eventTierMultiplier,
      formatMultiplier,
      total: totalPoints,
      tierRulesApplied: tierRulesResult.explanation.length > 0,
      tierExplanation: tierRulesResult.explanation,
      appliedRules: tierRulesResult.appliedRules
    };
  }
  
  /**
   * Calculate quality factor based on player ratings
   */
  private async calculateQualityFactor(
    userId: number,
    opponentIds: number[],
    division: Division,
    format: Format
  ): Promise<number> {
    // Get user's rating
    const userRating = await db.execute<{ rating: number }>(sql`
      SELECT rating FROM player_ratings
      WHERE user_id = ${userId}
        AND division = ${division}
        AND format = ${format}
      LIMIT 1
    `);
    
    if (!userRating[0]) {
      return 1.0; // Default if no rating found
    }
    
    const userRatingValue = userRating[0].rating;
    
    // Get opponents' ratings
    let opponentRatings: number[] = [];
    
    for (const opponentId of opponentIds) {
      const rating = await db.execute<{ rating: number }>(sql`
        SELECT rating FROM player_ratings
        WHERE user_id = ${opponentId}
          AND division = ${division}
          AND format = ${format}
        LIMIT 1
      `);
      
      if (rating[0]) {
        opponentRatings.push(rating[0].rating);
      }
    }
    
    if (opponentRatings.length === 0) {
      return 1.0; // Default if no opponent ratings found
    }
    
    // Calculate average opponent rating
    const avgOpponentRating = opponentRatings.reduce((sum, r) => sum + r, 0) / opponentRatings.length;
    
    // Determine quality factor based on rating difference
    const ratingDiff = avgOpponentRating - userRatingValue;
    
    if (ratingDiff >= 300) {
      return QUALITY_FACTORS.MUCH_HIGHER;
    } else if (ratingDiff >= 100) {
      return QUALITY_FACTORS.HIGHER;
    } else if (ratingDiff >= -100) {
      return QUALITY_FACTORS.EVEN;
    } else if (ratingDiff >= -300) {
      return QUALITY_FACTORS.LOWER;
    } else {
      return QUALITY_FACTORS.MUCH_LOWER;
    }
  }
  
  /**
   * Update user's ranking points after a match/event
   * @param userId User ID
   * @param pointsToAdd Points to add
   * @param division Age division
   * @param format Play format
   * @param season Season identifier (defaults to current)
   */
  async updateRankingPoints(
    userId: number,
    pointsToAdd: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    season: string = CURRENT_SEASON
  ): Promise<{
    points: number;
    newTier?: string;
    tierChanged: boolean;
  }> {
    // Get current ranking points record or create if doesn't exist
    const existingRecord = await db.execute(sql`
      SELECT * FROM ranking_points
      WHERE user_id = ${userId}
        AND season = ${season}
        AND division = ${division}
        AND format = ${format}
      LIMIT 1
    `);
    
    let currentPoints = 0;
    let currentTier = null;
    let totalMatches = 0;
    let winsCount = 0;
    
    if (existingRecord[0]) {
      currentPoints = existingRecord[0].points ? Number(existingRecord[0].points) : 0;
      currentTier = existingRecord[0].competitive_tier ? String(existingRecord[0].competitive_tier) : null;
      totalMatches = existingRecord[0].total_matches ? Number(existingRecord[0].total_matches) : 0;
      winsCount = existingRecord[0].wins_count ? Number(existingRecord[0].wins_count) : 0;
    }
    
    // Calculate new points total
    const newPoints = currentPoints + pointsToAdd;
    
    // Determine appropriate tier for new points
    const newTier = await this.getTierForPoints(newPoints);
    const tierChanged = newTier !== currentTier;
    
    // Update high water marks
    const seasonHighPoints = Math.max(newPoints, existingRecord[0]?.season_high_points ? Number(existingRecord[0].season_high_points) : 0);
    const allTimeHighPoints = Math.max(newPoints, existingRecord[0]?.all_time_high_points ? Number(existingRecord[0].all_time_high_points) : 0);
    
    // Ensure decay protection for new/returning players
    const protectionDate = existingRecord[0]?.decay_protected_until || new Date(Date.now() + DECAY_SETTINGS.PROTECTION_PERIOD * 24 * 60 * 60 * 1000);
    const protectionEndDate = protectionDate instanceof Date ? protectionDate.toISOString() : protectionDate;
    
    // Update or insert record
    if (existingRecord[0]) {
      await db.execute(sql`
        UPDATE ranking_points
        SET points = ${newPoints},
            competitive_tier = ${newTier},
            total_matches = ${totalMatches + 1},
            wins_count = ${winsCount + (pointsToAdd > 0 ? 1 : 0)},
            season_high_points = ${seasonHighPoints},
            all_time_high_points = ${allTimeHighPoints},
            last_updated = NOW()
        WHERE user_id = ${userId}
          AND season = ${season}
          AND division = ${division}
          AND format = ${format}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO ranking_points (
          user_id, season, division, format, points, 
          competitive_tier, total_matches, wins_count,
          tournament_count, losses_count, decay_protected_until,
          season_high_points, all_time_high_points, last_updated
        ) VALUES (
          ${userId}, ${season}, ${division}, ${format}, ${newPoints},
          ${newTier}, 1, ${pointsToAdd > 0 ? 1 : 0},
          0, ${pointsToAdd > 0 ? 0 : 1}, ${protectionEndDate},
          ${newPoints}, ${newPoints}, NOW()
        )
      `);
    }
    
    // Fire tier changed event if applicable
    if (tierChanged) {
      await serverEventBus.publish(CourtIQRankingEvents.TIER_CHANGED, {
        userId,
        oldTier: currentTier,
        newTier,
        season,
        division,
        format
      });
      
      // Award XP for tier promotion if points increased
      if (pointsToAdd > 0 && newTier && currentTier) {
        await xpSystem.awardXP(
          userId,
          "competitive_tier_promotion",
          250, // XP for tier promotion
          undefined,
          100,
          `Promoted to ${newTier} tier`
        );
      }
    }
    
    // Fire points awarded event
    await serverEventBus.publish(CourtIQRankingEvents.POINTS_AWARDED, {
      userId,
      pointsAwarded: pointsToAdd,
      newTotal: newPoints,
      season,
      division,
      format
    });
    
    return {
      points: newPoints,
      newTier: tierChanged ? newTier : undefined,
      tierChanged
    };
  }
  
  /**
   * Get user's current ranking points for a specific division and format
   */
  async getUserRankingPoints(
    userId: number,
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    season: string = CURRENT_SEASON
  ): Promise<any | null> {
    const result = await db.execute(sql`
      SELECT * FROM ranking_points
      WHERE user_id = ${userId}
        AND season = ${season}
        AND division = ${division}
        AND format = ${format}
      LIMIT 1
    `);
    
    return result[0] || null;
  }
  
  /**
   * Get all ranking points for a user across all divisions and formats
   */
  async getAllUserRankingPoints(
    userId: number,
    season: string = CURRENT_SEASON
  ): Promise<any[]> {
    const results = await db.execute(sql`
      SELECT * FROM ranking_points
      WHERE user_id = ${userId}
        AND season = ${season}
      ORDER BY division ASC, format ASC
    `);
    
    return results;
  }
  
  /**
   * Get a user's ranking history
   */
  async getUserRankingHistory(
    userId: number,
    limit: number = 10
  ): Promise<any[]> {
    // First, check if the ranking_history table exists
    const historyTableExists = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ranking_history'
      ) as exists
    `);
    
    if (!historyTableExists[0]?.exists) {
      console.log("Ranking history table doesn't exist yet");
      return [];
    }
    
    // Now check if matches table columns are as expected
    const matchColumns = await db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'matches'
    `);
    
    const matchColumnNames = matchColumns.map(col => col.column_name);
    
    // Build the query based on available columns
    let query = sql`
      SELECT rh.*`;
    
    if (matchColumnNames.includes('match_date')) {
      query = sql`${query}, m.match_date`;
    }
    
    if (matchColumnNames.includes('score')) {
      query = sql`${query}, m.score`;
    }
    
    if (matchColumnNames.includes('format_type')) {
      query = sql`${query}, m.format_type`;
    }
    
    query = sql`${query}, 
      t.name as tournament_name, t.start_date as tournament_date
      FROM ranking_history rh
      LEFT JOIN matches m ON rh.match_id = m.id
      LEFT JOIN tournaments t ON rh.tournament_id = t.id
      WHERE rh.user_id = ${userId}
      ORDER BY rh.created_at DESC
      LIMIT ${limit}
    `;
    
    try {
      const history = await db.execute(query);
      return history;
    } catch (err) {
      console.error("Error fetching ranking history:", err);
      return [];
    }
  }
  
  /**
   * Get the tier for a given points value
   */
  async getTierForPoints(points: number): Promise<string> {
    const tier = await db.execute<{ name: string }>(sql`
      SELECT name FROM ranking_tiers
      WHERE min_points <= ${points} AND max_points >= ${points}
      LIMIT 1
    `);
    
    if (!tier[0]) {
      // Fallback to lowest tier if no match
      return CompetitiveTier.CHALLENGER;
    }
    
    return tier[0].name;
  }
  
  /**
   * Get all ranking tiers
   */
  async getAllRankingTiers(): Promise<any[]> {
    const tiers = await db.execute(sql`
      SELECT * FROM ranking_tiers
      ORDER BY "order" ASC
    `);
    
    return tiers;
  }
  
  /**
   * Get the leaderboard for a specific division and format with optional rating filters
   * @param division Age division
   * @param format Play format
   * @param season Season identifier
   * @param limit Number of results to return
   * @param offset Pagination offset
   * @param tierFilter Optional filter by competitive tier
   * @param minRating Optional minimum rating value (0-9 scale, converted to internal 0-5 scale)
   * @param maxRating Optional maximum rating value (0-9 scale, converted to internal 0-5 scale)
   * @returns Array of leaderboard entries
   */
  /**
   * PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
   * Get the leaderboard for a specific division and format
   * Now supports filtering test data based on user's admin status
   */
  async getLeaderboard(
    division: Division = Division.OPEN,
    format: Format = Format.SINGLES,
    season: string = CURRENT_SEASON,
    limit: number = 20,
    offset: number = 0,
    tierFilter?: string,
    minRating?: number,
    maxRating?: number,
    requestingUserId?: number
  ): Promise<any[]> {
    // Check if the requesting user is an admin to determine if we should show test data
    let isAdmin = false;
    if (requestingUserId) {
      try {
        const [adminCheck] = await db.select({ isAdmin: users.isAdmin })
          .from(users)
          .where(eq(users.id, requestingUserId));
        isAdmin = adminCheck?.isAdmin === true;
      } catch (error) {
        console.error("[RankingSystem] Error checking admin status:", error);
      }
    }
    // Convert 0-9 scale ratings to internal 0-5 scale
    let internalMinRating: number | undefined;
    let internalMaxRating: number | undefined;
    
    if (minRating !== undefined) {
      internalMinRating = minRating / 1.8; // Convert from 0-9 to 0-5 scale
    }
    
    if (maxRating !== undefined) {
      internalMaxRating = maxRating / 1.8; // Convert from 0-9 to 0-5 scale
    }
    
    // Check user table columns
    const userColumns = await db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    const userColumnNames = userColumns.map(col => col.column_name);
    
    let query = sql`
      SELECT 
        rp.user_id as "userId",
        rp.points,
        rp.competitive_tier as "tier",
        rp.total_matches as "matchesPlayed",
        rp.wins_count as "wins",
        rp.tournament_count as "tournaments",
        pr.rating as "playerRating",
        u.username`;
    
    if (userColumnNames.includes('display_name')) {
      query = sql`${query}, u.display_name as "displayName"`;
    } else {
      query = sql`${query}, u.username as "displayName"`;
    }
    
    if (userColumnNames.includes('avatar_url')) {
      query = sql`${query}, u.avatar_url as "avatarUrl"`;
    } else {
      query = sql`${query}, NULL as "avatarUrl"`;
    }
    
    // Base FROM clause
    query = sql`${query}
      FROM ranking_points rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN player_ratings pr ON rp.user_id = pr.user_id AND pr.division = ${division} AND pr.format = ${format}
      WHERE 
        rp.season = ${season}
        AND rp.division = ${division}
        AND rp.format = ${format}
        AND rp.total_matches >= 5`;
    
    // Add tier filter if specified
    if (tierFilter) {
      query = sql`${query} AND rp.competitive_tier = ${tierFilter}`;
    }
    
    // Add rating range filters if specified
    if (internalMinRating !== undefined) {
      query = sql`${query} AND pr.rating >= ${internalMinRating}`;
    }
    
    if (internalMaxRating !== undefined) {
      query = sql`${query} AND pr.rating <= ${internalMaxRating}`;
    }
    
    // PKL-278651-SEC-0002-TESTVIS - Filter out test users and administrators only for non-admin users
    if (!isAdmin) {
      console.log("[RankingSystem] Applying test data filters (non-admin user)");
      // Filter out test users (users with 'test' in their name)
      query = sql`${query} AND u.username NOT ILIKE '%test%'`;
      
      // Filter out administrators
      query = sql`${query} AND (u.is_admin = FALSE OR u.is_admin IS NULL)`;
      
      // Filter out records with is_test_data flag
      query = sql`${query} AND (rp.is_test_data = FALSE OR rp.is_test_data IS NULL)`;
    } else {
      console.log("[RankingSystem] Skipping test data filters (admin user)");
    }
    
    // Order and limit
    query = sql`${query}
      ORDER BY rp.points DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    try {
      console.log("[RankingSystem] Fetching leaderboard with test user and admin filtering");
      const leaderboard = await db.execute(query);
      return leaderboard;
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      return [];
    }
  }
  
  /**
   * Apply points decay for inactive players
   * This would typically be run as a scheduled task
   */
  async applyPointsDecay(): Promise<void> {
    const now = new Date();
    const gracePeriodDate = new Date(now.getTime() - DECAY_SETTINGS.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    
    // Get all ranking points records where lastUpdated is older than grace period
    // and not protected from decay
    const inactiveRecords = await db.execute(sql`
      SELECT * FROM ranking_points
      WHERE last_updated < ${gracePeriodDate}
        AND (decay_protected_until IS NULL OR decay_protected_until < NOW())
    `);
    
    for (const record of inactiveRecords) {
      // Calculate weeks of inactivity
      let lastUpdated: Date;
      if (record.last_updated) {
        if (typeof record.last_updated === 'string' || typeof record.last_updated === 'number') {
          lastUpdated = new Date(record.last_updated);
        } else {
          lastUpdated = new Date(); // Default to now if the date is invalid
        }
      } else {
        lastUpdated = new Date(); // Default to now if no date provided
      }
      const weeksInactive = Math.floor((now.getTime() - lastUpdated.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksInactive <= 0) continue;
      
      // Calculate decay factor (increases with more weeks inactive, but capped)
      const decayFactor = Math.min(
        weeksInactive * DECAY_SETTINGS.RATE_PER_WEEK,
        DECAY_SETTINGS.MAX_DECAY
      );
      
      // Apply decay to points
      const points = record.points ? Number(record.points) : 0;
      const pointsToDecay = Math.round(points * decayFactor);
      const newPoints = Math.max(0, points - pointsToDecay);
      
      // Only update if there's an actual change in points
      const originalPoints = record.points ? Number(record.points) : 0;
      if (newPoints !== originalPoints) {
        const newTier = await this.getTierForPoints(newPoints);
        
        // Update record
        await db.execute(sql`
          UPDATE ranking_points
          SET points = ${newPoints},
              competitive_tier = ${newTier},
              last_updated = NOW()
          WHERE id = ${record.id}
        `);
        
        // Add ranking history entry for the decay
        await db.execute(sql`
          INSERT INTO ranking_history (
            user_id, old_ranking, new_ranking, reason, created_at
          ) VALUES (
            ${record.user_id}, ${record.points}, ${newPoints}, 'inactivity_decay', NOW()
          )
        `);
      }
    }
  }
  
  /**
   * Get player qualification status for events
   * @param userId User ID
   * @param season Season
   */
  async getPlayerQualificationStatus(
    userId: number,
    season: string = CURRENT_SEASON
  ): Promise<{
    local: boolean;
    regional: boolean;
    national: boolean;
    major: boolean;
    bestDivision: string;
    bestFormat: string;
    highestTier: string;
    highestPoints: number;
  }> {
    // Get user's best ranking record
    const rankings = await this.getAllUserRankingPoints(userId, season);
    
    if (!rankings || rankings.length === 0) {
      return {
        local: true, // Everyone can play local
        regional: false,
        national: false,
        major: false,
        bestDivision: Division.OPEN,
        bestFormat: Format.SINGLES,
        highestTier: CompetitiveTier.CHALLENGER,
        highestPoints: 0
      };
    }
    
    // Find the record with the highest points
    let highestRecord = rankings[0];
    for (const record of rankings) {
      const recordPoints = record.points ? Number(record.points) : 0;
      const highestPoints = highestRecord.points ? Number(highestRecord.points) : 0;
      if (recordPoints > highestPoints) {
        highestRecord = record;
      }
    }
    
    // Determine qualification based on tier
    const tier = highestRecord.competitive_tier ? String(highestRecord.competitive_tier) : CompetitiveTier.CHALLENGER;
    const points = highestRecord.points ? Number(highestRecord.points) : 0;
    const qualifications = {
      local: true, // Everyone can play local
      regional: tier !== CompetitiveTier.CHALLENGER,
      national: [CompetitiveTier.ELITE, CompetitiveTier.MASTER, CompetitiveTier.GRANDMASTER].some(t => t === tier),
      major: [CompetitiveTier.MASTER, CompetitiveTier.GRANDMASTER].some(t => t === tier),
      bestDivision: highestRecord.division ? String(highestRecord.division) : Division.OPEN,
      bestFormat: highestRecord.format ? String(highestRecord.format) : Format.SINGLES,
      highestTier: tier,
      highestPoints: points
    };
    
    return qualifications;
  }
}

// Export singleton instance
export const rankingSystem = new RankingSystem();