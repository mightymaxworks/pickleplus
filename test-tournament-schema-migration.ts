/**
 * PKL-278651-TOURN-0006-MIGR-TEST
 * Tournament Schema Migration Test
 * 
 * This script tests that the tournament schema migration worked correctly and that
 * tournament creation works as expected after the migration.
 * Run with: npx tsx test-tournament-schema-migration.ts
 */

import { db } from "./server/db";
import { tournaments } from "./shared/schema";
import { sql } from "drizzle-orm";

async function testTournamentSchemaMigration() {
  try {
    console.log("Testing Tournament Schema migration...");
    
    // 1. Verify columns exist
    const columns = await getTableColumns("tournaments");
    console.log("Tournament table columns:", columns);
    
    // Expected columns from our schema
    const expectedColumns = [
      "id", "name", "description", "location", "start_date", "end_date", 
      "registration_start_date", "registration_end_date", "max_participants", 
      "current_participants", "format", "division", "min_rating", "max_rating", 
      "entry_fee", "prize_pool", "status", "level", "organizer", 
      "created_at", "updated_at", "image_url"
    ];
    
    // Check if all expected columns exist
    const missingColumns = expectedColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      console.error("Missing columns:", missingColumns);
      throw new Error(`Migration incomplete: missing columns: ${missingColumns.join(", ")}`);
    }
    
    // 2. Test tournament creation with all fields
    const testTournament = {
      name: "Test Tournament After Migration",
      description: "A test tournament to verify the migration worked correctly",
      location: "Test Location",
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-03"),
      registrationStartDate: new Date("2025-04-15"),
      registrationEndDate: new Date("2025-04-30"),
      maxParticipants: 32,
      format: "single elimination",
      division: "open",
      minRating: 3,
      maxRating: 5,
      entryFee: 2500, // $25.00
      prizePool: 50000, // $500.00
      status: "upcoming",
      level: "club",
      organizer: "Test Organizer"
    };
    
    // Insert test tournament
    const result = await db.insert(tournaments).values(testTournament).returning();
    console.log("Tournament created:", result[0]);
    
    const tournamentId = result[0].id;
    
    // 3. Verify tournament was created with all fields
    const createdTournament = await db.execute(sql`
      SELECT * FROM tournaments WHERE id = ${tournamentId}
    `);
    
    console.log("Tournament query result:", createdTournament);
    
    // Handle different response formats
    let tournamentData;
    if (Array.isArray(createdTournament) && createdTournament.length > 0) {
      tournamentData = createdTournament[0];
    } else if (createdTournament.rows && Array.isArray(createdTournament.rows) && createdTournament.rows.length > 0) {
      tournamentData = createdTournament.rows[0];
    } else {
      throw new Error("Failed to retrieve the created tournament");
    }
    
    console.log("Created tournament details:", tournamentData);
    
    // 4. Clean up - delete test tournament
    await db.execute(sql`
      DELETE FROM tournaments WHERE id = ${tournamentId}
    `);
    
    console.log("Test tournament deleted");
    console.log("Tournament Schema migration test completed successfully");
  } catch (error) {
    console.error("Error during Tournament Schema migration test:", error);
    throw error;
  }
}

/**
 * Get column names for a table
 */
async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${tableName}
    `);
    
    console.log("Database column query returned:", result);
    
    // Handle both possible response formats
    if (Array.isArray(result)) {
      return result.map((row: any) => row.column_name);
    } else if (result.rows && Array.isArray(result.rows)) {
      return result.rows.map((row: any) => row.column_name);
    } else {
      console.error("Unexpected result format:", result);
      return [];
    }
  } catch (error) {
    console.error("Error fetching table columns:", error);
    return [];
  }
}

// Run the test
testTournamentSchemaMigration()
  .then(() => {
    console.log("Migration test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration test failed:", error);
    process.exit(1);
  });