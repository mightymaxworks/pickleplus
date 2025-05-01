/**
 * Script to compare different XP level calculation methods
 * Run with: npx tsx test-level-calc.ts
 */

// Frontend calculation (client/src/lib/calculateLevel.ts)
const XP_THRESHOLDS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  750,    // Level 5: 750 XP
  1000,   // Level 6: 1,000 XP
  1300,   // Level 7: 1,300 XP
];

function calculateLevelFrontend(xp: number): number {
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

// Database-based calculation (matches xp_levels table)
const DB_XP_LEVELS = [
  { level: 1, name: "Beginner", min_xp: 0, max_xp: 99 },
  { level: 2, name: "Amateur", min_xp: 100, max_xp: 299 },
  { level: 3, name: "Enthusiast", min_xp: 300, max_xp: 599 },
  { level: 4, name: "Competitor", min_xp: 600, max_xp: 999 },
  { level: 5, name: "Skilled Player", min_xp: 1000, max_xp: 1499 },
  { level: 6, name: "Veteran", min_xp: 1500, max_xp: 2099 },
  { level: 7, name: "Expert", min_xp: 2100, max_xp: 2799 },
];

function calculateLevelDatabase(xp: number): number {
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
  
  return 1;
}

// Original simple storage.ts calculation
function calculateLevelSimple(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

// Test XP values to compare
const testXpValues = [0, 50, 100, 250, 500, 600, 750, 814, 826, 936, 1000, 1500, 2000, 2500, 3000];

console.log("XP Level Calculation Comparison");
console.log("-------------------------------");
console.log("XP\tFrontend\tDatabase\tSimple");
console.log("-------------------------------");

for (const xp of testXpValues) {
  const frontendLevel = calculateLevelFrontend(xp);
  const databaseLevel = calculateLevelDatabase(xp);
  const simpleLevel = calculateLevelSimple(xp);
  
  console.log(`${xp}\t${frontendLevel}\t\t${databaseLevel}\t\t${simpleLevel}`);
}

// Specific focus on mightymax XP (826)
console.log("\nMightymax Case Study (XP = 826)");
console.log("-------------------------------");
console.log(`Frontend calculation: Level ${calculateLevelFrontend(826)}`);
console.log(`Database calculation: Level ${calculateLevelDatabase(826)}`);
console.log(`Simple calculation:   Level ${calculateLevelSimple(826)}`);

// After update with 110 XP added (936)
console.log("\nAfter XP Update (XP = 936)");
console.log("-------------------------------");
console.log(`Frontend calculation: Level ${calculateLevelFrontend(936)}`);
console.log(`Database calculation: Level ${calculateLevelDatabase(936)}`);
console.log(`Simple calculation:   Level ${calculateLevelSimple(936)}`);