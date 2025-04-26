/**
 * PKL-278651-CALC-0004-TEST - Unit Tests for Level Calculation
 * 
 * This file contains tests for the level calculation utility functions.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { calculateLevelFromXP, getXpRequiredForLevel } from '../calculateLevel';

describe('Level Calculation Utilities', () => {
  describe('calculateLevelFromXP', () => {
    test('should return level 1 for XP below first threshold', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(50)).toBe(1);
      expect(calculateLevelFromXP(99)).toBe(1);
    });

    test('should return correct level for exact threshold values', () => {
      expect(calculateLevelFromXP(100)).toBe(2); // Level 2 threshold
      expect(calculateLevelFromXP(250)).toBe(3); // Level 3 threshold
      expect(calculateLevelFromXP(500)).toBe(4); // Level 4 threshold
      expect(calculateLevelFromXP(750)).toBe(5); // Level 5 threshold
      expect(calculateLevelFromXP(800)).toBe(6); // Level 6 threshold
      expect(calculateLevelFromXP(850)).toBe(7); // Level 7 threshold
    });

    test('should return correct level for values between thresholds', () => {
      expect(calculateLevelFromXP(175)).toBe(2); // Between 2 and 3
      expect(calculateLevelFromXP(300)).toBe(3); // Between 3 and 4
      expect(calculateLevelFromXP(600)).toBe(4); // Between 4 and 5
      expect(calculateLevelFromXP(780)).toBe(5); // Between 5 and 6
      expect(calculateLevelFromXP(825)).toBe(6); // Between 6 and 7
    });

    test('should return the specific level 6 for XP = 814', () => {
      // This is our main user case that needed fixing
      expect(calculateLevelFromXP(814)).toBe(6);
    });

    test('should handle extremely large XP values', () => {
      // For very high XP values, we should still get reasonable levels
      expect(calculateLevelFromXP(1000)).toBeGreaterThan(7);
      expect(calculateLevelFromXP(10000)).toBeGreaterThan(10);
    });
  });

  describe('getXpRequiredForLevel', () => {
    test('should return correct XP thresholds for each level', () => {
      expect(getXpRequiredForLevel(1)).toBe(0);
      expect(getXpRequiredForLevel(2)).toBe(100);
      expect(getXpRequiredForLevel(3)).toBe(250);
      expect(getXpRequiredForLevel(4)).toBe(500);
      expect(getXpRequiredForLevel(5)).toBe(750);
      expect(getXpRequiredForLevel(6)).toBe(800);
      expect(getXpRequiredForLevel(7)).toBe(850);
    });

    test('should return 0 for invalid levels', () => {
      expect(getXpRequiredForLevel(0)).toBe(0);
      expect(getXpRequiredForLevel(-1)).toBe(0);
    });

    test('should handle high level values', () => {
      expect(getXpRequiredForLevel(10)).toBeGreaterThan(getXpRequiredForLevel(9));
      expect(getXpRequiredForLevel(20)).toBeGreaterThan(getXpRequiredForLevel(15));
    });
  });

  describe('Level Calculation Integration', () => {
    test('should consistently determine levels across functions', () => {
      // For any XP amount, passing it to calculateLevelFromXP should return a level,
      // and that level's XP requirement should be less than or equal to the original XP
      const testXPValues = [0, 50, 100, 200, 300, 500, 750, 800, 814, 850, 1000, 1500];
      
      testXPValues.forEach(xp => {
        const level = calculateLevelFromXP(xp);
        const requiredXP = getXpRequiredForLevel(level);
        
        expect(xp).toBeGreaterThanOrEqual(requiredXP);
        
        // Also verify the next level requires more XP than we have
        const nextLevelXP = getXpRequiredForLevel(level + 1);
        if (level < 7) { // Only test this for known levels with defined thresholds
          expect(xp).toBeLessThan(nextLevelXP);
        }
      });
    });
  });
});