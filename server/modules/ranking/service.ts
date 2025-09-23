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
    // FIXED: Build all conditions at once to prevent predicate override bug
    const conditions = [
      eq(playerRankings.userId, userId),
      eq(playerRankings.format, format),
      eq(playerRankings.ageDivision, ageDivision)
    ];
    
    // Add rating tier filter if provided
    if (ratingTierId) {
      conditions.push(eq(playerRankings.ratingTierId, ratingTierId));
    }
    
    const rankings = await db.select().from(playerRankings)
      .where(and(...conditions));
      
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
    
    // Get player birth dates and data for bonus calculations
    const [winnerUser, loserUser] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, winnerId) }),
      db.query.users.findFirst({ where: eq(users.id, loserId) })
    ]);
    
    if (!winnerUser?.dateOfBirth || !loserUser?.dateOfBirth) {
      throw new Error('Player date of birth required for multi-age group ranking updates');
    }

    // CRITICAL FIX: Calculate proper points WITH age/gender bonuses
    const { calculateMatchPoints } = await import('../../../shared/utils/matchPointsCalculator');
    
    // Prepare player data for bonus calculations
    const winnerMatchData = {
      playerId: winnerId,
      username: winnerUser.username,
      isWin: true,
      ageGroup: this.getPlayerAgeGroup(winnerUser.dateOfBirth),
      gender: winnerUser.gender as 'male' | 'female' | undefined,
      currentRankingPoints: winnerUser.rankingPoints || 0,
      eventType: 'casual' as const
    };
    
    const loserMatchData = {
      playerId: loserId,
      username: loserUser.username,
      isWin: false,
      ageGroup: this.getPlayerAgeGroup(loserUser.dateOfBirth),
      gender: loserUser.gender as 'male' | 'female' | undefined,
      currentRankingPoints: loserUser.rankingPoints || 0,
      eventType: 'casual' as const
    };
    
    // Calculate points WITH all bonuses applied
    const matchResults = calculateMatchPoints([winnerMatchData, loserMatchData], format === 'mixed' ? 'doubles' : format);
    const winnerCalculation = matchResults.find(r => r.playerId === winnerId)!;
    const loserCalculation = matchResults.find(r => r.playerId === loserId)!;
    
    console.log(`[BONUS CALCULATION] Winner: ${winnerCalculation.calculationDetails}`);
    console.log(`[BONUS CALCULATION] Loser: ${loserCalculation.calculationDetails}`);
    
    // Process multi-age group updates with CALCULATED points (including bonuses)
    const winnerResult = await this.updateMultiAgeGroupRankings(
      winnerId,
      winnerUser.dateOfBirth,
      format,
      ageDivision,
      winnerCalculation.rankingPointsEarned, // Using calculated points with bonuses!
      matchId,
      tournamentId,
      "match_win"
    );
    
    const loserResult = await this.updateMultiAgeGroupRankings(
      loserId,
      loserUser.dateOfBirth,
      format,
      ageDivision,
      loserCalculation.rankingPointsEarned, // Using calculated points with bonuses!
      matchId,
      tournamentId,
      "match_participation"
    );
    
    console.log(`[Multi-Age Ranking] Complete - Winner: ${winnerResult.updatedRankings.length} rankings updated, Loser: ${loserResult.updatedRankings.length} rankings updated`);
    
    // CRITICAL FIX: Also update the main users table that the leaderboard reads from
    try {
      const { storage } = await import('../../storage');
      await storage.updateUserRankingPoints(winnerId, winnerCalculation.rankingPointsEarned, format === 'mixed' ? 'doubles' : format);
      await storage.updateUserRankingPoints(loserId, loserCalculation.rankingPointsEarned, format === 'mixed' ? 'doubles' : format);
      console.log(`[MAIN TABLE UPDATE] Updated main users table - Winner: +${winnerCalculation.rankingPointsEarned} ${format} points, Loser: +${loserCalculation.rankingPointsEarned} ${format} points`);
    } catch (error) {
      console.error(`[MAIN TABLE UPDATE] Error updating main users table:`, error);
    }
    
    return {
      winnerId,
      winnerUpdatedRankings: winnerResult.updatedRankings,
      winnerValidation: winnerResult.validationResult,
      loserId,
      loserUpdatedRankings: loserResult.updatedRankings,
      loserValidation: loserResult.validationResult,
      pointsAwarded: winnerCalculation.rankingPointsEarned,
      participationPoints: loserCalculation.rankingPointsEarned,
      // Enhanced response with bonus breakdown
      winnerCalculationDetails: winnerCalculation.calculationDetails,
      loserCalculationDetails: loserCalculation.calculationDetails
    };
  }

  /**
   * Get age group for a player based on date of birth
   * Maps to match calculator age group format
   */
  private getPlayerAgeGroup(dateOfBirth: Date | string): string {
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
               (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    
    if (age >= 70) return '70+';
    if (age >= 60) return '60+';
    if (age >= 50) return '50+';
    if (age >= 35) return '35+';
    if (age < 19) return 'U19';
    return 'Open';
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
    // Build conditions array
    const conditions = [
      eq(playerRankings.format, format),
      eq(playerRankings.ageDivision, ageDivision)
    ];
    
    if (ratingTierId) {
      conditions.push(eq(playerRankings.ratingTierId, ratingTierId));
    }

    const leaderboard = await db.select({
      id: playerRankings.id,
      userId: playerRankings.userId,
      username: users.username,
      displayName: users.displayName,
      rankingPoints: playerRankings.rankingPoints,
      avatarInitials: users.avatarInitials
    })
    .from(playerRankings)
    .innerJoin(users, eq(playerRankings.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(playerRankings.rankingPoints))
    .limit(limit)
    .offset(offset);
    
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