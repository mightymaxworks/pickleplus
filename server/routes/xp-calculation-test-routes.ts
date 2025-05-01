/**
 * PKL-278651-XP-0001-FIX-ROUTES - XP Level Calculation Test Routes
 * 
 * These routes allow testing of XP level calculation directly via API calls.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-05-01
 */

import { Express, Request, Response } from "express";
import { db } from "../db";

// Database XP level ranges
const DB_XP_LEVELS = [
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
 * Calculate level based on XP using database logic
 */
function calculateLevelFromDb(xp: number): number {
  for (const levelData of DB_XP_LEVELS) {
    if (xp >= levelData.min_xp && xp <= levelData.max_xp) {
      return levelData.level;
    }
  }
  
  const highestDefinedLevel = DB_XP_LEVELS[DB_XP_LEVELS.length - 1];
  if (xp > highestDefinedLevel.max_xp) {
    const xpAboveHighest = xp - highestDefinedLevel.max_xp;
    const additionalLevels = Math.floor(xpAboveHighest / 1000) + 1;
    return highestDefinedLevel.level + additionalLevels;
  }
  
  return 1;
}

/**
 * Frontend legacy calculation (for comparison)
 */
function calculateLevelFromFrontend(xp: number): number {
  // XP thresholds from frontend
  const XP_THRESHOLDS = [
    0,     // Level 1: 0 XP
    100,   // Level 2: 100 XP
    250,   // Level 3: 250 XP
    500,   // Level 4: 500 XP
    750,   // Level 5: 750 XP
    1000,  // Level 6: 1,000 XP
    1300,  // Level 7: 1,300 XP
  ];
  
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  return level;
}

/**
 * Original simple calculation (for comparison)
 */
function calculateLevelSimple(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

/**
 * Register XP calculation test routes
 */
export function registerXpCalculationTestRoutes(app: Express) {
  console.log("[API] Registering XP Calculation Test Routes");
  
  /**
   * GET /api/test/xp-calc/:xp
   * Test XP level calculation with various methods
   */
  app.get("/api/test/xp-calc/:xp", async (req: Request, res: Response) => {
    try {
      const xp = parseInt(req.params.xp);
      
      if (isNaN(xp) || xp < 0) {
        return res.status(400).json({
          success: false,
          error: "XP must be a non-negative number"
        });
      }
      
      // Get level using database query
      const levelResult = await db.execute(
        `SELECT * FROM xp_levels WHERE ${xp} >= min_xp AND ${xp} <= max_xp`
      );
      
      let dbQueryLevel = 1;
      if (levelResult.rows && levelResult.rows.length > 0) {
        dbQueryLevel = levelResult.rows[0].level;
      } else {
        // If XP is higher than any defined level
        const highestLevelResult = await db.execute(
          `SELECT * FROM xp_levels ORDER BY level DESC LIMIT 1`
        );
        
        if (highestLevelResult.rows && highestLevelResult.rows.length > 0) {
          const highestLevel = highestLevelResult.rows[0];
          if (xp > highestLevel.max_xp) {
            const xpAboveHighest = xp - highestLevel.max_xp;
            const additionalLevels = Math.floor(xpAboveHighest / 1000) + 1;
            dbQueryLevel = highestLevel.level + additionalLevels;
          }
        }
      }
      
      // Get current XP level data
      let currentLevelData = null;
      if (dbQueryLevel <= DB_XP_LEVELS.length) {
        currentLevelData = DB_XP_LEVELS.find(l => l.level === dbQueryLevel);
      }
      
      // Get next XP level data
      let nextLevelData = null;
      if (dbQueryLevel < DB_XP_LEVELS.length) {
        nextLevelData = DB_XP_LEVELS.find(l => l.level === dbQueryLevel + 1);
      }
      
      // Calculate progress percentage
      let xpProgressPercentage = 0;
      if (currentLevelData && nextLevelData) {
        const levelXpRange = nextLevelData.min_xp - currentLevelData.min_xp;
        const xpIntoLevel = xp - currentLevelData.min_xp;
        xpProgressPercentage = Math.min(100, Math.round((xpIntoLevel / levelXpRange) * 100));
      }
      
      return res.status(200).json({
        success: true,
        results: {
          xp,
          calculations: {
            database_query: dbQueryLevel,
            database_static: calculateLevelFromDb(xp),
            frontend_legacy: calculateLevelFromFrontend(xp),
            simple: calculateLevelSimple(xp)
          },
          currentLevel: {
            level: dbQueryLevel,
            name: currentLevelData?.name || "Unknown",
            minXp: currentLevelData?.min_xp || 0,
            maxXp: currentLevelData?.max_xp || 0
          },
          nextLevel: nextLevelData ? {
            level: nextLevelData.level,
            name: nextLevelData.name,
            minXp: nextLevelData.min_xp,
            xpNeeded: nextLevelData.min_xp - xp
          } : null,
          progress: {
            percentage: xpProgressPercentage,
            visual: `[${'='.repeat(Math.floor(xpProgressPercentage / 10))}${' '.repeat(10 - Math.floor(xpProgressPercentage / 10))}] ${xpProgressPercentage}%`
          }
        }
      });
    } catch (error) {
      console.error("[XP Calc Test] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  
  console.log("[API] XP Calculation Test Routes registered successfully");
}