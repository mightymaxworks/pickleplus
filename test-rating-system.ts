/**
 * Test script for the CourtIQ™ Rating System
 * This file tests various features of the Rating System for Pickle+
 */

import { ratingSystem, Division, Format } from "./server/modules/rating/ratingSystem";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

async function testRatingSystem() {
  try {
    console.log("Starting CourtIQ™ Rating System tests...");
    
    // Test 1: Initialize rating tiers
    console.log("\n==== Test 1: Initialize rating tiers ====");
    await ratingSystem.initializeRatingTiersInDatabase();
    
    // Test 2: Get all rating tiers
    console.log("\n==== Test 2: Get all rating tiers ====");
    const tiersResult = await db.execute(sql`SELECT * FROM rating_tiers ORDER BY "order" ASC LIMIT 10`);
    console.log(`Found ${tiersResult.length} rating tiers`);
    console.log("First few tiers:", tiersResult.slice(0, 3));
    
    // Test 3: Create test users if needed
    console.log("\n==== Test 3: Ensure test users exist ====");
    
    // First player
    let player1 = await db.query.users.findFirst({
      where: eq(users.username, "player1"),
    });
    
    if (!player1) {
      console.log("Creating test user 'player1'");
      const [newUser] = await db.insert(users)
        .values({
          username: "player1",
          email: "player1@example.com",
          password: "hashedpassword",
          displayName: "Player One",
          avatarInitials: "P1",
          xp: 0,
          level: 1,
          isAdmin: false
        })
        .returning();
      player1 = newUser;
    } else {
      console.log("Test user exists:", player1.username, "ID:", player1.id);
    }
    
    // Second player
    let player2 = await db.query.users.findFirst({
      where: eq(users.username, "player2"),
    });
    
    if (!player2) {
      console.log("Creating test user 'player2'");
      const [newUser] = await db.insert(users)
        .values({
          username: "player2",
          email: "player2@example.com",
          password: "hashedpassword",
          displayName: "Player Two",
          avatarInitials: "P2",
          xp: 0,
          level: 1,
          isAdmin: false
        })
        .returning();
      player2 = newUser;
    } else {
      console.log("Test user exists:", player2.username, "ID:", player2.id);
    }
    
    // Test 4: Initialize player ratings
    console.log("\n==== Test 4: Initialize player ratings ====");
    
    // Initialize player1 with a slightly higher rating
    const player1Rating = await ratingSystem.initializePlayerRating(
      player1.id,
      1100, // Slightly higher initial rating
      Division.OPEN,
      Format.SINGLES
    );
    console.log("Initialized player1 rating:", player1Rating);
    
    // Initialize player2 with default rating
    const player2Rating = await ratingSystem.initializePlayerRating(
      player2.id,
      1000, // Default initial rating
      Division.OPEN,
      Format.SINGLES
    );
    console.log("Initialized player2 rating:", player2Rating);
    
    // Test 5: Simulate a match where the lower-rated player wins (upset)
    console.log("\n==== Test 5: Simulate match (upset) ====");
    const matchResult1 = await ratingSystem.calculateRatingsForMatch(
      [player2.id], // Lower-rated player wins
      [player1.id], // Higher-rated player loses
      11, // Winner score
      7,  // Loser score
      Division.OPEN,
      Format.SINGLES,
      false // Not a tournament
    );
    
    console.log("Match result (upset):");
    console.log("Winner new rating:", matchResult1.winnerRatings[0].rating, 
      "(+" + matchResult1.winnerChanges[0] + ")");
    console.log("Loser new rating:", matchResult1.loserRatings[0].rating, 
      "(" + matchResult1.loserChanges[0] + ")");
    
    // Test 6: Simulate another match with the expected winner
    console.log("\n==== Test 6: Simulate match (expected) ====");
    
    // By now player2 should be higher rated
    const matchResult2 = await ratingSystem.calculateRatingsForMatch(
      [player2.id], // Now higher-rated player wins
      [player1.id], // Now lower-rated player loses
      11, // Winner score
      9,  // Loser score - closer match
      Division.OPEN,
      Format.SINGLES,
      true // Tournament match - higher K-factor
    );
    
    console.log("Match result (expected win, tournament):");
    console.log("Winner new rating:", matchResult2.winnerRatings[0].rating, 
      "(+" + matchResult2.winnerChanges[0] + ")");
    console.log("Loser new rating:", matchResult2.loserRatings[0].rating, 
      "(" + matchResult2.loserChanges[0] + ")");
    
    // Test 7: Get player rating history
    console.log("\n==== Test 7: Get player rating history ====");
    const ratingHistory = await ratingSystem.getPlayerRatingHistory(
      player2.id,
      Division.OPEN,
      Format.SINGLES
    );
    console.log(`Found ${ratingHistory.length} history entries for player2`);
    console.log("Recent history:", ratingHistory.slice(0, 2));
    
    // Test 8: Get players by tier 
    console.log("\n==== Test 8: Get leaderboard ====");
    const leaderboard = await ratingSystem.getLeaderboard(
      Division.OPEN,
      Format.SINGLES,
      10, // Limit to 10 players
      0   // No offset
    );
    console.log("Leaderboard:", leaderboard);
    
    // Test 9: Change division for a player
    console.log("\n==== Test 9: Test different divisions ====");
    const player1Seniors = await ratingSystem.initializePlayerRating(
      player1.id,
      1050,
      Division.SENIORS_50,
      Format.SINGLES
    );
    console.log("Initialized player1 in seniors division:", player1Seniors);
    
    // Test 10: Change format for a player
    console.log("\n==== Test 10: Test different formats ====");
    const player1Doubles = await ratingSystem.initializePlayerRating(
      player1.id,
      1075,
      Division.OPEN,
      Format.MENS_DOUBLES
    );
    console.log("Initialized player1 in doubles format:", player1Doubles);
    
    // Test 11: Get all ratings for a player
    console.log("\n==== Test 11: Get all player ratings ====");
    const allRatings = await ratingSystem.getAllPlayerRatings(player1.id);
    console.log(`Found ${allRatings.length} ratings for player1`);
    console.log("All ratings:", allRatings);
    
    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Error during Rating System testing:", error);
  } finally {
    process.exit(0); // Exit the process when done
  }
}

// Run the tests
testRatingSystem();