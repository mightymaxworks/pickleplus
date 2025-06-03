/**
 * PKL-278651-PROF-0021-UTIL - Points Level Calculation Utility
 * 
 * Utility functions for calculating level information from Pickle+ Points.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastUpdated 2025-06-03
 */

interface PointsLevelInfo {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  pointsProgressPercentage: number;
  totalPointsForCurrentLevel: number;
  pointsNeededForNextLevel: number;
}

// Points thresholds for each level (Dill Dollars)
const POINTS_THRESHOLDS = [
  0,      // Level 1: 0 Points
  100,    // Level 2: 100 Points
  250,    // Level 3: 250 Points
  500,    // Level 4: 500 Points
  750,    // Level 5: 750 Points
  1000,   // Level 6: 1,000 Points
  1300,   // Level 7: 1,300 Points
  1650,   // Level 8: 1,650 Points
  2050,   // Level 9: 2,050 Points
  2500,   // Level 10: 2,500 Points
  3000,   // Level 11: 3,000 Points
  3600,   // Level 12: 3,600 Points
  4300,   // Level 13: 4,300 Points
  5100,   // Level 14: 5,100 Points
  6000,   // Level 15: 6,000 Points
  7000,   // Level 16: 7,000 Points
  8200,   // Level 17: 8,200 Points
  9500,   // Level 18: 9,500 Points
  11000,  // Level 19: 11,000 Points
  12500,  // Level 20: 12,500 Points
  15000,  // Level 21: 15,000 Points
  20000,  // Level 22: 20,000 Points
  25000,  // Level 23: 25,000 Points
  30000,  // Level 24: 30,000 Points
  40000,  // Level 25: 40,000 Points
  50000,  // Level 26: 50,000 Points
  60000,  // Level 27: 60,000 Points
  75000,  // Level 28: 75,000 Points
  100000, // Level 29: 100,000 Points
  150000  // Level 30: 150,000 Points
];

// Calculate points required for levels beyond the predefined thresholds
function calculatePointsForHighLevel(level: number): number {
  // For levels beyond our threshold table, increase by 50% each level
  const lastDefinedLevel = POINTS_THRESHOLDS.length;
  const lastDefinedPoints = POINTS_THRESHOLDS[lastDefinedLevel - 1];
  
  // Calculate how many levels beyond the table
  const levelsOver = level - lastDefinedLevel;
  
  // Each level beyond increases by 50%
  let requiredPoints = lastDefinedPoints;
  for (let i = 0; i < levelsOver; i++) {
    requiredPoints = Math.round(requiredPoints * 1.5);
  }
  
  return requiredPoints;
}

/**
 * Calculate level information from Pickle+ Points
 * 
 * @param points - Current points amount
 * @returns Level information including current level, next level points, etc.
 */
export function getPointsLevelInfo(points: number): PointsLevelInfo {
  points = Math.max(0, points); // Ensure points is not negative
  
  // Find the current level by finding the highest threshold that is <= the points
  let level = 1;
  for (let i = 1; i < POINTS_THRESHOLDS.length; i++) {
    if (points >= POINTS_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  // Handle levels beyond our predefined thresholds
  if (level > POINTS_THRESHOLDS.length) {
    let testLevel = POINTS_THRESHOLDS.length + 1;
    let testPoints = calculatePointsForHighLevel(testLevel);
    
    while (points >= testPoints) {
      level = testLevel;
      testLevel++;
      testPoints = calculatePointsForHighLevel(testLevel);
    }
  }
  
  // Get points threshold for current and next level
  const currentLevelPoints = level <= POINTS_THRESHOLDS.length ? 
    POINTS_THRESHOLDS[level - 1] : calculatePointsForHighLevel(level);
    
  const nextLevelPoints = level < POINTS_THRESHOLDS.length ? 
    POINTS_THRESHOLDS[level] : calculatePointsForHighLevel(level + 1);
  
  // Calculate points progress percentage to next level
  const totalPointsForCurrentLevel = nextLevelPoints - currentLevelPoints;
  const pointsProgressInCurrentLevel = points - currentLevelPoints;
  const pointsProgressPercentage = Math.min(100, Math.round((pointsProgressInCurrentLevel / totalPointsForCurrentLevel) * 100));
  
  return {
    level,
    currentLevelPoints,
    nextLevelPoints,
    pointsProgressPercentage,
    totalPointsForCurrentLevel,
    pointsNeededForNextLevel: nextLevelPoints - points
  };
}

/**
 * Calculate the level from points (simplified version)
 * 
 * @param points - Current points amount
 * @returns Current level
 */
export function calculateLevel(points: number): number {
  return getPointsLevelInfo(points).level;
}

/**
 * Get the points required to reach a specific level
 * 
 * @param level - The target level
 * @returns Points required for the specified level
 */
export function getNextLevelPoints(level: number): number {
  if (level <= 0) return 0;
  
  // Use predefined thresholds for levels in our table
  if (level <= POINTS_THRESHOLDS.length) {
    return POINTS_THRESHOLDS[level - 1];
  }
  
  // Calculate points for levels beyond our table
  return calculatePointsForHighLevel(level);
}

// Legacy function names for backward compatibility
export const getLevelInfo = getPointsLevelInfo;
export const getNextLevelXP = getNextLevelPoints;