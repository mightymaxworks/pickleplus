/**
 * Standardized Ranking Points Service
 * 
 * Unified calculation system for all ranking points in Pickle+
 * Replaces multiple inconsistent implementations with single source of truth
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-21
 */

import { db } from "../db";
import { users, matches, rankingTransactions, type Match, type User } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface RankingPointsCalculation {
  userId: number;
  basePoints: number;
  weightedPoints: number;
  displayPoints: number;
  matchType: string;
  tournamentTier?: string;
  tierMultiplier: number;
  isWinner: boolean;
  breakdown: {
    baseCalculation: string;
    weightApplied: string;
    tierMultiplier: string;
    finalResult: string;
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
   * Base points matrix - standardized across all systems
   */
  private static readonly BASE_POINTS = {
    win: 3,
    loss: 1
  };

  /**
   * Match type weight factors for competitive ranking calculation
   */
  private static readonly WEIGHT_FACTORS = {
    casual: 0.5,     // 50% weight
    league: 0.67,    // 67% weight
    tournament: 1.0  // 100% weight
  };

  /**
   * Tournament tier multipliers - standardized values
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
   * Calculate ranking points for a match - SINGLE SOURCE OF TRUTH
   */
  static calculateRankingPoints(
    isWinner: boolean,
    matchType: 'casual' | 'league' | 'tournament',
    tournamentTier?: keyof TierMultipliers
  ): RankingPointsCalculation {
    
    // Step 1: Base points
    const basePoints = isWinner ? this.BASE_POINTS.win : this.BASE_POINTS.loss;
    
    // Step 2: Apply match type weighting
    const weightFactor = this.WEIGHT_FACTORS[matchType] || 1.0;
    const weightedPoints = Math.round(basePoints * weightFactor * 10) / 10; // Round to 1 decimal
    
    // Step 3: Apply tournament tier multiplier (only for tournaments)
    let tierMultiplier = 1.0;
    let finalDisplayPoints = basePoints;
    let finalWeightedPoints = weightedPoints;
    
    if (matchType === 'tournament' && tournamentTier) {
      tierMultiplier = this.TIER_MULTIPLIERS[tournamentTier] || 1.0;
      finalDisplayPoints = Math.round(basePoints * tierMultiplier * 10) / 10;
      finalWeightedPoints = Math.round(weightedPoints * tierMultiplier * 10) / 10;
    }

    return {
      userId: 0, // Will be set by caller
      basePoints,
      weightedPoints: finalWeightedPoints,
      displayPoints: finalDisplayPoints,
      matchType,
      tournamentTier,
      tierMultiplier,
      isWinner,
      breakdown: {
        baseCalculation: `${isWinner ? 'Win' : 'Loss'}: ${basePoints} base points`,
        weightApplied: `${matchType} weight (${weightFactor}x): ${weightedPoints} points`,
        tierMultiplier: tournamentTier ? 
          `${tournamentTier} tier (${tierMultiplier}x): ${finalWeightedPoints} points` : 
          'No tier multiplier applied',
        finalResult: `Display: ${finalDisplayPoints}, Competitive: ${finalWeightedPoints}`
      }
    };
  }

  /**
   * Process match and award ranking points to both players
   */
  static async processMatchRankingPoints(
    match: Match,
    winnerId: number,
    loserId: number
  ): Promise<{
    winnerCalculation: RankingPointsCalculation;
    loserCalculation: RankingPointsCalculation;
  }> {
    
    // Calculate points for winner
    const winnerCalculation = this.calculateRankingPoints(
      true,
      match.matchType as 'casual' | 'league' | 'tournament',
      match.eventTier as keyof TierMultipliers
    );
    winnerCalculation.userId = winnerId;

    // Calculate points for loser  
    const loserCalculation = this.calculateRankingPoints(
      false,
      match.matchType as 'casual' | 'league' | 'tournament',
      match.eventTier as keyof TierMultipliers
    );
    loserCalculation.userId = loserId;

    // Award points to both players
    await this.awardRankingPoints(winnerCalculation, match.id);
    await this.awardRankingPoints(loserCalculation, match.id);

    return { winnerCalculation, loserCalculation };
  }

  /**
   * Award ranking points to a user and create transaction record
   */
  private static async awardRankingPoints(
    calculation: RankingPointsCalculation,
    matchId: number
  ): Promise<void> {
    
    // Update user's ranking points (using competitive points for actual ranking)
    await db.update(users)
      .set({
        rankingPoints: sql`${users.rankingPoints} + ${calculation.weightedPoints}`
      })
      .where(eq(users.id, calculation.userId));

    // Create transaction record
    await db.insert(rankingTransactions)
      .values({
        userId: calculation.userId,
        amount: calculation.weightedPoints,
        source: `${calculation.matchType} match ${calculation.isWinner ? 'win' : 'participation'}`,
        matchId,
        metadata: {
          calculation: calculation.breakdown,
          displayPoints: calculation.displayPoints,
          competitivePoints: calculation.weightedPoints,
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
      const matchType = transaction.metadata?.matchType || 'unknown';
      const displayPoints = transaction.metadata?.displayPoints || 0;
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
   * Validate calculation consistency across different scenarios
   */
  static validateCalculations(): Array<{
    scenario: string;
    expected: number;
    actual: number;
    passes: boolean;
  }> {
    
    const testCases = [
      // Casual matches
      { scenario: 'Casual win', isWinner: true, matchType: 'casual' as const, expected: 1.5 },
      { scenario: 'Casual loss', isWinner: false, matchType: 'casual' as const, expected: 0.5 },
      
      // League matches  
      { scenario: 'League win', isWinner: true, matchType: 'league' as const, expected: 2.0 },
      { scenario: 'League loss', isWinner: false, matchType: 'league' as const, expected: 0.7 },
      
      // Tournament matches
      { scenario: 'Tournament win', isWinner: true, matchType: 'tournament' as const, expected: 3.0 },
      { scenario: 'Tournament loss', isWinner: false, matchType: 'tournament' as const, expected: 1.0 },
      
      // Tournament with tiers
      { scenario: 'National tournament win', isWinner: true, matchType: 'tournament' as const, tournamentTier: 'national' as const, expected: 9.0 },
      { scenario: 'International tournament win', isWinner: true, matchType: 'tournament' as const, tournamentTier: 'international' as const, expected: 12.0 }
    ];

    return testCases.map(testCase => {
      const calculation = this.calculateRankingPoints(
        testCase.isWinner,
        testCase.matchType,
        testCase.tournamentTier
      );
      
      return {
        scenario: testCase.scenario,
        expected: testCase.expected,
        actual: calculation.weightedPoints,
        passes: Math.abs(calculation.weightedPoints - testCase.expected) < 0.01
      };
    });
  }
}