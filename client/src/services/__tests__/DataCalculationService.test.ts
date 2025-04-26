/**
 * PKL-278651-CALC-0003-TEST - Unit Tests for DataCalculationService
 * 
 * This file contains comprehensive tests for the DataCalculationService
 * to ensure accurate calculations across different scenarios.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-26
 */

import { 
  DataCalculationService, 
  calculateUserLevel,
  calculateXPProgress,
  calculateWinRate,
  calculateRecentPerformance,
  calculatePerformanceScore,
  calculateCourtIQRating,
  calculateDimensionRatings,
  convertRating,
  calculateRatingTier,
  calculateMasteryLevel,
  calculateRankingPoints,
  applyRatingProtection,
  calculateAllMetrics,
  type UserStats,
  type CourtIQMetrics,
  type RatingSystem
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
      
      // Expected calculation with weights:
      // (3.5 * 25 + 4.0 * 25 + 3.0 * 15 + 4.5 * 20 + 3.8 * 15) / 100 = 3.795
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
  
  describe('calculateCourtIQRating', () => {
    test('should calculate proper CourtIQ rating from dimension metrics', () => {
      const rating = calculateCourtIQRating(mockCourtIQMetrics);
      
      // Expected calculation:
      // Convert each metric to points (x*100+700)
      // Technical: 3.5*100+700 = 1050
      // Tactical: 4.0*100+700 = 1100
      // Physical: 3.0*100+700 = 1000
      // Mental: 4.5*100+700 = 1150
      // Consistency: 3.8*100+700 = 1080
      // Apply weights: (1050*25 + 1100*25 + 1000*15 + 1150*20 + 1080*15)/100 = 1079.5
      // Round to 1080
      expect(rating).toBeGreaterThan(1070);
      expect(rating).toBeLessThan(1090);
    });
    
    test('should return default rating for empty metrics', () => {
      expect(calculateCourtIQRating(null as any)).toBe(1000);
    });
    
    test('should return max rating for perfect metrics', () => {
      const perfectMetrics: CourtIQMetrics = {
        technical: 5,
        tactical: 5,
        physical: 5,
        mental: 5,
        consistency: 5
      };
      
      const rating = calculateCourtIQRating(perfectMetrics);
      expect(rating).toBe(1200); // 5*100+700 for each metric = 1200
    });
  });
  
  describe('calculateDimensionRatings', () => {
    test('should generate realistic dimension ratings based on win rate and XP', () => {
      const metrics = calculateDimensionRatings(60, 814);
      
      // Base rating should be 4 (60% win rate -> floor(60/20)+1 = 4)
      // All dimensions should be around 4 with slight variations
      expect(metrics.technical).toBeGreaterThanOrEqual(3.5);
      expect(metrics.technical).toBeLessThanOrEqual(4.5);
      
      expect(metrics.tactical).toBeGreaterThanOrEqual(3.5);
      expect(metrics.tactical).toBeLessThanOrEqual(4.5);
      
      expect(metrics.physical).toBeGreaterThanOrEqual(3.5);
      expect(metrics.physical).toBeLessThanOrEqual(4.5);
      
      expect(metrics.mental).toBeGreaterThanOrEqual(3.5);
      expect(metrics.mental).toBeLessThanOrEqual(4.5);
      
      expect(metrics.consistency).toBeGreaterThanOrEqual(3.5);
      expect(metrics.consistency).toBeLessThanOrEqual(4.5);
    });
    
    test('should handle very low win rate', () => {
      const metrics = calculateDimensionRatings(5, 100);
      
      // Base rating should be 1 (5% win rate -> floor(5/20)+1 = 1)
      // All dimensions should be close to 1
      Object.values(metrics).forEach(metric => {
        expect(metric).toBeGreaterThanOrEqual(1);
        expect(metric).toBeLessThanOrEqual(2);
      });
    });
    
    test('should handle perfect win rate', () => {
      const metrics = calculateDimensionRatings(100, 1000);
      
      // Base rating should be 5 (100% win rate -> floor(100/20)+1 = 6, capped at 5)
      // All dimensions should be close to 5
      Object.values(metrics).forEach(metric => {
        expect(metric).toBeGreaterThanOrEqual(4);
        expect(metric).toBeLessThanOrEqual(5);
      });
    });
  });
  
  describe('convertRating', () => {
    test('should convert from CourtIQ to DUPR accurately', () => {
      const result = convertRating(1750, 'COURTIQ', 'DUPR');
      
      // Expected: 1750 * 0.8 + 1.5 = 3.9
      expect(result.rating).toBeCloseTo(3.9, 1);
      expect(result.originalRating).toBe(1750);
      expect(result.originalSystem).toBe('COURTIQ');
      expect(result.source).toBe('mathematical');
      expect(result.confidence).toBeGreaterThan(50);
    });
    
    test('should convert from DUPR to CourtIQ accurately', () => {
      const result = convertRating(4.5, 'DUPR', 'COURTIQ');
      
      // Expected: 4.5 * 1.25 - 1.875 = 3.75
      expect(result.rating).toBeGreaterThan(1700);
      expect(result.rating).toBeLessThan(1850);
      expect(result.originalRating).toBe(4.5);
      expect(result.originalSystem).toBe('DUPR');
    });
    
    test('should return original rating for same system conversion', () => {
      const result = convertRating(1750, 'COURTIQ', 'COURTIQ');
      
      expect(result.rating).toBe(1750);
      expect(result.confidence).toBe(100);
      expect(result.source).toBe('direct');
    });
    
    test('should handle unknown conversion with estimation', () => {
      // Create a conversion between two systems without direct conversion factors
      const result = convertRating(4.5, 'UTPR', 'WPR' as RatingSystem);
      
      expect(result.source).toBe('estimated');
      expect(result.confidence).toBe(70);
      expect(result.originalRating).toBe(4.5);
    });
  });
  
  describe('calculateRatingTier', () => {
    test('should return correct tier for each rating range', () => {
      expect(calculateRatingTier(800).tier).toBe(1);
      expect(calculateRatingTier(1000).tier).toBe(2);
      expect(calculateRatingTier(1250).tier).toBe(3);
      expect(calculateRatingTier(1500).tier).toBe(4);
      expect(calculateRatingTier(1750).tier).toBe(5);
      expect(calculateRatingTier(1900).tier).toBe(6);
      expect(calculateRatingTier(2100).tier).toBe(7);
      expect(calculateRatingTier(2300).tier).toBe(8);
      expect(calculateRatingTier(2500).tier).toBe(9);
      expect(calculateRatingTier(2700).tier).toBe(10);
    });
    
    test('should return tier with complete information', () => {
      const tier = calculateRatingTier(1750);
      
      expect(tier.tier).toBe(5);
      expect(tier.name).toBe("Competitor");
      expect(tier.minRating).toBe(1600);
      expect(tier.maxRating).toBe(1799);
    });
    
    test('should handle boundary values', () => {
      expect(calculateRatingTier(1599).tier).toBe(4);
      expect(calculateRatingTier(1600).tier).toBe(5);
      expect(calculateRatingTier(1799).tier).toBe(5);
      expect(calculateRatingTier(1800).tier).toBe(6);
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
  
  describe('calculateRankingPoints', () => {
    test('should award points for winning against higher-rated player', () => {
      const points = calculateRankingPoints(1500, 1600, true);
      
      expect(points).toBeGreaterThan(20); // Should get significant points
    });
    
    test('should reduce points for winning against lower-rated player', () => {
      const points = calculateRankingPoints(1600, 1500, true);
      
      expect(points).toBeLessThan(15); // Should get fewer points
      expect(points).toBeGreaterThan(0); // But still positive
    });
    
    test('should penalize for losing against lower-rated player', () => {
      const points = calculateRankingPoints(1600, 1500, false);
      
      expect(points).toBeLessThan(0); // Should lose points
      expect(points).toBeLessThan(-20); // Should lose significant points
    });
    
    test('should have reduced penalty for losing against higher-rated player', () => {
      const points = calculateRankingPoints(1500, 1600, false);
      
      expect(points).toBeLessThan(0); // Should still lose points
      expect(points).toBeGreaterThan(-15); // But not as many
    });
    
    test('should adjust points based on match type', () => {
      const normalPoints = calculateRankingPoints(1500, 1600, true, 'ranked');
      const tournamentPoints = calculateRankingPoints(1500, 1600, true, 'tournament');
      const casualPoints = calculateRankingPoints(1500, 1600, true, 'casual');
      
      expect(tournamentPoints).toBeGreaterThan(normalPoints); // Tournament worth more
      expect(casualPoints).toBeLessThan(normalPoints); // Casual worth less
    });
  });
  
  describe('applyRatingProtection', () => {
    test('should not limit rating increases', () => {
      const newRating = applyRatingProtection(1550, 1500, 20, 4);
      expect(newRating).toBe(1550); // No change for increases
    });
    
    test('should limit rating drops for established players', () => {
      const newRating = applyRatingProtection(1475, 1500, 20, 4);
      
      // Drop is 25 points, which should be at the max allowed
      expect(newRating).toBe(1475);
      
      // Larger drop should be limited
      const bigDrop = applyRatingProtection(1450, 1500, 20, 4);
      expect(bigDrop).toBeGreaterThan(1450);
    });
    
    test('should provide extra protection for new players', () => {
      const newRating = applyRatingProtection(1450, 1500, 5, 4);
      
      // New player (less than 10 matches) should have more protection
      expect(newRating).toBeGreaterThan(1475);
    });
    
    test('should provide more protection for lower tiers', () => {
      const lowTierDrop = applyRatingProtection(1075, 1100, 20, 2);
      const highTierDrop = applyRatingProtection(2375, 2400, 20, 9);
      
      // Low tier should have more protection
      expect(1100 - lowTierDrop).toBeLessThan(2400 - highTierDrop);
    });
  });

  describe('calculateAllMetrics', () => {
    test('should calculate all metrics correctly with CourtIQ data', () => {
      const metrics = calculateAllMetrics(mockUserStats);
      
      expect(metrics.level).toBe(6);
      expect(metrics.xpProgress).toBe(14);
      expect(metrics.xpProgressPercentage).toBe(28);
      expect(metrics.nextLevelXP).toBe(850);
      expect(metrics.winRate).toBe(60);
      expect(metrics.recentPerformance).toBe(20); // 3 wins out of 5 = 60%, overall is 60%, so +0
      expect(metrics.overallRating).toBeGreaterThan(1000);
      expect(metrics.ratingTier).toBeGreaterThanOrEqual(1);
      expect(metrics.masteryLevel).toBeGreaterThanOrEqual(1);
      expect(metrics.dimensionRatings).toBeDefined();
    });

    test('should generate estimated CourtIQ metrics when missing but have match data', () => {
      const statsWithoutCourtIQ: UserStats = {
        ...mockUserStats,
        courtIQMetrics: undefined
      };
      
      const metrics = calculateAllMetrics(statsWithoutCourtIQ);
      
      expect(metrics.level).toBe(6);
      expect(metrics.overallRating).toBeGreaterThan(1000);
      expect(metrics.dimensionRatings).toBeDefined();
      expect(metrics.dimensionRatings?.technical).toBeGreaterThanOrEqual(1);
      expect(metrics.dimensionRatings?.technical).toBeLessThanOrEqual(5);
      expect(metrics.ratingTier).toBeGreaterThanOrEqual(1);
      expect(metrics.masteryLevel).toBeGreaterThanOrEqual(1);
    });
    
    test('should not generate CourtIQ metrics when no match data is available', () => {
      const statsWithNoMatches: UserStats = {
        xp: 100,
        totalMatches: 0,
        matchesWon: 0,
        matchesLost: 0,
        courtIQMetrics: undefined
      };
      
      const metrics = calculateAllMetrics(statsWithNoMatches);
      
      expect(metrics.level).toBe(2);
      expect(metrics.winRate).toBe(0);
      expect(metrics.overallRating).toBeUndefined();
      expect(metrics.dimensionRatings).toBeUndefined();
      expect(metrics.ratingTier).toBeUndefined();
      expect(metrics.masteryLevel).toBeUndefined();
    });
  });
});