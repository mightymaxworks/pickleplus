/**
 * Multi-Dimensional Ranking Service
 * Handles all business logic for the multi-dimensional ranking system
 */
import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { 
  LeaderboardEntry,
  PlayFormat,
  AgeDivision
} from "../../../shared/multi-dimensional-rankings";
import { getEligibleAgeGroups, validateMultiAgeGroupUpdate } from "../../../shared/utils/algorithmValidation";
import { users } from "../../../shared/schema";
import { ratingTiers } from "../../../shared/courtiq-schema";
import { playerRankings, rankingHistory } from "./schema";

export class MultiDimensionalRankingService {
  /**
   * Get ranking for a specific user, format, age division, and tier
   */
  async getUserRanking(
    userId: number, 
    format: PlayFormat = 'singles', 
    ageDivision: AgeDivision = '19plus',
    ratingTierId?: number
  ) {
    let query = db.select().from(playerRankings)
      .where(
        and(
          eq(playerRankings.userId, userId),
          eq(playerRankings.format, format),
          eq(playerRankings.ageDivision, ageDivision)
        )
      );
    
    if (ratingTierId) {
      query = query.where(eq(playerRankings.ratingTierId, ratingTierId));
    }
    
    const rankings = await query;
    return rankings.length > 0 ? rankings[0] : null;
  }

  /**
   * Get ranking history for a specific user
   */
  async getUserRankingHistory(userId: number) {
    return db.select().from(rankingHistory)
      .where(eq(rankingHistory.userId, userId))
      .orderBy(desc(rankingHistory.createdAt));
  }

  /**
   * Update or create user ranking
   */
  async updateUserRanking(
    userId: number,
    format: PlayFormat = 'singles',
    ageDivision: AgeDivision = '19plus',
    ratingTierId: number | null,
    points: number
  ) {
    const existing = await this.getUserRanking(userId, format, ageDivision, ratingTierId || undefined);
    
    if (existing) {
      // Update existing ranking
      await db.update(playerRankings)
        .set({ 
          rankingPoints: points,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(playerRankings.userId, userId),
            eq(playerRankings.format, format),
            eq(playerRankings.ageDivision, ageDivision),
            ratingTierId ? eq(playerRankings.ratingTierId, ratingTierId) : sql`true`
          )
        );
      
      return { ...existing, rankingPoints: points };
    } else {
      // Create new ranking
      const [newRanking] = await db.insert(playerRankings)
        .values({
          userId,
          format,
          ageDivision,
          ratingTierId,
          rankingPoints: points
        })
        .returning();
      
      return newRanking;
    }
  }

  /**
   * Add ranking history entry
   */
  async addRankingHistoryEntry(
    userId: number,
    format: PlayFormat = 'singles',
    ageDivision: AgeDivision = '19plus',
    ratingTierId: number | null,
    oldRanking: number,
    newRanking: number,
    reason: string,
    matchId?: number,
    tournamentId?: number
  ) {
    const [entry] = await db.insert(rankingHistory)
      .values({
        userId,
        format,
        ageDivision,
        ratingTierId,
        oldRanking,
        newRanking,
        reason,
        matchId,
        tournamentId
      })
      .returning();
    
    return entry;
  }

  /**
   * Update multiple age group rankings for a single player
   * CRITICAL: Ensures algorithm compliance for cross-age group eligibility
   */
  async updateMultiAgeGroupRankings(
    userId: number,
    userDateOfBirth: string,
    format: PlayFormat = 'singles',
    eventAgeGroup: AgeDivision = '19plus',
    pointsToAdd: number,
    matchId?: number,
    tournamentId?: number,
    reason: string = "match_participation"
  ): Promise<{
    updatedRankings: AgeDivision[];
    validationResult: { isCompliant: boolean; missingUpdates: AgeDivision[]; explanation: string };
  }> {
    
    // Get all eligible age groups for this player
    const eligibleAgeGroups = getEligibleAgeGroups(userDateOfBirth);
    const updatedRankings: AgeDivision[] = [];
    
    // Update rankings for ALL eligible age groups
    for (const ageGroup of eligibleAgeGroups) {
      try {
        // Get current ranking for this age group
        const currentRanking = await this.getUserRanking(userId, format, ageGroup) || { rankingPoints: 0, ratingTierId: null };
        
        // Calculate new total (additive system)
        const newTotal = currentRanking.rankingPoints + pointsToAdd;
        
        // Update this age group ranking
        const updatedRanking = await this.updateUserRanking(
          userId,
          format,
          ageGroup,
          currentRanking.ratingTierId || null,
          newTotal
        );
        
        // Add history entry
        await this.addRankingHistoryEntry(
          userId,
          format,
          ageGroup,
          currentRanking.ratingTierId || null,
          currentRanking.rankingPoints,
          newTotal,
          `${reason} (event: ${eventAgeGroup})`,
          matchId,
          tournamentId
        );
        
        updatedRankings.push(ageGroup);
        
        console.log(`[Multi-Age Update] User ${userId}: ${ageGroup} ranking updated from ${currentRanking.rankingPoints} to ${newTotal} (+${pointsToAdd})`);
        
      } catch (error) {
        console.error(`[Multi-Age Update] Failed to update ${ageGroup} ranking for user ${userId}:`, error);
      }
    }
    
    // Validate compliance
    const validationResult = validateMultiAgeGroupUpdate(
      userId.toString(),
      userDateOfBirth,
      eventAgeGroup,
      updatedRankings
    );
    
    if (!validationResult.isCompliant) {
      console.warn(`[ALGORITHM COMPLIANCE WARNING] ${validationResult.explanation}`);
    }
    
    return { updatedRankings, validationResult };
  }

  /**
   * ENHANCED: Processes ranking points from a match result with multi-age group support
   * 
   * CRITICAL CHANGE: Now updates ALL eligible age group rankings per algorithm requirements
   * Example: 42-year-old in Open (19+) event updates BOTH Open AND 35+ rankings
   */
  async processMatchRankingPoints(
    winnerId: number,
    loserId: number,
    format: PlayFormat = 'singles',
    ageDivision: AgeDivision = '19plus',
    basePoints: number = 10,
    matchId?: number,
    tournamentId?: number
  ) {
    console.log(`[Multi-Age Ranking] Processing match: Winner ${winnerId} vs Loser ${loserId} in ${ageDivision} ${format}`);
    
    // Get player birth dates for age eligibility calculation
    const [winnerUser, loserUser] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, winnerId) }),
      db.query.users.findFirst({ where: eq(users.id, loserId) })
    ]);
    
    if (!winnerUser?.dateOfBirth || !loserUser?.dateOfBirth) {
      throw new Error('Player date of birth required for multi-age group ranking updates');
    }
    
    // Process multi-age group updates for winner (gets points)
    const winnerResult = await this.updateMultiAgeGroupRankings(
      winnerId,
      winnerUser.dateOfBirth,
      format,
      ageDivision,
      basePoints,
      matchId,
      tournamentId,
      "match_win"
    );
    
    // Process multi-age group updates for loser (also gets participation points in System B)
    const participationPoints = 1; // System B: 1 point for loss
    const loserResult = await this.updateMultiAgeGroupRankings(
      loserId,
      loserUser.dateOfBirth,
      format,
      ageDivision,
      participationPoints,
      matchId,
      tournamentId,
      "match_participation"
    );
    
    console.log(`[Multi-Age Ranking] Complete - Winner: ${winnerResult.updatedRankings.length} rankings updated, Loser: ${loserResult.updatedRankings.length} rankings updated`);
    
    return {
      winnerId,
      winnerUpdatedRankings: winnerResult.updatedRankings,
      winnerValidation: winnerResult.validationResult,
      loserId,
      loserUpdatedRankings: loserResult.updatedRankings,
      loserValidation: loserResult.validationResult,
      pointsAwarded: basePoints,
      participationPoints
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    format: PlayFormat = 'singles',
    ageDivision: AgeDivision = '19plus',
    ratingTierId?: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> {
    let query = db.select({
      id: playerRankings.id,
      userId: playerRankings.userId,
      username: users.username,
      displayName: users.displayName,
      rankingPoints: playerRankings.rankingPoints,
      avatarInitials: users.avatarInitials
    })
    .from(playerRankings)
    .innerJoin(users, eq(playerRankings.userId, users.id))
    .where(
      and(
        eq(playerRankings.format, format),
        eq(playerRankings.ageDivision, ageDivision)
      )
    )
    .orderBy(desc(playerRankings.rankingPoints))
    .limit(limit)
    .offset(offset);
    
    if (ratingTierId) {
      query = query.where(eq(playerRankings.ratingTierId, ratingTierId));
    }

    const leaderboard = await query;
    
    // Add rank number based on order
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: offset + index + 1
    }));
  }

  /**
   * Get user ranking within a specific format, age division, and tier
   */
  async getUserRankingPosition(
    userId: number,
    format: PlayFormat = 'singles',
    ageDivision: AgeDivision = '19plus',
    ratingTierId?: number
  ): Promise<{ rank: number; total: number }> {
    const userRanking = await this.getUserRanking(userId, format, ageDivision, ratingTierId);
    
    if (!userRanking) {
      return { rank: 0, total: 0 };
    }
    
    // Count players with higher ranking points
    const higherRankedCountResult = await db.select({
      count: sql<number>`count(*)`
    })
    .from(playerRankings)
    .where(
      and(
        eq(playerRankings.format, format),
        eq(playerRankings.ageDivision, ageDivision),
        ratingTierId ? eq(playerRankings.ratingTierId, ratingTierId) : sql`true`,
        sql`${playerRankings.rankingPoints} > ${userRanking.rankingPoints}`
      )
    );
    
    // Get total number of ranked players in this category
    const totalCountResult = await db.select({
      count: sql<number>`count(*)`
    })
    .from(playerRankings)
    .where(
      and(
        eq(playerRankings.format, format),
        eq(playerRankings.ageDivision, ageDivision),
        ratingTierId ? eq(playerRankings.ratingTierId, ratingTierId) : sql`true`
      )
    );
    
    const higherRanked = higherRankedCountResult[0]?.count || 0;
    const total = totalCountResult[0]?.count || 0;
    
    return {
      rank: higherRanked + 1, // User's rank is the number of players with higher points + 1
      total
    };
  }

  /**
   * Get all available rating tiers
   */
  async getRatingTiers() {
    return db.select().from(ratingTiers).orderBy(ratingTiers.order);
  }
}

// Create singleton instance of the service
export const multiDimensionalRankingService = new MultiDimensionalRankingService();