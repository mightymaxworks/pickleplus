/**
 * Pickle Points Calculator with Anti-Gaming Protection
 * 
 * OFFICIAL POINTS SYSTEM - Reference: PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 * - Match Win: 3 points (System B Standardized)
 * - Match Participation: 1 point (System B Standardized)
 * - Daily match limits (5 per day)
 * - Drastically reduced points after 2nd match
 * - Weekly profile update restrictions
 * - Pickle+ ecosystem validation
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-06-03
 */

import { AntiGamingService } from './anti-gaming';

export interface PointsCalculation {
  basePoints: number;
  finalPoints: number;
  reduction: number;
  reason: string;
  canEarnPoints: boolean;
  dailyMatchCount: number;
  isReducedPoints: boolean;
  activityType: 'match_win' | 'match_participate' | 'profile_update';
}

export class PicklePointsCalculator {
  
  /**
   * Calculate points for match participation with anti-gaming protection
   * Pure activity-based system - NO DUPR dependency
   */
  static async calculateMatchPoints(
    userId: number,
    isWinner: boolean,
    recentMatches: any[],
    storage: any
  ): Promise<PointsCalculation> {
    
    // Get today's matches for daily limit calculation
    const todayMatches = recentMatches.filter(m => 
      new Date(m.matchDate || m.createdAt).toDateString() === new Date().toDateString()
    );
    
    const dailyMatchCount = todayMatches.length;
    
    // OFFICIAL POINTS SYSTEM - Reference: PICKLE_PLUS_ALGORITHM_DOCUMENT.md
    // System B Standardized: Win = 3 points, Loss = 1 point
    const basePoints = isWinner ? 3 : 1; // Winner: 3, Participant: 1
    const activityType = isWinner ? 'match_win' : 'match_participate';
    
    // Apply anti-gaming reductions
    if (dailyMatchCount >= 5) {
      return {
        basePoints,
        finalPoints: 0,
        reduction: 100,
        reason: "Daily match limit of 5 exceeded - no points awarded",
        canEarnPoints: false,
        dailyMatchCount,
        isReducedPoints: false,
        activityType
      };
    }
    
    // Drastically reduce points after 2nd match of the day
    if (dailyMatchCount >= 2) {
      const reductionPercent = this.calculateDailyReduction(dailyMatchCount);
      const finalPoints = Math.floor(basePoints * (1 - reductionPercent));
      
      return {
        basePoints,
        finalPoints,
        reduction: reductionPercent * 100,
        reason: `Reduced points for match #${dailyMatchCount + 1} of the day`,
        canEarnPoints: true,
        dailyMatchCount,
        isReducedPoints: true,
        activityType
      };
    }
    
    // First or second match of the day - full points
    return {
      basePoints,
      finalPoints: basePoints,
      reduction: 0,
      reason: dailyMatchCount === 0 ? "First match of the day" : "Second match of the day",
      canEarnPoints: true,
      dailyMatchCount,
      isReducedPoints: false,
      activityType
    };
  }
  
  /**
   * Calculate profile update points with weekly restriction
   */
  static calculateProfilePoints(
    userId: number,
    completionIncrease: number,
    lastProfilePointsDate?: Date
  ): PointsCalculation {
    
    const basePoints = Math.min(completionIncrease * 2, 10); // Max 10 points for profile updates
    
    // Check weekly restriction
    if (lastProfilePointsDate) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (lastProfilePointsDate > weekAgo) {
        return {
          basePoints,
          finalPoints: 0,
          reduction: 100,
          reason: "Profile update points only available once per week",
          canEarnPoints: false,
          dailyMatchCount: 0,
          isReducedPoints: false,
          activityType: 'profile_update'
        };
      }
    }
    
    // Minimum meaningful completion increase required
    if (completionIncrease < 5) {
      return {
        basePoints,
        finalPoints: 0,
        reduction: 100,
        reason: "Profile completion increase too small (minimum 5%)",
        canEarnPoints: false,
        dailyMatchCount: 0,
        isReducedPoints: false,
        activityType: 'profile_update'
      };
    }
    
    return {
      basePoints,
      finalPoints: basePoints,
      reduction: 0,
      reason: "Weekly profile update points awarded",
      canEarnPoints: true,
      dailyMatchCount: 0,
      isReducedPoints: false,
      activityType: 'profile_update'
    };
  }
  
  /**
   * Calculate daily reduction percentage based on match count
   * Matches 3+ get drastically reduced points
   */
  private static calculateDailyReduction(dailyMatchCount: number): number {
    switch (dailyMatchCount) {
      case 2: // 3rd match of day
        return 0.75; // 75% reduction
      case 3: // 4th match of day
        return 0.90; // 90% reduction
      case 4: // 5th match of day
        return 0.95; // 95% reduction
      default:
        return 0.95; // Maximum reduction for any additional matches
    }
  }
  
  /**
   * Validate opponent is in Pickle+ ecosystem
   */
  static async validateOpponent(opponentId: number, storage: any): Promise<boolean> {
    try {
      const opponent = await storage.getUser(opponentId);
      
      if (!opponent) {
        return false;
      }
      
      // Check if opponent is active (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return !opponent.lastVisit || opponent.lastVisit > thirtyDaysAgo;
      
    } catch (error) {
      console.error('[PICKLE-POINTS] Error validating opponent:', error);
      return false;
    }
  }
  
  /**
   * Get user's points earning status for today
   */
  static getPointsStatus(recentMatches: any[]): {
    dailyMatches: number;
    canPlayMore: boolean;
    nextMatchReduction: number;
    resetTime: string;
  } {
    const todayMatches = recentMatches.filter(m => 
      new Date(m.matchDate || m.createdAt).toDateString() === new Date().toDateString()
    );
    
    const dailyMatches = todayMatches.length;
    const canPlayMore = dailyMatches < 5;
    
    let nextMatchReduction = 0;
    if (dailyMatches >= 2) {
      nextMatchReduction = this.calculateDailyReduction(dailyMatches) * 100;
    }
    
    // Calculate time until daily reset (midnight)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const resetTime = tomorrow.toLocaleTimeString();
    
    return {
      dailyMatches,
      canPlayMore,
      nextMatchReduction,
      resetTime
    };
  }
  
  /**
   * Award points with full validation and logging
   */
  static async awardPoints(
    userId: number,
    pointType: 'match_win' | 'match_participate' | 'profile_update',
    pointsAwarded: number,
    metadata: any = {}
  ): Promise<boolean> {
    
    // Validate point award through anti-gaming service
    const validation = AntiGamingService.validatePointsActivity(
      userId,
      pointType,
      pointsAwarded,
      metadata
    );
    
    if (!validation.isValid) {
      console.log(`[PICKLE-POINTS] Points award blocked for user ${userId}: ${validation.reason}`);
      return false;
    }
    
    // Log points award
    console.log(`[PICKLE-POINTS] Awarded ${pointsAwarded} points to user ${userId} for ${pointType}`);
    
    // Here you would integrate with your user points storage system
    // For now, this is a validation and logging system
    
    return true;
  }
}