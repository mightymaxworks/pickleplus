/**
 * Test script for the Enhanced Match Recording System (PKL-278651-MATCH-0002-XR)
 * This file tests various features of the Enhanced Match Recording System for Pickle+
 * 
 * Run with: npx tsx test-enhanced-match-recording.ts
 */

import { storage } from "./server/storage";
import { db } from "./server/db";
import { matches } from "./shared/schema";
import { eq } from "drizzle-orm";
import { matchStatistics, performanceImpacts, matchHighlights } from "./shared/match-statistics-schema";

/**
 * Test the Enhanced Match Recording System
 */
async function testEnhancedMatchRecording() {
  console.log("\n🎯 TESTING ENHANCED MATCH RECORDING SYSTEM 🎯");
  console.log("================================================");
  
  try {
    // 1. Create a test match
    console.log("\n📊 STEP 1: Creating a test match");
    const testMatch = await createTestMatch();
    console.log(`✅ Test match created with ID: ${testMatch.id}`);
    
    // 2. Add match statistics
    console.log("\n📊 STEP 2: Adding match statistics");
    const matchStats = await addMatchStatistics(testMatch.id);
    console.log(`✅ Match statistics added with ID: ${matchStats.id}`);
    
    // 3. Add performance impacts
    console.log("\n📊 STEP 3: Adding performance impacts");
    const impacts = await addPerformanceImpacts(testMatch.id);
    console.log(`✅ Added ${impacts.length} performance impacts`);
    
    // 4. Add match highlights
    console.log("\n📊 STEP 4: Adding match highlights");
    const highlights = await addMatchHighlights(testMatch.id);
    console.log(`✅ Added ${highlights.length} match highlights`);
    
    // 5. Retrieve all data to verify
    console.log("\n📊 STEP 5: Retrieving all data to verify");
    await verifyData(testMatch.id);
    
    console.log("\n✅ ENHANCED MATCH RECORDING SYSTEM TEST COMPLETED SUCCESSFULLY");
  } catch (error) {
    console.error("❌ Error testing Enhanced Match Recording System:", error);
  }
}

/**
 * Create a test match for the enhanced match recording system
 */
async function createTestMatch() {
  const matchData = {
    playerOneId: 1, // Assuming user ID 1 exists
    playerTwoId: 2, // Assuming user ID 2 exists
    winnerId: 1,
    scorePlayerOne: "11-9, 11-8",
    scorePlayerTwo: "9-11, 8-11",
    formatType: "singles" as const,
    scoringSystem: "traditional" as const,
    matchType: "casual" as const,
    division: "open" as const,
    location: "Test Court",
    matchDate: new Date(),
    durationMinutes: 45,
    notes: "Test match for Enhanced Match Recording System",
    isValidated: false,
    isRated: true,
    pointsAwarded: 100, // Add points_awarded value to satisfy not-null constraint
    xpAwarded: 50     // Add xp_awarded value to satisfy not-null constraint
  };
  
  return await storage.createMatch(matchData);
}

/**
 * Add match statistics to a test match
 */
async function addMatchStatistics(matchId: number) {
  // Use camelCase names as expected by the storage interface
  const statsData = {
    matchId: matchId,
    totalPoints: 38,
    rallyLengthAvg: 8.5,
    longestRally: 24,
    unforcedErrors: 12,
    winners: 16,
    netPointsWon: 14,
    netPointsTotal: 22,
    dinkPointsWon: 10,
    dinkPointsTotal: 15,
    servePointsWon: 18,
    servePointsTotal: 25,
    returnPointsWon: 12,
    returnPointsTotal: 20,
    thirdShotSuccessRate: 65.5,
    timeAtNetPct: 72.3,
    distanceCoveredMeters: 825.5,
    avgShotSpeedKph: 35.7,
    metadata: {
      heatmap: {
        winningShots: [
          { x: 2, y: 3, count: 5 },
          { x: 5, y: 1, count: 3 },
          { x: 7, y: 2, count: 4 }
        ],
        errors: [
          { x: 3, y: 6, count: 2 },
          { x: 1, y: 2, count: 3 }
        ]
      }
    }
  };
  
  return await storage.createMatchStatistics(statsData);
}

/**
 * Add performance impacts for players in the test match
 */
async function addPerformanceImpacts(matchId: number) {
  const impacts = [
    // Player 1 impacts
    {
      matchId: matchId,
      userId: 1,
      dimension: "forehandStrength",
      impactValue: 2,
      reason: "Demonstrated excellent forehand technique and power throughout the match"
    },
    {
      matchId: matchId,
      userId: 1,
      dimension: "dinkAccuracy",
      impactValue: 1,
      reason: "Showed consistent dinking ability at the kitchen line"
    },
    {
      matchId: matchId,
      userId: 1,
      dimension: "servePower",
      impactValue: -1,
      reason: "Struggled with serve consistency in the second game"
    },
    
    // Player 2 impacts
    {
      matchId: matchId,
      userId: 2,
      dimension: "backhandStrength",
      impactValue: 2,
      reason: "Excellent backhand shots, particularly cross-court"
    },
    {
      matchId: matchId,
      userId: 2,
      dimension: "courtCoverage",
      impactValue: 1,
      reason: "Showed great movement and court coverage despite the loss"
    }
  ];
  
  const results = [];
  for (const impact of impacts) {
    const result = await storage.createPerformanceImpact(impact);
    results.push(result);
  }
  
  return results;
}

/**
 * Add match highlights for the test match
 */
async function addMatchHighlights(matchId: number) {
  const highlights = [
    {
      matchId: matchId,
      userId: 1,
      highlightType: "exceptional_play",
      description: "Amazing around-the-post winner in game 1",
      timestampSeconds: 360
    },
    {
      matchId: matchId,
      userId: 1,
      highlightType: "critical_moment",
      description: "Game-winning shot at 10-8 in the second game",
      timestampSeconds: 2340
    },
    {
      matchId: matchId,
      userId: 2,
      highlightType: "exceptional_play",
      description: "Perfect third shot drop that landed within inches of the kitchen line",
      timestampSeconds: 720
    }
  ];
  
  const results = [];
  for (const highlight of highlights) {
    const result = await storage.createMatchHighlight(highlight);
    results.push(result);
  }
  
  return results;
}

/**
 * Verify that all the data was correctly stored and can be retrieved
 */
async function verifyData(matchId: number) {
  // Verify match exists
  const match = await storage.getMatch(matchId);
  if (!match) {
    throw new Error(`Match with ID ${matchId} not found`);
  }
  console.log(`✅ Match verification successful. Match data:`, JSON.stringify(match, null, 2));
  
  // Verify match statistics
  const stats = await storage.getMatchStatistics(matchId);
  if (!stats) {
    throw new Error(`Match statistics for match ID ${matchId} not found`);
  }
  console.log(`✅ Match statistics verification successful. Stats summary:
    Total Points: ${stats.totalPoints}
    Rally Length Avg: ${stats.rallyLengthAvg}
    Winners: ${stats.winners}
    Unforced Errors: ${stats.unforcedErrors}
  `);
  
  // Verify performance impacts
  const impacts = await storage.getPerformanceImpacts(matchId);
  if (impacts.length === 0) {
    throw new Error(`No performance impacts found for match ID ${matchId}`);
  }
  console.log(`✅ Performance impacts verification successful. Found ${impacts.length} impacts.`);
  
  // Verify player 1 specific impacts
  const player1Impacts = await storage.getPerformanceImpacts(matchId, 1);
  console.log(`✅ Player 1 has ${player1Impacts.length} performance impacts.`);
  
  // Verify match highlights
  const highlights = await storage.getMatchHighlights(matchId);
  if (highlights.length === 0) {
    throw new Error(`No match highlights found for match ID ${matchId}`);
  }
  console.log(`✅ Match highlights verification successful. Found ${highlights.length} highlights.`);
  
  // Verify player 2 specific highlights
  const player2Highlights = await storage.getMatchHighlights(matchId, 2);
  console.log(`✅ Player 2 has ${player2Highlights.length} match highlights.`);
  
  return true;
}

// Run the test
testEnhancedMatchRecording()
  .then(() => {
    console.log("\n🎉 Tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });