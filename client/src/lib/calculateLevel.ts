/**
 * PKL-278651-XP-0007-LEVEL - XP Level Calculation Utility
 * 
 * This utility file provides functions to calculate the correct user level
 * based on XP thresholds. It ensures consistent level calculation across the app.
 */

/**
 * Calculate the user's level based on their XP amount
 * @param xp Current XP amount
 * @returns The calculated level
 */
export function calculateLevelFromXP(xp: number): number {
  // Define explicit thresholds for levels
  const levelThresholds: { [key: number]: number } = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 750,
    10: 1000,
    15: 2000,
    20: 4000
  };

  // If no XP, return level 1
  if (!xp) return 1;
  
  // Find the highest level threshold that is less than or equal to the user's XP
  let calculatedLevel = 1;
  
  for (const [level, threshold] of Object.entries(levelThresholds)) {
    const levelNum = Number(level);
    if (xp >= threshold) {
      calculatedLevel = Math.max(calculatedLevel, levelNum);
    }
  }

  // For XP beyond our explicit thresholds
  if (xp >= 4000) {
    // Level 21-40: moderate growth
    for (let level = 21; level <= 40; level++) {
      const threshold = 4000 + 100 * Math.pow(level - 20, 2);
      if (xp < threshold) break;
      calculatedLevel = level;
    }
    
    // Level 41-60: faster growth
    if (calculatedLevel >= 40) {
      for (let level = 41; level <= 60; level++) {
        const threshold = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(level - 40, 2);
        if (xp < threshold) break;
        calculatedLevel = level;
      }
    }
    
    // Level 61-80: even faster growth
    if (calculatedLevel >= 60) {
      for (let level = 61; level <= 80; level++) {
        const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2);
        const threshold = base + 300 * Math.pow(level - 60, 2);
        if (xp < threshold) break;
        calculatedLevel = level;
      }
    }
    
    // Level 81-100: most challenging growth
    if (calculatedLevel >= 80) {
      for (let level = 81; level <= 100; level++) {
        const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2) + 300 * Math.pow(20, 2);
        const threshold = base + 500 * Math.pow(level - 80, 2);
        if (xp < threshold) break;
        calculatedLevel = level;
      }
    }
  }
  
  return calculatedLevel;
}

/**
 * Get XP required for a specific level
 * @param level Target level
 * @returns XP amount required
 */
export function getXpRequiredForLevel(level: number): number {
  // Define explicit thresholds for early levels (for backward compatibility)
  const earlyLevels: { [key: number]: number } = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 750,
    10: 1000,
    15: 2000,
    20: 4000
  };
  
  if (level in earlyLevels) {
    return earlyLevels[level];
  }
  
  // For levels 1-20, use the existing progression if defined
  if (level <= 20) {
    // Linear interpolation between defined points
    const lowerBound = 
      Object.keys(earlyLevels)
        .map(Number)
        .filter(l => l <= level)
        .sort((a, b) => b - a)[0] || 1;
        
    const upperBound = 
      Object.keys(earlyLevels)
        .map(Number)
        .filter(l => l > level)
        .sort((a, b) => a - b)[0] || 20;
    
    const lowerXP = earlyLevels[lowerBound];
    const upperXP = earlyLevels[upperBound];
    
    // Linear interpolation
    return Math.round(
      lowerXP + (upperXP - lowerXP) * (level - lowerBound) / (upperBound - lowerBound)
    );
  }
  
  // For levels 21-40, moderate growth: 1000 + 100 * (level - 20)^2
  if (level <= 40) {
    return 4000 + 100 * Math.pow(level - 20, 2);
  }
  
  // For levels 41-60, faster growth: quadratic formula with steeper coefficient
  if (level <= 60) {
    return 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(level - 40, 2);
  }
  
  // For levels 61-80, even faster growth
  if (level <= 80) {
    const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2);
    return base + 300 * Math.pow(level - 60, 2);
  }
  
  // For levels 81-100, most challenging growth
  const base = 4000 + 100 * Math.pow(20, 2) + 200 * Math.pow(20, 2) + 300 * Math.pow(20, 2);
  return base + 500 * Math.pow(level - 80, 2);
}