/**
 * PKL-278651-CALC-0003-TEST - Unit Tests for DataCalculationService
 * 
 * This file contains comprehensive tests for the DataCalculationService
 * to ensure accurate calculations across different scenarios.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { 
  DataCalculationService, 
  calculateUserLevel,
  calculateXPProgress,
  calculateWinRate,
  calculateRecentPerformance,
  calculatePerformanceScore,
  calculateMasteryLevel,
  calculateAllMetrics,
  type UserStats,
  type CourtIQMetrics
} from '../DataCalculationService';
import { getXpRequiredForLevel } from '@/lib/calculateLevel';

// Mock data for testing
const mockCourtIQMetrics: CourtIQMetrics = {
  technical: 3.5,
  tactical: 4.0,
  physical: 3.0,
  mental: 4.5,
  consistency: 3.8
};

const mockUserStats: UserStats = {
  xp: 814,
  totalMatches: 50,
  matchesWon: 30,
  matchesLost: 20,
  recentMatches: [
    { won: true, result: 'win' },
    { won: true, result: 'win' },
    { won: false, result: 'loss' },
    { won: true, result: 'win' },
    { won: false, result: 'loss' }
  ],
  courtIQMetrics: mockCourtIQMetrics
};

describe('DataCalculationService', () => {
  describe('calculateUserLevel', () => {
    test('should return correct level for different XP values', () => {
      // Test boundary conditions
      expect(calculateUserLevel(0)).toBe(1);
      expect(calculateUserLevel(99)).toBe(1);
      expect(calculateUserLevel(100)).toBe(2);
      expect(calculateUserLevel(249)).toBe(2);
      expect(calculateUserLevel(250)).toBe(3);
      expect(calculateUserLevel(499)).toBe(3);
      expect(calculateUserLevel(500)).toBe(4);
      expect(calculateUserLevel(749)).toBe(4);
      expect(calculateUserLevel(750)).toBe(5);
      expect(calculateUserLevel(799)).toBe(5);
      expect(calculateUserLevel(800)).toBe(6);
      expect(calculateUserLevel(814)).toBe(6);
      expect(calculateUserLevel(849)).toBe(6);
      expect(calculateUserLevel(850)).toBe(7);
    });

    test('should handle extremely large XP values', () => {
      expect(calculateUserLevel(10000)).toBe(17); // Assuming level progression continues
    });
  });

  describe('calculateXPProgress', () => {
    test('should calculate correct progress percentage for level 1', () => {
      const progress = calculateXPProgress(50);
      expect(progress.currentLevel).toBe(1);
      expect(progress.nextLevel).toBe(2);
      expect(progress.currentLevelXP).toBe(0);
      expect(progress.nextLevelXP).toBe(100);
      expect(progress.progress).toBe(50);
      expect(progress.percentage).toBe(50);
    });

    test('should calculate correct progress percentage for level 6', () => {
      const progress = calculateXPProgress(814);
      expect(progress.currentLevel).toBe(6);
      expect(progress.nextLevel).toBe(7);
      expect(progress.currentLevelXP).toBe(800);
      expect(progress.nextLevelXP).toBe(850);
      expect(progress.progress).toBe(14);
      expect(progress.percentage).toBe(28);
    });

    test('should handle exact level boundary', () => {
      const progress = calculateXPProgress(100);
      expect(progress.currentLevel).toBe(2);
      expect(progress.nextLevel).toBe(3);
      expect(progress.currentLevelXP).toBe(100);
      expect(progress.nextLevelXP).toBe(250);
      expect(progress.progress).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('calculateWinRate', () => {
    test('should calculate correct win rate percentage', () => {
      const winRate = calculateWinRate({ totalMatches: 50, matchesWon: 30 });
      expect(winRate).toBe(60);
    });

    test('should return null when no matches played', () => {
      const winRate = calculateWinRate({ totalMatches: 0, matchesWon: 0 });
      expect(winRate).toBeNull();
    });

    test('should handle perfect win rate', () => {
      const winRate = calculateWinRate({ totalMatches: 25, matchesWon: 25 });
      expect(winRate).toBe(100);
    });
  });

  describe('calculateRecentPerformance', () => {
    test('should calculate performance change based on recent matches', () => {
      const stats = {
        totalMatches: 50,
        matchesWon: 30,
        recentMatches: [
          { won: true, result: 'win' },
          { won: true, result: 'win' },
          { won: true, result: 'win' },
          { won: true, result: 'win' },
          { won: true, result: 'win' }
        ]
      };
      
      // Overall win rate is 60%, recent is 100%, so change is +40 percentage points
      const performance = calculateRecentPerformance(stats);
      expect(performance).toBe(40);
    });

    test('should handle cases with no recent matches', () => {
      const stats = {
        totalMatches: 50,
        matchesWon: 30,
        recentMatches: []
      };
      
      const performance = calculateRecentPerformance(stats);
      expect(performance).toBeNull();
    });

    test('should use windowSize parameter correctly', () => {
      const stats = {
        totalMatches: 50,
        matchesWon: 25,
        recentMatches: [
          { won: true, result: 'win' },
          { won: true, result: 'win' },
          { won: false, result: 'loss' },
          { won: false, result: 'loss' },
          { won: false, result: 'loss' },
          { won: false, result: 'loss' },
          { won: false, result: 'loss' }
        ]
      };
      
      // Overall win rate is 50%, recent (first 3) is 67%, so change is +17 percentage points
      const performance = calculateRecentPerformance(stats, 3);
      expect(performance).toBeCloseTo(16.67, 1);
    });
  });

  describe('calculatePerformanceScore', () => {
    test('should calculate weighted performance score correctly', () => {
      const score = calculatePerformanceScore(mockCourtIQMetrics);
      // Expected calculation:
      // (3.5 * 0.25) + (4.0 * 0.25) + (3.0 * 0.15) + (4.5 * 0.20) + (3.8 * 0.15) = 3.795
      // Rounded to 4
      expect(score).toBe(4);
    });

    test('should handle empty metrics', () => {
      const score = calculatePerformanceScore(null as any);
      expect(score).toBe(0);
    });

    test('should handle perfect metrics', () => {
      const perfectMetrics: CourtIQMetrics = {
        technical: 5,
        tactical: 5,
        physical: 5,
        mental: 5,
        consistency: 5
      };
      
      const score = calculatePerformanceScore(perfectMetrics);
      expect(score).toBe(5);
    });
  });

  describe('calculateMasteryLevel', () => {
    test('should calculate correct mastery level based on performance score', () => {
      expect(calculateMasteryLevel(0)).toBe(1);
      expect(calculateMasteryLevel(999)).toBe(1);
      expect(calculateMasteryLevel(1000)).toBe(2);
      expect(calculateMasteryLevel(1199)).toBe(2);
      expect(calculateMasteryLevel(1200)).toBe(3);
      expect(calculateMasteryLevel(1399)).toBe(3);
      expect(calculateMasteryLevel(1400)).toBe(4);
      expect(calculateMasteryLevel(2599)).toBe(9);
      expect(calculateMasteryLevel(2600)).toBe(10);
      expect(calculateMasteryLevel(3000)).toBe(10); // Cap at 10
    });
  });

  describe('calculateAllMetrics', () => {
    test('should calculate all metrics correctly', () => {
      const metrics = calculateAllMetrics(mockUserStats);
      
      expect(metrics.level).toBe(6);
      expect(metrics.xpProgress).toBe(14);
      expect(metrics.xpProgressPercentage).toBe(28);
      expect(metrics.nextLevelXP).toBe(850);
      expect(metrics.winRate).toBe(60);
      expect(metrics.recentPerformance).toBe(20); // 3 wins out of 5 = 60%, overall is 60%, so +0
      expect(metrics.overallRating).toBe(4);
      expect(metrics.masteryLevel).toBe(1); // Score of 4 is below first threshold
    });

    test('should handle missing CourtIQ metrics', () => {
      const statsWithoutCourtIQ: UserStats = {
        ...mockUserStats,
        courtIQMetrics: undefined
      };
      
      const metrics = calculateAllMetrics(statsWithoutCourtIQ);
      
      expect(metrics.level).toBe(6);
      expect(metrics.overallRating).toBeUndefined();
      expect(metrics.masteryLevel).toBeUndefined();
    });
  });
});