/**
 * PKL-278651-XP-0001-FIX-TEST - Tests for Database-aligned Level Calculation
 * 
 * This file contains comprehensive tests for the new database-aligned level calculation
 * to ensure consistent calculation across frontend and backend.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-05-01
 */

import { 
  calculateLevelFromDb, 
  getLevelInfoFromDb, 
  getLevelName, 
  DB_XP_LEVELS 
} from '../calculateLevelFromDatabase';

describe('Database-aligned Level Calculation', () => {
  describe('calculateLevelFromDb', () => {
    test('should return correct level based on database XP ranges', () => {
      // Test each level at min, middle, and max thresholds
      expect(calculateLevelFromDb(0)).toBe(1);    // Min Level 1
      expect(calculateLevelFromDb(50)).toBe(1);   // Middle Level 1
      expect(calculateLevelFromDb(99)).toBe(1);   // Max Level 1
      
      expect(calculateLevelFromDb(100)).toBe(2);  // Min Level 2
      expect(calculateLevelFromDb(200)).toBe(2);  // Middle Level 2
      expect(calculateLevelFromDb(299)).toBe(2);  // Max Level 2
      
      expect(calculateLevelFromDb(300)).toBe(3);  // Min Level 3
      expect(calculateLevelFromDb(450)).toBe(3);  // Middle Level 3
      expect(calculateLevelFromDb(599)).toBe(3);  // Max Level 3
      
      expect(calculateLevelFromDb(600)).toBe(4);  // Min Level 4
      expect(calculateLevelFromDb(800)).toBe(4);  // Middle Level 4
      expect(calculateLevelFromDb(999)).toBe(4);  // Max Level 4
      
      expect(calculateLevelFromDb(1000)).toBe(5); // Min Level 5
      expect(calculateLevelFromDb(1250)).toBe(5); // Middle Level 5
      expect(calculateLevelFromDb(1499)).toBe(5); // Max Level 5
    });

    test('should handle specific boundary cases correctly', () => {
      // Specific case for mightymax (826 XP should be Level 4)
      expect(calculateLevelFromDb(826)).toBe(4);
      
      // Test case for updated mightymax (1013 XP should be Level 5)
      expect(calculateLevelFromDb(1013)).toBe(5);
    });

    test('should handle XP above the highest defined level', () => {
      const highestLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
      const highestLevelNum = highestLevel.level;
      
      // Just above the highest defined level
      expect(calculateLevelFromDb(highestLevel.max_xp + 1))
        .toBe(highestLevelNum + 1);
      
      // Well above the highest defined level
      expect(calculateLevelFromDb(highestLevel.max_xp + 1500))
        .toBe(highestLevelNum + 2);
    });
  });

  describe('getLevelName', () => {
    test('should return correct level names for defined levels', () => {
      expect(getLevelName(1)).toBe('Beginner');
      expect(getLevelName(2)).toBe('Amateur');
      expect(getLevelName(3)).toBe('Enthusiast');
      expect(getLevelName(4)).toBe('Competitor');
      expect(getLevelName(5)).toBe('Skilled Player');
    });

    test('should handle levels above the highest defined level', () => {
      const highestLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
      
      expect(getLevelName(highestLevel.level + 1))
        .toContain('Ultra');
    });
  });

  describe('getLevelInfoFromDb', () => {
    test('should return correct level info structure', () => {
      const levelInfo = getLevelInfoFromDb(826);
      
      expect(levelInfo).toHaveProperty('level', 4);
      expect(levelInfo).toHaveProperty('name', 'Competitor');
      expect(levelInfo).toHaveProperty('currentXp', 826);
      expect(levelInfo).toHaveProperty('minXpForCurrentLevel', 600);
      expect(levelInfo).toHaveProperty('maxXpForCurrentLevel', 999);
      expect(levelInfo).toHaveProperty('minXpForNextLevel', 1000);
      expect(levelInfo).toHaveProperty('xpProgressPercentage');
      expect(levelInfo).toHaveProperty('xpNeededForNextLevel');
    });

    test('should calculate progress percentage correctly', () => {
      // 826 XP is 226 points into a 400-point range for Level 4 (600-999)
      // should be approximately 56.5%
      const levelInfo = getLevelInfoFromDb(826);
      expect(levelInfo.xpProgressPercentage).toBeCloseTo(57, 0);
      
      // Test at the beginning of a level
      const beginLevelInfo = getLevelInfoFromDb(600);
      expect(beginLevelInfo.xpProgressPercentage).toBe(0);
      
      // Test at the end of a level
      const endLevelInfo = getLevelInfoFromDb(998);
      expect(endLevelInfo.xpProgressPercentage).toBeCloseTo(99, 0);
    });

    test('should calculate XP needed for next level correctly', () => {
      const levelInfo = getLevelInfoFromDb(826);
      expect(levelInfo.xpNeededForNextLevel).toBe(174); // 1000 - 826
      
      const levelInfo2 = getLevelInfoFromDb(1200);
      expect(levelInfo2.xpNeededForNextLevel).toBe(300); // 1500 - 1200
    });
  });

  describe('Comparison with Frontend and Database Calculations', () => {
    // Define test XP values to compare calculations
    const testXpValues = [
      0, 50, 100, 200, 300, 500, 600, 750, 814, 825, 826, 936, 1000, 1013, 1500, 2000
    ];
    
    // Expected results based on the database xp_levels table
    const expectedLevels = [
      1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6
    ];
    
    test('should match expected database level calculations', () => {
      testXpValues.forEach((xp, index) => {
        const calculatedLevel = calculateLevelFromDb(xp);
        expect(calculatedLevel).toBe(expectedLevels[index]);
      });
    });
  });
});