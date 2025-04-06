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
   * Processes ranking points from a match result
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
    // Get current rankings
    const winnerRanking = await this.getUserRanking(winnerId, format, ageDivision) || { rankingPoints: 0 };
    const loserRanking = await this.getUserRanking(loserId, format, ageDivision) || { rankingPoints: 0 };
    
    // Calculate points - winner gets points, loser doesn't lose points in this system
    const pointsAwarded = basePoints;
    
    // Update winner's ranking
    const updatedWinnerRanking = await this.updateUserRanking(
      winnerId,
      format,
      ageDivision,
      winnerRanking.ratingTierId || null,
      winnerRanking.rankingPoints + pointsAwarded
    );
    
    // Add history entry for winner
    await this.addRankingHistoryEntry(
      winnerId,
      format,
      ageDivision,
      winnerRanking.ratingTierId || null,
      winnerRanking.rankingPoints,
      updatedWinnerRanking.rankingPoints,
      "match_win",
      matchId,
      tournamentId
    );
    
    return {
      winnerId,
      winnerOldPoints: winnerRanking.rankingPoints,
      winnerNewPoints: updatedWinnerRanking.rankingPoints,
      pointsAwarded
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