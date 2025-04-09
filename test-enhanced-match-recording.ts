/**
 * Test script for the Enhanced Match Recording System (PKL-278651-MATCH-0002-XR)
 * This file tests various features of the Enhanced Match Recording System for Pickle+
 * 
 * Run with: npx tsx test-enhanced-match-recording.ts
 */
import { db } from './server/db';
import { 
  matches, 
  InsertMatch 
} from './shared/schema';
import { 
  matchStatistics, 
  performanceImpacts, 
  matchHighlights,
  InsertMatchStatistics,
  InsertPerformanceImpact,
  InsertMatchHighlight
} from './shared/match-statistics-schema';
import { sql } from 'drizzle-orm';

/**
 * Test the Enhanced Match Recording System
 */
async function testEnhancedMatchRecording() {
  console.log("Starting Enhanced Match Recording System test...");
  
  try {
    // 1. Create a test match
    const matchId = await createTestMatch();
    console.log(`Created test match with ID: ${matchId}`);
    
    // 2. Add match statistics
    await addMatchStatistics(matchId);
    console.log("Added match statistics");
    
    // 3. Add performance impacts
    await addPerformanceImpacts(matchId);
    console.log("Added performance impacts");
    
    // 4. Add match highlights
    await addMatchHighlights(matchId);
    console.log("Added match highlights");
    
    // 5. Verify data
    await verifyData(matchId);
    
    console.log("All tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Note: No need to close the connection explicitly as db.end() is not available
    console.log("Test completed.");
  }
}

/**
 * Create a test match for the enhanced match recording system
 */
async function createTestMatch() {
  const matchData: InsertMatch = {
    playerOneId: 1, // Assuming user ID 1 exists
    playerTwoId: 2, // Assuming user ID 2 exists
    winnerId: 1,
    scorePlayerOne: "11",
    scorePlayerTwo: "9",
    formatType: "singles",
    scoringSystem: "traditional",
    pointsToWin: 11,
    matchDate: new Date(),
    location: "Test Court",
    notes: "Test match for Enhanced Match Recording System",
    division: "open",
    matchType: "casual",
    gameScores: []
  };
  
  // Insert the match
  const [match] = await db.insert(matches).values(matchData).returning();
  return match.id;
}

/**
 * Add match statistics to a test match
 */
async function addMatchStatistics(matchId: number) {
  const statsData: InsertMatchStatistics = {
    matchId,
    totalPoints: 37,
    rallyLengthAvg: 7.5,
    longestRally: 21,
    unforcedErrors: 8,
    winners: 12,
    netPointsWon: 15,
    netPointsTotal: 22,
    dinkPointsWon: 10,
    dinkPointsTotal: 18,
    servePointsWon: 8,
    servePointsTotal: 12,
    returnPointsWon: 7,
    returnPointsTotal: 13,
    thirdShotSuccessRate: 0.67,
    timeAtNetPct: 0.45,
    distanceCoveredMeters: 875.5,
    avgShotSpeedKph: 38.2,
    metadata: {
      notes: "Player demonstrated excellent net play"
    }
  };
  
  // Insert the statistics
  const [stats] = await db.insert(matchStatistics).values(statsData).returning();
  
  // Check result
  if (!stats || !stats.id) {
    throw new Error("Failed to create match statistics");
  }
  
  return stats;
}

/**
 * Add performance impacts for players in the test match
 */
async function addPerformanceImpacts(matchId: number) {
  const impacts: InsertPerformanceImpact[] = [
    {
      matchId,
      userId: 1,
      dimension: "Net Play",
      impactValue: 3,
      reason: "Demonstrated excellent net positioning and volleys",
      metadata: { detailedAnalysis: "Player showed significant improvement in hand speed at the net" }
    },
    {
      matchId,
      userId: 1,
      dimension: "Serve Accuracy",
      impactValue: 2,
      reason: "Consistently placed serves to opponent's backhand",
      metadata: { successRate: 0.78 }
    },
    {
      matchId,
      userId: 2,
      dimension: "Third Shot Drop",
      impactValue: -1,
      reason: "Struggled with third shot consistency",
      metadata: { successRate: 0.45 }
    }
  ];
  
  // Insert the impacts
  for (const impact of impacts) {
    const [result] = await db.insert(performanceImpacts).values(impact).returning();
    
    if (!result || !result.id) {
      throw new Error("Failed to create performance impact");
    }
  }
  
  // Query to verify
  const savedImpacts = await db.select().from(performanceImpacts).where(sql`match_id = ${matchId}`);
  console.log(`Added ${savedImpacts.length} performance impacts`);
  
  return savedImpacts;
}

/**
 * Add match highlights for the test match
 */
async function addMatchHighlights(matchId: number) {
  const highlights: InsertMatchHighlight[] = [
    {
      matchId,
      userId: 1,
      highlightType: "Amazing Rally",
      description: "21-shot rally ended with a perfect around-the-post winner",
      timestampSeconds: 456,
      metadata: { videoClipId: "clip-123456" }
    },
    {
      matchId,
      userId: 2,
      highlightType: "Improvement Area",
      description: "Good recovery after struggling with third shot drops",
      timestampSeconds: 912,
      metadata: { coachNote: "Work on deeper dinks" }
    },
    {
      matchId,
      userId: 1,
      highlightType: "Key Moment",
      description: "Critical point at 9-9 won with a well-placed lob",
      timestampSeconds: 1245,
      metadata: { importanceRating: 9 }
    }
  ];
  
  // Insert the highlights
  for (const highlight of highlights) {
    const [result] = await db.insert(matchHighlights).values(highlight).returning();
    
    if (!result || !result.id) {
      throw new Error("Failed to create match highlight");
    }
  }
  
  // Query to verify
  const savedHighlights = await db.select().from(matchHighlights).where(sql`match_id = ${matchId}`);
  console.log(`Added ${savedHighlights.length} match highlights`);
  
  return savedHighlights;
}

/**
 * Verify that all the data was correctly stored and can be retrieved
 */
async function verifyData(matchId: number) {
  console.log("\nVerification Phase:");
  
  // Verify match
  const match = await db.select().from(matches).where(sql`id = ${matchId}`);
  if (match.length !== 1) {
    throw new Error(`Match not found or multiple matches found with ID ${matchId}`);
  }
  console.log("✓ Match verified");
  
  // Verify statistics
  const stats = await db.select().from(matchStatistics).where(sql`match_id = ${matchId}`);
  if (stats.length !== 1) {
    throw new Error(`Match statistics not found or multiple statistics found for match ${matchId}`);
  }
  console.log("✓ Match statistics verified");
  
  // Verify performance impacts
  const impacts = await db.select().from(performanceImpacts).where(sql`match_id = ${matchId}`);
  if (impacts.length !== 3) {
    throw new Error(`Expected 3 performance impacts, but found ${impacts.length}`);
  }
  console.log("✓ Performance impacts verified");
  
  // Verify highlights
  const highlights = await db.select().from(matchHighlights).where(sql`match_id = ${matchId}`);
  if (highlights.length !== 3) {
    throw new Error(`Expected 3 match highlights, but found ${highlights.length}`);
  }
  console.log("✓ Match highlights verified");
  
  console.log("\nData verification completed successfully!");
  
  // Print summary of the data
  console.log("\nSummary of Enhanced Match Recording:");
  console.log(`- Match: ${match[0].formatType} match, score: ${match[0].scorePlayerOne}-${match[0].scorePlayerTwo}`);
  console.log(`- Statistics: ${stats[0].totalPoints} points played, avg rally length: ${stats[0].rallyLengthAvg}`);
  console.log(`- Performance Impacts: ${impacts.length} dimensions evaluated`);
  console.log(`- Highlights: ${highlights.length} key moments recorded`);
}

// Execute the test
testEnhancedMatchRecording();