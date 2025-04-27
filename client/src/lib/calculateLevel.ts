/**
 * PKL-278651-PROF-0021-UTIL - Level Calculation Utility
 * 
 * Utility functions for calculating level information from XP.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpProgressPercentage: number;
  totalXpForCurrentLevel: number;
  xpNeededForNextLevel: number;
}

// XP thresholds for each level
const XP_THRESHOLDS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  750,    // Level 5: 750 XP
  1000,   // Level 6: 1,000 XP
  1300,   // Level 7: 1,300 XP
  1650,   // Level 8: 1,650 XP
  2050,   // Level 9: 2,050 XP
  2500,   // Level 10: 2,500 XP
  3000,   // Level 11: 3,000 XP
  3600,   // Level 12: 3,600 XP
  4300,   // Level 13: 4,300 XP
  5100,   // Level 14: 5,100 XP
  6000,   // Level 15: 6,000 XP
  7000,   // Level 16: 7,000 XP
  8200,   // Level 17: 8,200 XP
  9500,   // Level 18: 9,500 XP
  11000,  // Level 19: 11,000 XP
  12500,  // Level 20: 12,500 XP
  15000,  // Level 21: 15,000 XP
  20000,  // Level 22: 20,000 XP
  25000,  // Level 23: 25,000 XP
  30000,  // Level 24: 30,000 XP
  40000,  // Level 25: 40,000 XP
  50000,  // Level 26: 50,000 XP
  60000,  // Level 27: 60,000 XP
  75000,  // Level 28: 75,000 XP
  100000, // Level 29: 100,000 XP
  150000  // Level 30: 150,000 XP
];

// Calculate XP required for levels beyond the predefined thresholds
function calculateXpForHighLevel(level: number): number {
  // For levels beyond our threshold table, increase by 50% each level
  const lastDefinedLevel = XP_THRESHOLDS.length;
  const lastDefinedXp = XP_THRESHOLDS[lastDefinedLevel - 1];
  
  // Calculate how many levels beyond the table
  const levelsOver = level - lastDefinedLevel;
  
  // Each level beyond increases by 50%
  let requiredXp = lastDefinedXp;
  for (let i = 0; i < levelsOver; i++) {
    requiredXp = Math.round(requiredXp * 1.5);
  }
  
  return requiredXp;
}

/**
 * Calculate level information from XP
 * 
 * @param xp - Current XP amount
 * @returns Level information including current level, next level XP, etc.
 */
export function getLevelInfo(xp: number): LevelInfo {
  xp = Math.max(0, xp); // Ensure XP is not negative
  
  // Find the current level by finding the highest threshold that is <= the XP
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  // Handle levels beyond our predefined thresholds
  if (level > XP_THRESHOLDS.length) {
    let testLevel = XP_THRESHOLDS.length + 1;
    let testXp = calculateXpForHighLevel(testLevel);
    
    while (xp >= testXp) {
      level = testLevel;
      testLevel++;
      testXp = calculateXpForHighLevel(testLevel);
    }
  }
  
  // Get XP threshold for current and next level
  const currentLevelXP = level <= XP_THRESHOLDS.length ? 
    XP_THRESHOLDS[level - 1] : calculateXpForHighLevel(level);
    
  const nextLevelXP = level < XP_THRESHOLDS.length ? 
    XP_THRESHOLDS[level] : calculateXpForHighLevel(level + 1);
  
  // Calculate XP progress percentage to next level
  const totalXpForCurrentLevel = nextLevelXP - currentLevelXP;
  const xpProgressInCurrentLevel = xp - currentLevelXP;
  const xpProgressPercentage = Math.min(100, Math.round((xpProgressInCurrentLevel / totalXpForCurrentLevel) * 100));
  
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpProgressPercentage,
    totalXpForCurrentLevel,
    xpNeededForNextLevel: nextLevelXP - xp
  };
}

/**
 * Calculate the level from XP (simplified version)
 * 
 * @param xp - Current XP amount
 * @returns Current level
 */
export function calculateLevel(xp: number): number {
  return getLevelInfo(xp).level;
}

/**
 * Get the XP required to reach a specific level
 * 
 * @param level - The target level
 * @returns XP required for the specified level
 */
export function getNextLevelXP(level: number): number {
  if (level <= 0) return 0;
  
  // Use predefined thresholds for levels in our table
  if (level <= XP_THRESHOLDS.length) {
    return XP_THRESHOLDS[level - 1];
  }
  
  // Calculate XP for levels beyond our table
  return calculateXpForHighLevel(level);
}