/**
 * PKL-278651-XP-0001-FIX-CALC - Database-aligned Level Calculation
 * 
 * This utility provides level calculation that exactly matches the database's xp_levels table.
 * It ensures consistent level display across the entire application.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-05-01
 */

// XP level ranges from the database xp_levels table
export const DB_XP_LEVELS = [
  { level: 1, name: "Beginner", min_xp: 0, max_xp: 99 },
  { level: 2, name: "Amateur", min_xp: 100, max_xp: 299 },
  { level: 3, name: "Enthusiast", min_xp: 300, max_xp: 599 },
  { level: 4, name: "Competitor", min_xp: 600, max_xp: 999 },
  { level: 5, name: "Skilled Player", min_xp: 1000, max_xp: 1499 },
  { level: 6, name: "Veteran", min_xp: 1500, max_xp: 2099 },
  { level: 7, name: "Expert", min_xp: 2100, max_xp: 2799 },
  { level: 8, name: "Elite", min_xp: 2800, max_xp: 3599 },
  { level: 9, name: "Master", min_xp: 3600, max_xp: 4499 },
  { level: 10, name: "Champion", min_xp: 4500, max_xp: 5499 }
];

interface LevelInfo {
  level: number;
  name: string;
  currentXp: number;
  minXpForCurrentLevel: number;
  maxXpForCurrentLevel: number;
  minXpForNextLevel: number;
  xpProgressPercentage: number;
  xpNeededForNextLevel: number;
}

/**
 * Calculate the user level from XP using the database xp_levels table ranges
 * 
 * @param xp Current XP amount
 * @returns The current level
 */
export function calculateLevelFromDb(xp: number): number {
  // Find matching level in DB_XP_LEVELS
  for (const levelData of DB_XP_LEVELS) {
    if (xp >= levelData.min_xp && xp <= levelData.max_xp) {
      return levelData.level;
    }
  }
  
  // If XP is higher than any defined level, use the highest level + extension
  const highestDefinedLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
  if (xp > highestDefinedLevel.max_xp) {
    const xpAboveHighest = xp - highestDefinedLevel.max_xp;
    const additionalLevels = Math.floor(xpAboveHighest / 1000) + 1;
    return highestDefinedLevel.level + additionalLevels;
  }
  
  // Default to level 1 if no match found (shouldn't happen with proper data)
  return 1;
}

/**
 * Get level name from level number
 * 
 * @param level The level number
 * @returns The name of the level
 */
export function getLevelName(level: number): string {
  // Find level in DB_XP_LEVELS
  const levelData = DB_XP_LEVELS.find(l => l.level === level);
  
  if (levelData) {
    return levelData.name;
  }
  
  // For levels beyond our defined table
  if (level > DB_XP_LEVELS.length) {
    return `Ultra ${DB_XP_LEVELS[DB_XP_LEVELS.length - 1].name}`;
  }
  
  // Fallback
  return "Unknown Level";
}

/**
 * Get detailed level information based on current XP
 * 
 * @param xp Current XP amount
 * @returns Detailed level information object
 */
export function getLevelInfoFromDb(xp: number): LevelInfo {
  xp = Math.max(0, xp); // Ensure XP is not negative
  
  // Get current level
  const level = calculateLevelFromDb(xp);
  
  // Find current level data
  let currentLevelData = DB_XP_LEVELS.find(l => l.level === level);
  
  // Handle levels beyond our defined table
  if (!currentLevelData) {
    const highestLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
    const levelsAbove = level - highestLevel.level;
    
    currentLevelData = {
      level,
      name: `Ultra ${highestLevel.name}`,
      min_xp: highestLevel.max_xp + 1 + (levelsAbove - 1) * 1000,
      max_xp: highestLevel.max_xp + levelsAbove * 1000
    };
  }
  
  // Find next level data
  let nextLevelData;
  if (level < DB_XP_LEVELS.length) {
    nextLevelData = DB_XP_LEVELS.find(l => l.level === level + 1);
  } else {
    nextLevelData = {
      level: level + 1,
      name: `Ultra ${getLevelName(level)}+`,
      min_xp: currentLevelData.max_xp + 1,
      max_xp: currentLevelData.max_xp + 1000
    };
  }
  
  // Calculate progress percentage
  const levelXpRange = currentLevelData.max_xp - currentLevelData.min_xp;
  const xpIntoLevel = xp - currentLevelData.min_xp;
  const xpProgressPercentage = Math.min(100, Math.round((xpIntoLevel / levelXpRange) * 100));
  
  return {
    level,
    name: currentLevelData.name,
    currentXp: xp,
    minXpForCurrentLevel: currentLevelData.min_xp,
    maxXpForCurrentLevel: currentLevelData.max_xp,
    minXpForNextLevel: nextLevelData.min_xp,
    xpProgressPercentage,
    xpNeededForNextLevel: nextLevelData.min_xp - xp
  };
}