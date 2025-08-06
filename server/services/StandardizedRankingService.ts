/**
 * Standardized Ranking Points Service - FINAL ALGORITHM
 * 
 * System B with Option B (Open Age Group) multipliers and Dual Ranking System
 * 
 * Features:
 * - Base Points: 3 win / 1 loss
 * - Age multipliers always applied (18-34: 1.0x to 70+: 1.6x)
 * - Dual Rankings: Open Rankings (age-multiplied) + Age Group Rankings (base points)
 * - Tournament tiers: Club (1.0x) to International (4.0x)
 * - Points decay: Tier-based (1%/2%/5%/7% weekly) with activity-responsive adjustments
 * 
 * @framework Framework5.3
 * @version 2.0.0 - FINALIZED ALGORITHM
 * @lastModified 2025-08-06
 */

import { db } from "../db";
import { users, matches, rankingTransactions, type User } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { DecayProtectionService } from "./DecayProtectionService";

// Define Match type inline since it may not be exported
interface Match {
  id: number;
  matchType: string;
  eventTier?: string;
}

export interface RankingPointsCalculation {
  userId: number;
  basePoints: number;
  ageMultipliedPoints: number;
  weightedPoints: number;
  openRankingPoints: number;
  ageGroupRankingPoints: number;
  matchType: string;
  tournamentTier?: string;
  tierMultiplier: number;
  ageMultiplier: number;
  playerAge?: number;
  isWinner: boolean;
  breakdown: {
    baseCalculation: string;
    ageMultiplier: string;
    weightApplied: string;
    tierMultiplier: string;
    dualRankingResult: string;
  };
}

export interface TierMultipliers {
  club: number;
  district: number;
  city: number;
  provincial: number;
  regional: number;
  national: number;
  international: number;
}

export class StandardizedRankingService {
  
  /**
   * Base points matrix - System B Standardized
   */
  private static readonly BASE_POINTS = {
    win: 3,
    loss: 1
  };

  /**
   * Age group multipliers - Option B (Open Age Group)
   * Players ALWAYS get their age multiplier regardless of opponent age
   */
  private static readonly AGE_MULTIPLIERS = {
    '18-34': 1.0,
    '35-49': 1.2,
    '50-59': 1.3,
    '60-69': 1.5,
    '70+': 1.6
  };

  /**
   * Match type weight factors
   */
  private static readonly WEIGHT_FACTORS = {
    casual: 0.5,     // 50% weight
    league: 0.75,    // 75% weight
    tournament: 1.0  // 100% weight
  };

  /**
   * Tournament tier multipliers - 7-tier system
   */
  private static readonly TIER_MULTIPLIERS: TierMultipliers = {
    club: 1.0,
    district: 1.2,
    city: 1.5,
    provincial: 2.0,
    regional: 2.5,
    national: 3.0,
    international: 4.0
  };

  /**
   * Get age group from date of birth
   */
  private static getAgeGroup(dateOfBirth: string): keyof typeof StandardizedRankingService.AGE_MULTIPLIERS {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust for birthday not yet passed this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    if (actualAge >= 70) return '70+';
    if (actualAge >= 60) return '60-69';
    if (actualAge >= 50) return '50-59';
    if (actualAge >= 35) return '35-49';
    return '18-34';
  }

  /**
   * Calculate ranking points - FINALIZED ALGORITHM WITH DUAL RANKING SYSTEM
   */
  static calculateRankingPoints(
    isWinner: boolean,
    matchType: 'casual' | 'league' | 'tournament',
    playerDateOfBirth: string,
    tournamentTier?: keyof TierMultipliers
  ): RankingPointsCalculation {
    
    // Step 1: Base points (System B)
    const basePoints = isWinner ? this.BASE_POINTS.win : this.BASE_POINTS.loss;
    
    // Step 2: Apply age multiplier (Option B - Open Age Group)
    const ageGroup = this.getAgeGroup(playerDateOfBirth);
    const ageMultiplier = this.AGE_MULTIPLIERS[ageGroup];
    const ageMultipliedPoints = Math.round(basePoints * ageMultiplier * 10) / 10;
    
    // Step 3: Apply match type weighting
    const weightFactor = this.WEIGHT_FACTORS[matchType] || 1.0;
    const weightedPoints = Math.round(ageMultipliedPoints * weightFactor * 10) / 10;
    
    // Step 4: Apply tournament tier multiplier
    let tierMultiplier = 1.0;
    let openRankingPoints = weightedPoints;
    let ageGroupRankingPoints = Math.round(basePoints * weightFactor * 10) / 10; // Base points without age multiplier
    
    if (matchType === 'tournament' && tournamentTier) {
      tierMultiplier = this.TIER_MULTIPLIERS[tournamentTier] || 1.0;
      openRankingPoints = Math.round(weightedPoints * tierMultiplier * 10) / 10;
      ageGroupRankingPoints = Math.round(ageGroupRankingPoints * tierMultiplier * 10) / 10;
    }

    return {
      userId: 0, // Will be set by caller
      basePoints,
      ageMultipliedPoints,
      weightedPoints,
      openRankingPoints,
      ageGroupRankingPoints,
      matchType,
      tournamentTier,
      tierMultiplier,
      ageMultiplier,
      isWinner,
      breakdown: {
        baseCalculation: `${isWinner ? 'Win' : 'Loss'}: ${basePoints} base points`,
        ageMultiplier: `Age ${ageGroup} (${ageMultiplier}x): ${ageMultipliedPoints} points`,
        weightApplied: `${matchType} weight (${weightFactor}x): ${weightedPoints} points`,
        tierMultiplier: tournamentTier ? 
          `${tournamentTier} tier (${tierMultiplier}x): ${openRankingPoints} points` : 
          'No tier multiplier applied',
        dualRankingResult: `Open Rankings: ${openRankingPoints}, Age Group Rankings: ${ageGroupRankingPoints}`
      }
    };
  }

  /**
   * Process match and award ranking points to both players with dual ranking system
   */
  static async processMatchRankingPoints(
    match: Match,
    winnerId: number,
    loserId: number
  ): Promise<{
    winnerCalculation: RankingPointsCalculation;
    loserCalculation: RankingPointsCalculation;
  }> {
    
    // Get player data for age calculations
    const [winner, loser] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, winnerId) }),
      db.query.users.findFirst({ where: eq(users.id, loserId) })
    ]);

    if (!winner || !loser) {
      throw new Error('Player data not found for ranking calculation');
    }

    if (!winner.dateOfBirth || !loser.dateOfBirth) {
      throw new Error('Player date of birth required for age multiplier calculation');
    }

    // Calculate points for winner
    const winnerCalculation = this.calculateRankingPoints(
      true,
      match.matchType as 'casual' | 'league' | 'tournament',
      winner.dateOfBirth,
      match.eventTier as keyof TierMultipliers
    );
    winnerCalculation.userId = winnerId;

    // Calculate points for loser  
    const loserCalculation = this.calculateRankingPoints(
      false,
      match.matchType as 'casual' | 'league' | 'tournament',
      loser.dateOfBirth,
      match.eventTier as keyof TierMultipliers
    );
    loserCalculation.userId = loserId;

    // Award points to both players in dual ranking system
    await this.awardDualRankingPoints(winnerCalculation, match.id);
    await this.awardDualRankingPoints(loserCalculation, match.id);

    return { winnerCalculation, loserCalculation };
  }

  /**
   * Award ranking points to dual ranking system
   */
  private static async awardDualRankingPoints(
    calculation: RankingPointsCalculation,
    matchId: number
  ): Promise<void> {
    
    // Update user's Open Rankings (age-multiplied points)
    await db.update(users)
      .set({
        rankingPoints: sql`${users.rankingPoints} + ${calculation.openRankingPoints}`,
        // Store age group ranking points separately (need to add this field to schema)
        // ageGroupRankingPoints: sql`${users.ageGroupRankingPoints} + ${calculation.ageGroupRankingPoints}`
      })
      .where(eq(users.id, calculation.userId));

    // Create transaction record with dual ranking data
    await db.insert(rankingTransactions)
      .values({
        userId: calculation.userId,
        amount: calculation.openRankingPoints,
        source: `${calculation.matchType} match ${calculation.isWinner ? 'win' : 'participation'}`,
        matchId,
        metadata: {
          algorithm: 'System B + Option B + Dual Rankings',
          basePoints: calculation.basePoints,
          ageMultiplier: calculation.ageMultiplier,
          openRankingPoints: calculation.openRankingPoints,
          ageGroupRankingPoints: calculation.ageGroupRankingPoints,
          breakdown: calculation.breakdown,
          matchType: calculation.matchType,
          tournamentTier: calculation.tournamentTier,
          tierMultiplier: calculation.tierMultiplier
        }
      });
  }

  /**
   * Get ranking points breakdown for display purposes
   */
  static async getUserRankingBreakdown(userId: number): Promise<{
    totalDisplayPoints: number;
    totalCompetitivePoints: number;
    breakdown: Array<{
      matchType: string;
      displayPoints: number;
      competitivePoints: number;
      count: number;
    }>;
  }> {
    
    const transactions = await db.query.rankingTransactions.findMany({
      where: eq(rankingTransactions.userId, userId),
      with: {
        match: true
      }
    });

    const breakdown = new Map<string, {
      displayPoints: number;
      competitivePoints: number;
      count: number;
    }>();

    let totalDisplayPoints = 0;
    let totalCompetitivePoints = 0;

    for (const transaction of transactions) {
      const metadata = transaction.metadata as any || {};
      const matchType = metadata.matchType || 'unknown';
      const displayPoints = metadata.displayPoints || 0;
      const competitivePoints = transaction.amount;

      totalDisplayPoints += displayPoints;
      totalCompetitivePoints += competitivePoints;

      if (!breakdown.has(matchType)) {
        breakdown.set(matchType, {
          displayPoints: 0,
          competitivePoints: 0,
          count: 0
        });
      }

      const entry = breakdown.get(matchType)!;
      entry.displayPoints += displayPoints;
      entry.competitivePoints += competitivePoints;
      entry.count += 1;
    }

    return {
      totalDisplayPoints,
      totalCompetitivePoints,
      breakdown: Array.from(breakdown.entries()).map(([matchType, data]) => ({
        matchType,
        ...data
      }))
    };
  }

  /**
   * Get decay protection status for a user
   */
  static async getDecayProtectionStatus(userId: number) {
    return await DecayProtectionService.getProtectionStatus(userId);
  }

  /**
   * Calculate weighted activity for decay protection
   */
  static async getWeightedActivity(userId: number, daysBack: number = 30) {
    return await DecayProtectionService.calculateWeightedActivity(userId, daysBack);
  }

  /**
   * Process weekly decay for all eligible players
   */
  static async processWeeklyDecay() {
    return await DecayProtectionService.processWeeklyDecay();
  }

  /**
   * Validate calculation consistency across different scenarios
   */
  static validateCalculations(): Array<{
    scenario: string;
    expected: number;
    actual: number;
    passes: boolean;
  }> {
    
    const testDOB = '1990-01-01'; // 35-year-old (1.2x multiplier)
    
    const testCases = [
      // Casual matches (35-year-old)
      { scenario: 'Casual win (35yo)', isWinner: true, matchType: 'casual' as const, expected: 1.8 }, // 3 * 1.2 * 0.5 = 1.8
      { scenario: 'Casual loss (35yo)', isWinner: false, matchType: 'casual' as const, expected: 0.6 }, // 1 * 1.2 * 0.5 = 0.6
      
      // League matches (35-year-old)
      { scenario: 'League win (35yo)', isWinner: true, matchType: 'league' as const, expected: 2.7 }, // 3 * 1.2 * 0.75 = 2.7
      { scenario: 'League loss (35yo)', isWinner: false, matchType: 'league' as const, expected: 0.9 }, // 1 * 1.2 * 0.75 = 0.9
      
      // Tournament matches (35-year-old)
      { scenario: 'Tournament win (35yo)', isWinner: true, matchType: 'tournament' as const, expected: 3.6 }, // 3 * 1.2 * 1.0 = 3.6
      { scenario: 'Tournament loss (35yo)', isWinner: false, matchType: 'tournament' as const, expected: 1.2 }, // 1 * 1.2 * 1.0 = 1.2
      
      // Tournament with tiers (35-year-old)
      { scenario: 'National tournament win (35yo)', isWinner: true, matchType: 'tournament' as const, tournamentTier: 'national' as const, expected: 10.8 }, // 3 * 1.2 * 1.0 * 3.0 = 10.8
      { scenario: 'International tournament win (35yo)', isWinner: true, matchType: 'tournament' as const, tournamentTier: 'international' as const, expected: 14.4 } // 3 * 1.2 * 1.0 * 4.0 = 14.4
    ];

    return testCases.map(testCase => {
      const calculation = this.calculateRankingPoints(
        testCase.isWinner,
        testCase.matchType,
        testDOB,
        testCase.tournamentTier
      );
      
      return {
        scenario: testCase.scenario,
        expected: testCase.expected,
        actual: calculation.openRankingPoints,
        passes: Math.abs(calculation.openRankingPoints - testCase.expected) < 0.01
      };
    });
  }
}