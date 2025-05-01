/**
 * PKL-278651-PROF-0021-UTIL - Database-Synchronized Level Calculation Utility
 * 
 * This utility provides level calculation that matches the database xp_levels table.
 * Use this to synchronize frontend level display with backend database values.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-05-01
 */

/**
 * XP level thresholds from the database xp_levels table
 * Each entry represents a level with min and max XP values
 */
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

/**
 * Interface for detailed level information
 */
export interface DbLevelInfo {
  level: number;
  name: string;
  currentXp: number;
  minXp: number;
  maxXp: number;
  nextLevelMinXp: number;
  progressPercent: number;
  xpToNextLevel: number;
}

/**
 * Calculate level from XP based on the database xp_levels table
 * 
 * @param xp - Current XP amount
 * @returns Current level number
 */
export function calculateLevelFromDb(xp: number): number {
  // Ensure XP is not negative
  xp = Math.max(0, xp);
  
  // Find matching level in DB_XP_LEVELS
  for (const levelData of DB_XP_LEVELS) {
    if (xp >= levelData.min_xp && xp <= levelData.max_xp) {
      return levelData.level;
    }
  }
  
  // If XP is higher than any defined level, use the highest level + extension
  const highestDefinedLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
  if (xp > highestDefinedLevel.max_xp) {
    // Calculate additional levels beyond defined ones
    // For each 1000 XP above the highest defined level, add one level
    const xpAboveHighest = xp - highestDefinedLevel.max_xp;
    const additionalLevels = Math.floor(xpAboveHighest / 1000) + 1;
    return highestDefinedLevel.level + additionalLevels;
  }
  
  // Default to level 1 if no match found (shouldn't happen)
  return 1;
}

/**
 * Get the name of a level
 * 
 * @param level - Level number
 * @returns Name of the level or "Advanced" for levels beyond defined ones
 */
export function getLevelName(level: number): string {
  const levelData = DB_XP_LEVELS.find(data => data.level === level);
  return levelData ? levelData.name : "Advanced";
}

/**
 * Get detailed level information from XP
 * 
 * @param xp - Current XP amount
 * @returns Detailed level information
 */
export function getDbLevelInfo(xp: number): DbLevelInfo {
  // Ensure XP is not negative
  xp = Math.max(0, xp);
  
  // Calculate current level
  const level = calculateLevelFromDb(xp);
  
  // Find level data
  const levelData = DB_XP_LEVELS.find(data => data.level === level);
  
  if (levelData) {
    // For defined levels
    const nextLevelData = DB_XP_LEVELS.find(data => data.level === level + 1);
    const nextLevelMinXp = nextLevelData ? nextLevelData.min_xp : levelData.max_xp + 1;
    
    // Calculate progress percentage within the current level
    const levelRange = levelData.max_xp - levelData.min_xp;
    const xpInCurrentLevel = xp - levelData.min_xp;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / levelRange) * 100));
    
    return {
      level: level,
      name: levelData.name,
      currentXp: xp,
      minXp: levelData.min_xp,
      maxXp: levelData.max_xp,
      nextLevelMinXp: nextLevelMinXp,
      progressPercent: progressPercent,
      xpToNextLevel: nextLevelMinXp - xp
    };
  } else {
    // For levels beyond defined ones
    const highestLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
    const levelsAbove = level - highestLevel.level;
    
    // Calculate min/max for extended levels
    const minXp = highestLevel.max_xp + 1 + (levelsAbove - 1) * 1000;
    const maxXp = minXp + 999;
    const nextLevelMinXp = maxXp + 1;
    
    // Calculate progress percentage
    const xpInCurrentLevel = xp - minXp;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 1000) * 100));
    
    return {
      level: level,
      name: "Advanced",
      currentXp: xp,
      minXp: minXp,
      maxXp: maxXp,
      nextLevelMinXp: nextLevelMinXp,
      progressPercent: progressPercent,
      xpToNextLevel: nextLevelMinXp - xp
    };
  }
}