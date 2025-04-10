/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing System Migration
 * 
 * This script creates the necessary database tables for the prize drawing system.
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Main migration function
 */
export async function migratePrizeDrawingTables(): Promise<void> {
  console.log("Starting prize drawing tables migration...");
  
  try {
    // Check if tables already exist
    const poolTableExists = await checkTableExists("prize_drawing_pools");
    const entriesTableExists = await checkTableExists("prize_drawing_entries");
    
    if (poolTableExists && entriesTableExists) {
      console.log("Prize drawing tables already exist. Migration skipped.");
      return;
    }
    
    // Create tables in the correct order
    if (!poolTableExists) {
      await createPrizeDrawingPoolsTable();
    }
    
    if (!entriesTableExists) {
      await createPrizeDrawingEntriesTable();
    }
    
    console.log("Prize drawing tables migration completed successfully.");
  } catch (error) {
    console.error("Error during prize drawing tables migration:", error);
    throw error;
  }
}

/**
 * Helper to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    );
  `);
  
  return result.rows[0].exists;
}

/**
 * Create prize drawing pools table
 */
async function createPrizeDrawingPoolsTable(): Promise<void> {
  console.log("Creating prize_drawing_pools table...");
  
  await db.execute(sql`
    CREATE TABLE prize_drawing_pools (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      campaign_id INTEGER NOT NULL,
      start_date TIMESTAMP NOT NULL DEFAULT NOW(),
      end_date TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      
      CONSTRAINT valid_status CHECK (status IN ('active', 'drawing', 'completed'))
    );
    
    -- Add index for campaign lookups
    CREATE INDEX idx_prize_pools_campaign ON prize_drawing_pools(campaign_id);
  `);
  
  console.log("prize_drawing_pools table created successfully.");
}

/**
 * Create prize drawing entries table
 */
async function createPrizeDrawingEntriesTable(): Promise<void> {
  console.log("Creating prize_drawing_entries table...");
  
  await db.execute(sql`
    CREATE TABLE prize_drawing_entries (
      id SERIAL PRIMARY KEY,
      pool_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
      is_winner BOOLEAN NOT NULL DEFAULT FALSE,
      has_been_notified BOOLEAN NOT NULL DEFAULT FALSE,
      drawing_date TIMESTAMP,
      entry_method TEXT NOT NULL,
      
      CONSTRAINT valid_entry_method CHECK (entry_method IN ('quest_completion', 'admin', 'other')),
      CONSTRAINT fk_pool_id FOREIGN KEY (pool_id) REFERENCES prize_drawing_pools(id) ON DELETE CASCADE,
      CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_user_per_pool UNIQUE (pool_id, user_id)
    );
    
    -- Add indexes for efficient lookups
    CREATE INDEX idx_prize_entries_pool ON prize_drawing_entries(pool_id);
    CREATE INDEX idx_prize_entries_user ON prize_drawing_entries(user_id);
    CREATE INDEX idx_prize_entries_winner ON prize_drawing_entries(is_winner);
  `);
  
  console.log("prize_drawing_entries table created successfully.");
}

/**
 * Run migration if this script is executed directly
 */
if (require.main === module) {
  migratePrizeDrawingTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}