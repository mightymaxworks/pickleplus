/**
 * PKL-278651-CALC-0001-SERVICE - Frontend Data Calculation Service
 * 
 * This service centralizes all frontend calculations to ensure
 * consistent data processing across components.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { calculateLevelFromXP, getXpRequiredForLevel } from "@/lib/calculateLevel";

export interface CourtIQMetrics {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  consistency: number;
}

export interface UserStats {
  xp: number;
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  recentMatches?: Array<any>;
  courtIQMetrics?: CourtIQMetrics;
}

export interface CalculatedUserMetrics {
  level: number;
  xpProgress: number;
  xpProgressPercentage: number;
  nextLevelXP: number;
  winRate: number;
  recentPerformance: number;
  overallRating?: number;
  masteryLevel?: number;
}

/**
 * Core Data Calculation Service for frontend calculations
 * This helps reduce API calls and provides immediate feedback to users
 */
export class DataCalculationService {
  /**
   * Calculate user level from XP amount
   * @param xp User's XP amount
   * @returns Calculated level
   */
  static calculateUserLevel(xp: number): number {
    return calculateLevelFromXP(xp);
  }

  /**
   * Calculate XP progress toward next level
   * @param xp User's current XP
   * @returns Progress object with current level, next level, progress, and percentage
   */
  static calculateXPProgress(xp: number): {
    currentLevel: number;
    nextLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
    percentage: number;
  } {
    const currentLevel = this.calculateUserLevel(xp);
    const nextLevel = currentLevel + 1;
    
    const currentLevelXP = getXpRequiredForLevel(currentLevel);
    const nextLevelXP = getXpRequiredForLevel(nextLevel);
    
    const range = nextLevelXP - currentLevelXP;
    const progress = xp - currentLevelXP;
    const percentage = Math.round((progress / range) * 100);
    
    // Debug output to verify calculation
    console.debug(`XP Calculation: level=${currentLevel}, xp=${xp}, current=${currentLevelXP}, next=${nextLevelXP}, progress=${progress}/${range}, percentage=${percentage}%`);
    
    return {
      currentLevel,
      nextLevel,
      currentLevelXP,
      nextLevelXP,
      progress,
      percentage
    };
  }
  
  /**
   * Calculate win rate from match statistics
   * @param stats User match statistics
   * @returns Win rate percentage or null if no matches
   */
  static calculateWinRate(stats: { totalMatches: number; matchesWon: number }): number | null {
    const { totalMatches, matchesWon } = stats;
    
    if (!totalMatches) return null;
    return (matchesWon / totalMatches) * 100;
  }
  
  /**
   * Calculate recent performance change
   * @param stats User match statistics with recent matches
   * @param windowSize Number of recent matches to consider (default: 5)
   * @returns Percentage change in performance (positive or negative)
   */
  static calculateRecentPerformance(
    stats: { totalMatches: number; matchesWon: number; recentMatches?: Array<any> },
    windowSize: number = 5
  ): number | null {
    const { totalMatches, matchesWon, recentMatches } = stats;
    
    if (!totalMatches || !recentMatches || recentMatches.length === 0) return null;
    
    // Calculate overall win rate
    const overallWinRate = this.calculateWinRate(stats) || 0;
    
    // Calculate recent win rate
    const recentMatchCount = Math.min(recentMatches.length, windowSize);
    const recentWins = recentMatches
      .slice(0, recentMatchCount)
      .filter(match => match.won || match.result === 'win').length;
    
    const recentWinRate = (recentWins / recentMatchCount) * 100;
    
    // Calculate performance change (percentage points)
    return recentWinRate - overallWinRate;
  }
  
  /**
   * Calculate performance score based on CourtIQ metrics
   * @param metrics CourtIQ metrics object
   * @returns Calculated performance score
   */
  static calculatePerformanceScore(metrics: CourtIQMetrics): number {
    if (!metrics) return 0;
    
    const { technical, tactical, physical, mental, consistency } = metrics;
    
    // Weighted calculation
    const weights = {
      technical: 0.25,
      tactical: 0.25,
      physical: 0.15, 
      mental: 0.20,
      consistency: 0.15
    };
    
    return Math.round(
      technical * weights.technical +
      tactical * weights.tactical +
      physical * weights.physical +
      mental * weights.mental +
      consistency * weights.consistency
    );
  }
  
  /**
   * Calculate mastery level based on CourtIQ performance score
   * @param performanceScore Calculated performance score
   * @returns Mastery level (1-10)
   */
  static calculateMasteryLevel(performanceScore: number): number {
    // Mastery levels thresholds
    const thresholds = [
      0,    // Level 1
      1000, // Level 2
      1200, // Level 3
      1400, // Level 4
      1600, // Level 5
      1800, // Level 6
      2000, // Level 7
      2200, // Level 8
      2400, // Level 9
      2600  // Level 10
    ];
    
    let masteryLevel = 1;
    
    for (let i = 1; i < thresholds.length; i++) {
      if (performanceScore >= thresholds[i]) {
        masteryLevel = i + 1;
      } else {
        break;
      }
    }
    
    return Math.min(masteryLevel, 10);
  }
  
  /**
   * Calculates leaderboard position based on user score
   * @param userScore User's score
   * @param leaderboard Array of leaderboard entries
   * @returns Position in leaderboard (1-based)
   */
  static calculateLeaderboardPosition(
    userScore: number,
    leaderboard: Array<{ id: number; score: number }>
  ): number | null {
    if (!leaderboard || leaderboard.length === 0) return null;
    
    // Sort leaderboard by score in descending order
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    
    // Find position
    const position = sortedLeaderboard.findIndex(entry => entry.score <= userScore) + 1;
    
    return position > 0 ? position : leaderboard.length + 1;
  }
  
  /**
   * Calculate all user metrics at once
   * @param stats User statistics object
   * @returns Calculated metrics
   */
  static calculateAllMetrics(stats: UserStats): CalculatedUserMetrics {
    const { xp, totalMatches, matchesWon, matchesLost, recentMatches, courtIQMetrics } = stats;
    
    // Calculate level and XP progress
    const xpProgress = this.calculateXPProgress(xp);
    
    // Calculate win rate
    const winRate = this.calculateWinRate({ totalMatches, matchesWon }) || 0;
    
    // Calculate recent performance
    const recentPerformance = this.calculateRecentPerformance(
      { totalMatches, matchesWon, recentMatches }
    ) || 0;
    
    // Calculate CourtIQ performance (if metrics provided)
    let overallRating = undefined;
    let masteryLevel = undefined;
    
    if (courtIQMetrics) {
      overallRating = this.calculatePerformanceScore(courtIQMetrics);
      masteryLevel = this.calculateMasteryLevel(overallRating);
    }
    
    return {
      level: xpProgress.currentLevel,
      xpProgress: xpProgress.progress,
      xpProgressPercentage: xpProgress.percentage,
      nextLevelXP: xpProgress.nextLevelXP,
      winRate,
      recentPerformance,
      overallRating,
      masteryLevel
    };
  }
}

// Export individual calculation functions for direct use
export const {
  calculateUserLevel,
  calculateXPProgress,
  calculateWinRate,
  calculateRecentPerformance,
  calculatePerformanceScore,
  calculateMasteryLevel,
  calculateLeaderboardPosition,
  calculateAllMetrics
} = DataCalculationService;