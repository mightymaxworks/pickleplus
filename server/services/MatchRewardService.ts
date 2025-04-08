/**
 * Match Reward Service
 * 
 * This service handles the calculation of XP and ranking points
 * awarded after match completion. It implements the complex
 * business logic for rewards including diminishing returns,
 * cooldowns, tournament multipliers, and various bonuses.
 */

import { db } from "../db";
import { 
  users, 
  matches, 
  xpTransactions, 
  rankingTransactions,
  type Match,
  type User
} from "@shared/schema";
import { eq, and, gt, lt, desc, sql } from "drizzle-orm";

/**
 * Result of XP calculation that includes a detailed breakdown
 */
export interface XPCalculationResult {
  userId: number;
  totalXP: number;
  baseXP: number;
  breakdown: {
    dailyMatchNumber: number;
    baseAmount: number;
    cooldownReduction: boolean;
    cooldownAmount: number | null;
    tournamentMultiplier: number | null;
    victoryBonus: number | null;
    winStreakBonus: number | null;
    closeMatchBonus: number | null;
    skillBonus: number | null;
    foundingMemberBonus: number | null;
    weeklyCapReached: boolean;
  };
}

/**
 * Result of ranking point calculation
 */
export interface RankingCalculationResult {
  userId: number;
  points: number;
  previousTier: string;
  newTier: string;
  tierChanged: boolean;
}

/**
 * Match Reward Service Class
 */
export class MatchRewardService {
  /**
   * Calculate XP rewards for a match
   * 
   * @param match The match data
   * @param user The user to calculate XP for
   * @returns XP calculation result
   */
  async calculateXP(match: Match, user: User): Promise<XPCalculationResult> {
    const userId = user.id;
    const isWinner = match.winnerId === userId;
    
    // Initialize calculation result
    const result: XPCalculationResult = {
      userId,
      totalXP: 0,
      baseXP: 0,
      breakdown: {
        dailyMatchNumber: 0,
        baseAmount: 0,
        cooldownReduction: false,
        cooldownAmount: null,
        tournamentMultiplier: null,
        victoryBonus: null,
        winStreakBonus: null,
        closeMatchBonus: null,
        skillBonus: null,
        foundingMemberBonus: null,
        weeklyCapReached: false
      }
    };
    
    // 1. Check weekly cap
    const weeklyXP = await this.getUserWeeklyXP(userId);
    result.breakdown.weeklyCapReached = weeklyXP >= 350;
    
    if (result.breakdown.weeklyCapReached) {
      result.baseXP = 5;
      result.totalXP = 5;
      result.breakdown.baseAmount = 5;
      return result;
    }
    
    // 2. Get daily match count (including this one)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dailyMatches = await db.select({ id: matches.id })
      .from(matches)
      .where(
        and(
          sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`,
          gt(matches.matchDate, today),
          lt(matches.matchDate, tomorrow)
        )
      );
    
    const dailyMatchCount = dailyMatches.length;
    result.breakdown.dailyMatchNumber = dailyMatchCount;
    
    // 3. Determine base XP based on daily match number
    let baseXP = 0;
    if (dailyMatchCount <= 2) {
      baseXP = 25;
    } else if (dailyMatchCount <= 5) {
      baseXP = 15;
    } else {
      baseXP = 8;
    }
    result.breakdown.baseAmount = baseXP;
    
    // 4. Check for cooldown violation (30 minutes)
    const matchDate = match.matchDate || new Date();
    const thirtyMinutesAgo = new Date(matchDate);
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    const recentMatches = await db.select({ id: matches.id })
      .from(matches)
      .where(
        and(
          sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`,
          gt(matches.matchDate, thirtyMinutesAgo),
          sql`${matches.matchDate} < ${matchDate}`
        )
      );
    
    const cooldownViolation = recentMatches.length > 0;
    result.breakdown.cooldownReduction = cooldownViolation;
    
    if (cooldownViolation) {
      result.breakdown.cooldownAmount = baseXP * 0.5;
      baseXP = baseXP * 0.5;
    }
    
    // 5. Apply tournament multiplier if applicable
    if (match.matchType === 'tournament') {
      let multiplier = 1;
      
      switch (match.eventTier) {
        case 'club':
          multiplier = 1.5;
          break;
        case 'regional':
          multiplier = 2.0;
          break;
        case 'national':
          multiplier = 2.5;
          break;
        case 'international':
          multiplier = 3.0;
          break;
      }
      
      result.breakdown.tournamentMultiplier = multiplier;
      baseXP = baseXP * multiplier;
    }
    
    // 6. Add victory bonus (2-5 XP)
    if (isWinner) {
      const victoryBonus = Math.floor(Math.random() * 4) + 2; // Random 2-5
      result.breakdown.victoryBonus = victoryBonus;
      baseXP += victoryBonus;
      
      // 7. Check for win streak
      const winStreak = await this.getUserWinStreak(userId);
      if (winStreak > 0) {
        const streakBonus = Math.min(winStreak, 5);
        result.breakdown.winStreakBonus = streakBonus;
        baseXP += streakBonus;
      }
    }
    
    // 8. Check for close match (point difference ≤ 2)
    const scorePlayerOne = parseInt(match.scorePlayerOne);
    const scorePlayerTwo = parseInt(match.scorePlayerTwo);
    const pointDifference = Math.abs(scorePlayerOne - scorePlayerTwo);
    
    if (pointDifference <= 2) {
      result.breakdown.closeMatchBonus = 3;
      baseXP += 3;
    }
    
    // 9. Skill-based bonus for defeating higher-ranked opponents
    if (isWinner) {
      // Get opponent
      const opponentId = match.playerOneId === userId 
        ? match.playerTwoId 
        : match.playerOneId;
      
      const skillBonus = await this.calculateSkillBonus(userId, opponentId);
      if (skillBonus > 0) {
        result.breakdown.skillBonus = skillBonus;
        baseXP += skillBonus;
      }
    }
    
    // 10. Founding member bonus (10%)
    if (user.isFoundingMember) {
      const foundingBonus = Math.round(baseXP * 0.1);
      result.breakdown.foundingMemberBonus = foundingBonus;
      baseXP += foundingBonus;
    }
    
    // Set final XP amounts
    result.baseXP = result.breakdown.baseAmount;
    result.totalXP = Math.round(baseXP);
    
    return result;
  }
  
  /**
   * Calculate ranking points for a match
   * 
   * @param match The match data
   * @param user The user to calculate points for
   * @returns Ranking calculation result
   */
  async calculateRankingPoints(match: Match, user: User): Promise<RankingCalculationResult> {
    const userId = user.id;
    const isWinner = match.winnerId === userId;
    
    // Get current ranking points
    const userRanking = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        rankingPoints: true
      }
    });
    
    const currentPoints = userRanking?.rankingPoints || 0;
    const currentTier = this.getTierForPoints(currentPoints);
    
    // Initialize points
    let pointsAwarded = 0;
    
    // Base points for match type
    if (isWinner) {
      if (match.matchType === 'casual') {
        // Random 3-5 points for casual win
        pointsAwarded = Math.floor(Math.random() * 3) + 3;
      } else if (match.matchType === 'tournament') {
        // Random 8-12 points for tournament win
        pointsAwarded = Math.floor(Math.random() * 5) + 8;
        
        // Apply tournament tier multiplier
        switch (match.eventTier) {
          case 'club':
            pointsAwarded *= 1.0; // No change
            break;
          case 'regional':
            pointsAwarded *= 1.5;
            break;
          case 'national':
            pointsAwarded *= 2.0;
            break;
          case 'international':
            pointsAwarded *= 3.0;
            break;
        }
      }
    } else {
      // Loser gets a percentage of what the winner earned
      // This encourages participation even in losing efforts
      
      // Calculate what the winner would get
      let winnerPoints = 0;
      if (match.matchType === 'casual') {
        winnerPoints = Math.floor(Math.random() * 3) + 3;
      } else if (match.matchType === 'tournament') {
        winnerPoints = Math.floor(Math.random() * 5) + 8;
        
        // Apply tournament tier multiplier
        switch (match.eventTier) {
          case 'club':
            winnerPoints *= 1.0;
            break;
          case 'regional':
            winnerPoints *= 1.5;
            break;
          case 'national':
            winnerPoints *= 2.0;
            break;
          case 'international':
            winnerPoints *= 3.0;
            break;
        }
      }
      
      // Loser gets 25% of winner points
      pointsAwarded = Math.round(winnerPoints * 0.25);
    }
    
    // Calculate new total and tier
    const newTotal = currentPoints + pointsAwarded;
    const newTier = this.getTierForPoints(newTotal);
    
    return {
      userId,
      points: pointsAwarded,
      previousTier: currentTier,
      newTier,
      tierChanged: currentTier !== newTier
    };
  }
  
  /**
   * Get tier name for a given point total
   * 
   * @param points Ranking points
   * @returns Tier name
   */
  getTierForPoints(points: number): string {
    if (points < 250) return 'Bronze';
    if (points < 500) return 'Silver';
    if (points < 1000) return 'Gold';
    if (points < 2000) return 'Platinum';
    if (points < 3500) return 'Diamond';
    if (points < 5000) return 'Master';
    return 'Grandmaster';
  }
  
  /**
   * Record XP and ranking transactions for a match
   * 
   * @param match The match data
   * @param xpResult XP calculation result
   * @param rankingResult Ranking calculation result
   * @returns The recorded transactions
   */
  async recordRewards(
    match: Match, 
    xpResult: XPCalculationResult, 
    rankingResult: RankingCalculationResult
  ): Promise<{xpTransaction: any, rankingTransaction: any}> {
    // Create XP transaction
    const [xpTransaction] = await db.insert(xpTransactions)
      .values({
        userId: xpResult.userId,
        amount: xpResult.totalXP,
        source: `Match ${match.winnerId === xpResult.userId ? 'victory' : 'participation'}`,
        matchId: match.id,
        metadata: xpResult.breakdown
      })
      .returning();
    
    // Create ranking transaction
    const [rankingTransaction] = await db.insert(rankingTransactions)
      .values({
        userId: rankingResult.userId,
        amount: rankingResult.points,
        source: `Match ${match.winnerId === rankingResult.userId ? 'victory' : 'participation'}`,
        matchId: match.id,
        metadata: {
          matchType: match.matchType,
          eventTier: match.eventTier,
          tierChanged: rankingResult.tierChanged,
          previousTier: rankingResult.previousTier,
          newTier: rankingResult.newTier
        }
      })
      .returning();
    
    // Update user's ranking points
    await db.update(users)
      .set({
        rankingPoints: sql`${users.rankingPoints} + ${rankingResult.points}`
      })
      .where(eq(users.id, rankingResult.userId));
    
    return { xpTransaction, rankingTransaction };
  }
  
  /**
   * Calculate skill-based bonus for defeating higher-ranked opponents
   * 
   * @param userId Player ID
   * @param opponentId Opponent ID
   * @returns Bonus points (0-5)
   */
  private async calculateSkillBonus(userId: number, opponentId: number): Promise<number> {
    // Get both players' ranking points
    const userRanking = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        rankingPoints: true
      }
    });
    
    const opponentRanking = await db.query.users.findFirst({
      where: eq(users.id, opponentId),
      columns: {
        rankingPoints: true
      }
    });
    
    const userPoints = userRanking?.rankingPoints || 0;
    const opponentPoints = opponentRanking?.rankingPoints || 0;
    
    // No bonus if opponent has lower ranking
    if (opponentPoints <= userPoints) {
      return 0;
    }
    
    // Calculate tier difference
    const userTier = this.getTierForPoints(userPoints);
    const opponentTier = this.getTierForPoints(opponentPoints);
    
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
    const userTierIndex = tiers.indexOf(userTier);
    const opponentTierIndex = tiers.indexOf(opponentTier);
    
    const tierDifference = opponentTierIndex - userTierIndex;
    
    // Award bonus based on tier difference
    if (tierDifference <= 0) {
      return 0;
    } else if (tierDifference === 1) {
      return 2;
    } else if (tierDifference === 2) {
      return 3;
    } else if (tierDifference >= 3) {
      return 5;
    }
    
    return 0;
  }
  
  /**
   * Get user's current win streak
   * 
   * @param userId User ID
   * @returns Win streak count
   */
  private async getUserWinStreak(userId: number): Promise<number> {
    // Get recent matches in reverse chronological order
    const recentMatches = await db.select()
      .from(matches)
      .where(
        sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`
      )
      .orderBy(desc(matches.matchDate))
      .limit(10);
    
    // Count consecutive wins
    let streak = 0;
    for (const match of recentMatches) {
      if (match.winnerId === userId) {
        streak++;
      } else {
        // Streak broken
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Get user's XP earned in the current week
   * 
   * @param userId User ID
   * @returns Total XP for the current week
   */
  private async getUserWeeklyXP(userId: number): Promise<number> {
    // Calculate start of the week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get sum of XP transactions for this week
    const result = await db
      .select({ 
        totalXP: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`.as('totalXP') 
      })
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          gt(xpTransactions.timestamp, startOfWeek)
        )
      );
    
    return result[0]?.totalXP || 0;
  }
}

export default new MatchRewardService();