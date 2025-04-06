/**
 * Test script for the CourtIQ™ Ranking System
 * This file tests various features of the Ranking System for Pickle+
 */

import { rankingSystem, CompetitiveTier, MatchType, EventTier } from "./server/modules/ranking/rankingSystem";
import { Division, Format } from "./server/modules/rating/ratingSystem";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

async function testRankingSystem() {
  try {
    console.log("Starting CourtIQ™ Ranking System tests...");
    
    // Test 1: Initialize ranking tiers
    console.log("\n==== Test 1: Initialize ranking tiers ====");
    await rankingSystem.initializeRankingTiersInDatabase();
    
    // Test 2: Get all ranking tiers
    console.log("\n==== Test 2: Get all ranking tiers ====");
    const tiers = await rankingSystem.getAllRankingTiers();
    console.log(`Found ${tiers.length} ranking tiers`);
    console.log("First few tiers:", tiers.slice(0, 3));
    
    // Test 3: Add a test user if needed
    console.log("\n==== Test 3: Ensure test users exist ====");
    let player1 = await db.query.users.findFirst({
      where: eq(users.username, "ranktest1"),
    });
    
    if (!player1) {
      console.log("Creating test user 'ranktest1'");
      const [newUser] = await db.insert(users)
        .values({
          username: "ranktest1",
          email: "ranktest1@example.com",
          password: "hashedpassword",
          displayName: "Ranking Test User 1",
          avatarInitials: "RT1",
          xp: 0,
          level: 1,
          isAdmin: false
        })
        .returning();
      player1 = newUser;
    } else {
      console.log("Test user exists: player1 ID:", player1.id);
    }
    
    let player2 = await db.query.users.findFirst({
      where: eq(users.username, "ranktest2"),
    });
    
    if (!player2) {
      console.log("Creating test user 'ranktest2'");
      const [newUser] = await db.insert(users)
        .values({
          username: "ranktest2",
          email: "ranktest2@example.com",
          password: "hashedpassword",
          displayName: "Ranking Test User 2",
          avatarInitials: "RT2",
          xp: 0,
          level: 1,
          isAdmin: false
        })
        .returning();
      player2 = newUser;
    } else {
      console.log("Test user exists: player2 ID:", player2.id);
    }
    
    // Test 4: Calculate points for a casual match
    console.log("\n==== Test 4: Calculate points for casual match ====");
    const casualPoints = await rankingSystem.calculatePoints(
      player1.id,
      [player2.id],
      true, // player1 won
      Division.OPEN,
      Format.SINGLES,
      MatchType.CASUAL,
      EventTier.LOCAL
    );
    console.log("Casual match points:", casualPoints);
    
    // Test 5: Calculate points for a tournament match
    console.log("\n==== Test 5: Calculate points for tournament match ====");
    const tournamentPoints = await rankingSystem.calculatePoints(
      player1.id,
      [player2.id],
      true, // player1 won
      Division.OPEN,
      Format.SINGLES,
      MatchType.TOURNAMENT,
      EventTier.REGIONAL
    );
    console.log("Tournament match points:", tournamentPoints);
    
    // Test 6: Update ranking points for a player
    console.log("\n==== Test 6: Update ranking points ====");
    const updatedRanking = await rankingSystem.updateRankingPoints(
      player1.id,
      tournamentPoints.total,
      Division.OPEN,
      Format.SINGLES
    );
    console.log("Updated ranking:", updatedRanking);
    
    // Test 7: Get user's ranking points
    console.log("\n==== Test 7: Get user ranking points ====");
    const playerRanking = await rankingSystem.getUserRankingPoints(
      player1.id,
      Division.OPEN,
      Format.SINGLES
    );
    console.log("Player ranking:", playerRanking);
    
    // Test 8: Get user's ranking history
    console.log("\n==== Test 8: Get user ranking history ====");
    const rankingHistory = await rankingSystem.getUserRankingHistory(player1.id);
    console.log("Ranking history entries:", rankingHistory.length);
    if (rankingHistory.length > 0) {
      console.log("Latest history entry:", rankingHistory[0]);
    }
    
    // Test 9: Get qualification status
    console.log("\n==== Test 9: Get qualification status ====");
    const qualificationStatus = await rankingSystem.getPlayerQualificationStatus(player1.id);
    console.log("Qualification status:", qualificationStatus);
    
    // Test 10: Get leaderboard
    console.log("\n==== Test 10: Get leaderboard ====");
    const leaderboard = await rankingSystem.getLeaderboard();
    console.log("Leaderboard entries:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("Top players:", leaderboard.slice(0, 3));
    }
    
    console.log("\nAll Ranking System tests completed successfully!");
    
  } catch (error) {
    console.error("Error during Ranking System testing:", error);
  } finally {
    // The postgres client handles connection cleanup automatically
    // No need to explicitly disconnect
  }
}

testRankingSystem();