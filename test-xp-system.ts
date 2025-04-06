/**
 * Test script for the XP System
 * This file tests various features of the XP System for Pickle+
 */

import { xpSystem } from "./server/modules/xp/xpSystem";
import { db } from "./server/db";
import { xpMultipliers } from "./shared/courtiq-schema";
import { users } from "./shared/schema";
import { eq, desc, sql } from "drizzle-orm";

async function testXPSystem() {
  try {
    console.log("Starting XP System tests...");
    
    // Test 1: Get all XP levels
    console.log("\n==== Test 1: Get all XP levels ====");
    const levels = await xpSystem.getAllLevels();
    console.log(`Found ${levels.length} XP levels`);
    console.log("First few levels:", levels.slice(0, 3));
    
    // Test 2: Add a test user if needed
    console.log("\n==== Test 2: Ensure test user exists ====");
    let testUser = await db.query.users.findFirst({
      where: eq(users.username, "xptest"),
    });
    
    if (!testUser) {
      console.log("Creating test user 'xptest'");
      const [newUser] = await db.insert(users)
        .values({
          username: "xptest",
          email: "xptest@example.com",
          password: "hashedpassword",
          displayName: "XP Test User",
          avatarInitials: "XT",
          xp: 0,
          level: 1,
          isAdmin: false
        })
        .returning();
      testUser = newUser;
    } else {
      console.log("Test user exists:", testUser.username, "ID:", testUser.id);
    }
    
    // Test 3: Apply a permanent XP multiplier
    console.log("\n==== Test 3: Apply permanent XP multiplier ====");
    await xpSystem.applyPermanentXPMultiplier(
      testUser.id,
      1.1, // 1.1x multiplier
      "founding_member",
      "Testing permanent multiplier",
      true // stackable
    );
    console.log("Applied permanent 1.1x multiplier to user", testUser.id);
    
    // Test 4: Apply a temporary XP multiplier
    console.log("\n==== Test 4: Apply temporary XP multiplier ====");
    await xpSystem.applyXPMultiplier(
      testUser.id,
      1.5, // 1.5x multiplier
      24 // 24 hours
    );
    console.log("Applied temporary 1.5x multiplier to user", testUser.id);
    
    // Test 5: Check user's active multipliers
    console.log("\n==== Test 5: Get user multipliers ====");
    const multipliers = await xpSystem.getUserMultipliers(testUser.id);
    console.log("User multipliers:", multipliers);
    
    // Test 6: Award XP
    console.log("\n==== Test 6: Award XP ====");
    const xpResult = await xpSystem.awardXP(
      testUser.id,
      "profile_completion",
      100, // 100 XP for completing profile
      undefined,
      100, // Base multiplier (will be modified by active multipliers)
      "Testing XP award"
    );
    console.log("XP award result:", xpResult);
    
    // Test 7: Get user's current XP and level
    console.log("\n==== Test 7: Get user XP and level ====");
    const userXP = await xpSystem.getUserXP(testUser.id);
    const userLevel = await xpSystem.getUserLevel(testUser.id);
    console.log("User XP:", userXP);
    console.log("User level:", userLevel);
    
    // Test 8: Get detailed level information
    console.log("\n==== Test 8: Get user level details ====");
    const levelDetails = await xpSystem.getUserLevelDetails(testUser.id);
    console.log("User level details:", levelDetails);
    
    // Test 9: Get user's XP history (using direct SQL for now)
    console.log("\n==== Test 9: Get XP history ====");
    const xpHistoryRecords = await db.execute(
      sql`SELECT * FROM xp_history WHERE user_id = ${testUser.id} ORDER BY created_at DESC LIMIT 5`
    );
    console.log("Recent XP history:", xpHistoryRecords);
    
    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Error during XP System testing:", error);
  } finally {
    process.exit(0); // Exit the process when done
  }
}

// Run the tests
testXPSystem();