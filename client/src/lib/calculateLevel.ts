/**
 * PKL-278651-PROF-0010-UTIL - Level Calculation Utility
 * 
 * This utility provides level calculation based on XP thresholds
 * with frontend-first implementation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

/**
 * XP threshold for each level
 * Index corresponds to level (e.g., levelThresholds[1] is XP needed for level 1)
 */
export const levelThresholds = [
  0,     // Level 0 (not used)
  0,     // Level 1 (starting level)
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  750,   // Level 5
  800,   // Level 6
  850,   // Level 7
  900,   // Level 8
  950,   // Level 9
  1000,  // Level 10
  1100,  // Level 11
  1200,  // Level 12
  1300,  // Level 13
  1500,  // Level 14
  1750,  // Level 15
  2000,  // Level 16
  2500,  // Level 17
  3000,  // Level 18
  4000,  // Level 19
  5000,  // Level 20
  7500,  // Level 21
  10000, // Level 22
  12500, // Level 23
  15000, // Level 24
  20000, // Level 25
  25000, // Level 26
  30000, // Level 27
  40000, // Level 28
  50000, // Level 29
  100000 // Level 30 (max level)
];

export const MAX_LEVEL = levelThresholds.length - 1;

/**
 * Calculate user level based on XP
 * @param xp - User's current XP
 * @returns The calculated level
 */
export function calculateLevel(xp: number): number {
  if (xp >= levelThresholds[MAX_LEVEL]) {
    return MAX_LEVEL;
  }
  
  // Find the highest level where the threshold is less than or equal to the user's XP
  for (let i = MAX_LEVEL - 1; i >= 1; i--) {
    if (xp >= levelThresholds[i]) {
      return i;
    }
  }
  
  return 1; // Default to level 1
}

/**
 * Calculate the XP needed for the next level
 * @param currentLevel - User's current level
 * @returns XP needed for the next level
 */
export function getNextLevelXP(currentLevel: number): number {
  const safeLevel = Math.min(Math.max(1, currentLevel), MAX_LEVEL - 1);
  return levelThresholds[safeLevel + 1];
}

/**
 * Calculate progress percentage towards the next level
 * @param xp - User's current XP
 * @param currentLevel - User's current level
 * @returns Percentage (0-100) of progress towards the next level
 */
export function calculateLevelProgress(xp: number, currentLevel: number): number {
  // If at max level, return 100%
  if (currentLevel >= MAX_LEVEL) {
    return 100;
  }
  
  const currentLevelXP = levelThresholds[currentLevel];
  const nextLevelXP = levelThresholds[currentLevel + 1];
  const xpForCurrentLevel = xp - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  
  return Math.round((xpForCurrentLevel / xpRequiredForNextLevel) * 100);
}

/**
 * Get an object with all level-related calculations
 * @param xp - User's current XP
 * @returns Object containing level, next level XP, and progress percentage
 */
export function getLevelInfo(xp: number): { 
  level: number;
  nextLevelXP: number;
  xpProgressPercentage: number;
} {
  const level = calculateLevel(xp);
  const nextLevelXP = getNextLevelXP(level);
  const xpProgressPercentage = calculateLevelProgress(xp, level);
  
  return {
    level,
    nextLevelXP,
    xpProgressPercentage
  };
}