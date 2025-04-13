/**
 * PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
 * Migration Runner
 * 
 * This script runs the migration for adding is_test_data flag to relevant tables
 * Run with: npx tsx run-test-data-visibility-migration.ts
 */

import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control migration...");

  try {
    // Add is_test_data to users table
    console.log("Adding is_test_data column to users table...");
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT FALSE
    `);
    console.log("✅ Added is_test_data column to users table");

    // Add is_test_data to tournaments table
    console.log("Adding is_test_data column to tournaments table...");
    await db.execute(sql`
      ALTER TABLE tournaments
      ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT FALSE
    `);
    console.log("✅ Added is_test_data column to tournaments table");

    // Add is_test_data to matches table
    console.log("Adding is_test_data column to matches table...");
    await db.execute(sql`
      ALTER TABLE matches
      ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT FALSE
    `);
    console.log("✅ Added is_test_data column to matches table");

    // Add is_test_data to events table
    console.log("Adding is_test_data column to events table...");
    await db.execute(sql`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT FALSE
    `);
    console.log("✅ Added is_test_data column to events table");

    // Mark existing test users
    console.log("Marking existing test users...");
    await db.execute(sql`
      UPDATE users 
      SET is_test_data = TRUE
      WHERE username LIKE 'test%' 
      OR username LIKE '%_test' 
      OR email LIKE 'test%' 
      OR email LIKE '%_test%'
      OR display_name LIKE 'Test%'
    `);
    console.log("✅ Marked existing test users");

    // Mark existing test tournaments
    console.log("Marking existing test tournaments...");
    await db.execute(sql`
      UPDATE tournaments
      SET is_test_data = TRUE
      WHERE name LIKE 'Test%'
      OR name LIKE '%Test%'
      OR description LIKE '%test%'
    `);
    console.log("✅ Marked existing test tournaments");

    // Mark existing test matches
    console.log("Marking existing test matches...");
    // Mark matches involving test users
    await db.execute(sql`
      UPDATE matches
      SET is_test_data = TRUE
      WHERE player_one_id IN (SELECT id FROM users WHERE is_test_data = TRUE)
      OR player_two_id IN (SELECT id FROM users WHERE is_test_data = TRUE)
      OR player_one_partner_id IN (SELECT id FROM users WHERE is_test_data = TRUE)
      OR player_two_partner_id IN (SELECT id FROM users WHERE is_test_data = TRUE)
    `);
    // Mark matches belonging to test tournaments
    await db.execute(sql`
      UPDATE matches
      SET is_test_data = TRUE
      WHERE tournament_id IN (SELECT id FROM tournaments WHERE is_test_data = TRUE)
    `);
    console.log("✅ Marked existing test matches");

    // Mark existing test events
    console.log("Marking existing test events...");
    await db.execute(sql`
      UPDATE events
      SET is_test_data = TRUE
      WHERE name LIKE 'Test%'
      OR name LIKE '%Test%'
      OR description LIKE '%test%'
    `);
    // Mark events organized by test users
    await db.execute(sql`
      UPDATE events
      SET is_test_data = TRUE
      WHERE organizer_id IN (SELECT id FROM users WHERE is_test_data = TRUE)
    `);
    console.log("✅ Marked existing test events");

    console.log("👍 PKL-278651-SEC-0002-TESTVIS migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });