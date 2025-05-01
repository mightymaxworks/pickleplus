/**
 * Test script to update user XP and check level recalculation
 * Run with: npx tsx test-xp-update.ts
 */

import { db } from "./server/db";
import { storage } from "./server/storage";

async function testXpUpdate() {
  try {
    // Get user ID for mightymax
    const result = await db.execute(
      `SELECT id, username, xp, level FROM users WHERE username = 'mightymax'`
    );
    
    if (result.rows.length === 0) {
      console.log("User mightymax not found");
      return;
    }
    
    const user = result.rows[0];
    console.log("Before update:", user);
    
    // Update XP using our updated function
    const updatedUser = await storage.updateUserXP(user.id, 10);
    console.log("After update:", updatedUser);
    
    // Get the current state from database to confirm
    const confirmResult = await db.execute(
      `SELECT id, username, xp, level FROM users WHERE username = 'mightymax'`
    );
    
    if (confirmResult.rows.length > 0) {
      console.log("Confirmed in database:", confirmResult.rows[0]);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
}

testXpUpdate();