/**
 * PKL-278651-XP-0001-FIX-ALIGN - XP Level Calculation Alignment Test
 * 
 * This test ensures that frontend and backend calculations match the database XP level thresholds.
 * Run with: npx tsx server/test/xp-level-alignment.test.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-05-01
 */

import { db } from "../db";
import { eq } from "drizzle-orm";
import assert from "assert";

// Database XP level ranges from the xp_levels table
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

// Frontend database-aligned calculation
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

// Server database query calculation
async function calculateLevelFromDbQuery(xp: number): Promise<number> {
  try {
    const levelResult = await db.execute(
      `SELECT * FROM xp_levels WHERE ${xp} >= min_xp AND ${xp} <= max_xp`
    );

    if (levelResult.rows && levelResult.rows.length > 0) {
      return levelResult.rows[0].level;
    }
    
    // If XP is higher than any defined level
    const highestLevelResult = await db.execute(
      `SELECT * FROM xp_levels ORDER BY level DESC LIMIT 1`
    );
    
    if (highestLevelResult.rows && highestLevelResult.rows.length > 0) {
      const highestLevel = highestLevelResult.rows[0];
      if (xp > highestLevel.max_xp) {
        const xpAboveHighest = xp - highestLevel.max_xp;
        const additionalLevels = Math.floor(xpAboveHighest / 1000) + 1;
        return highestLevel.level + additionalLevels;
      }
    }
    
    return 1;
  } catch (error) {
    console.error("Error calculating level from DB query:", error);
    return 1;
  }
}

// Original simple storage.ts calculation (legacy)
function calculateLevelSimple(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

// Test XP values to evaluate
const testXpValues = [
  0, 50, 99, 100, 150, 299, 300, 450, 599, 600, 800, 814, 826, 936, 1000, 1013, 1500, 2000, 2500, 3000, 4000, 5000
];

async function runAlignmentTests() {
  console.log("PKL-278651-XP-0001-FIX-ALIGN - XP Level Calculation Alignment Test");
  console.log("=====================================================================");
  console.log("XP\tFrontend\tDB Query\tSimple\tAligned?");
  console.log("-------------------------------------------------------------");
  
  let allAligned = true;
  
  for (const xp of testXpValues) {
    const frontendLevel = calculateLevelFromDb(xp);
    const dbQueryLevel = await calculateLevelFromDbQuery(xp);
    const simpleLevel = calculateLevelSimple(xp);
    
    const aligned = frontendLevel === dbQueryLevel ? "✓" : "✗";
    if (frontendLevel !== dbQueryLevel) {
      allAligned = false;
    }
    
    console.log(`${xp}\t${frontendLevel}\t\t${dbQueryLevel}\t\t${simpleLevel}\t${aligned}`);
  }
  
  console.log("\nVerifying that database XP levels match our static definitions...");
  
  // Verify database XP levels match our static definitions
  const dbLevels = await db.execute(`SELECT * FROM xp_levels ORDER BY level`);
  
  if (!dbLevels.rows || dbLevels.rows.length === 0) {
    console.error("Error: Could not retrieve xp_levels from database!");
    allAligned = false;
  } else {
    for (let i = 0; i < dbLevels.rows.length; i++) {
      const dbLevel = dbLevels.rows[i];
      const staticLevel = i < DB_XP_LEVELS.length ? DB_XP_LEVELS[i] : null;
      
      if (!staticLevel) {
        console.error(`Error: Database has level ${dbLevel.level} but static definition does not!`);
        allAligned = false;
        continue;
      }
      
      if (dbLevel.level !== staticLevel.level || 
          dbLevel.min_xp !== staticLevel.min_xp || 
          dbLevel.max_xp !== staticLevel.max_xp) {
        console.error(`Mismatch at level ${dbLevel.level}:`);
        console.error(`  Database: Level ${dbLevel.level}, Min XP ${dbLevel.min_xp}, Max XP ${dbLevel.max_xp}`);
        console.error(`  Static:   Level ${staticLevel.level}, Min XP ${staticLevel.min_xp}, Max XP ${staticLevel.max_xp}`);
        allAligned = false;
      }
    }
    
    if (dbLevels.rows.length < DB_XP_LEVELS.length) {
      console.error(`Error: Static definitions have ${DB_XP_LEVELS.length} levels but database only has ${dbLevels.rows.length}!`);
      allAligned = false;
    }
  }
  
  console.log("\nAlignment Test Result:", allAligned ? "PASSED ✓" : "FAILED ✗");
  
  if (allAligned) {
    console.log("\nAll level calculations are aligned between frontend and database!");
  } else {
    console.error("\nLevels calculations are not fully aligned! Fix needed.");
  }
  
  console.log("\nKey cases:");
  console.log("* mightymax with 826 XP: Level from DB = " + await calculateLevelFromDbQuery(826));
  console.log("* mightymax with 1013 XP: Level from DB = " + await calculateLevelFromDbQuery(1013));
  
  return allAligned;
}

// Run tests
runAlignmentTests()
  .then(result => {
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error("Error running tests:", error);
    process.exit(1);
  });