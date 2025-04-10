/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing System Migration
 * 
 * This script creates the necessary database tables for the prize drawing system.
 */

import { db } from '../server/db';
import { poolStatusEnum, entryMethodEnum, prizeDrawingPools, prizeDrawingEntries } from '../shared/prize-drawing.schema';
import { sql } from 'drizzle-orm';

/**
 * Main migration function
 */
export async function migratePrizeDrawingTables(): Promise<void> {
  console.log('Running prize drawing system migration...');
  
  try {
    // Check if enum types exist, create if not
    const poolStatusEnumExists = await checkEnumExists('prize_drawing_pool_status');
    if (!poolStatusEnumExists) {
      console.log('Creating pool status enum type...');
      await db.execute(sql`
        CREATE TYPE prize_drawing_pool_status AS ENUM (
          'draft', 'active', 'completed', 'cancelled'
        );
      `);
    }
    
    const entryMethodEnumExists = await checkEnumExists('prize_drawing_entry_method');
    if (!entryMethodEnumExists) {
      console.log('Creating entry method enum type...');
      await db.execute(sql`
        CREATE TYPE prize_drawing_entry_method AS ENUM (
          'quest_completion', 'admin_addition', 'invitation', 'referral'
        );
      `);
    }
    
    // Create prize drawing pools table if it doesn't exist
    const poolsTableExists = await checkTableExists('prize_drawing_pools');
    if (!poolsTableExists) {
      console.log('Creating prize drawing pools table...');
      await createPrizeDrawingPoolsTable();
    } else {
      console.log('Prize drawing pools table already exists, skipping creation');
    }
    
    // Create prize drawing entries table if it doesn't exist
    const entriesTableExists = await checkTableExists('prize_drawing_entries');
    if (!entriesTableExists) {
      console.log('Creating prize drawing entries table...');
      await createPrizeDrawingEntriesTable();
    } else {
      console.log('Prize drawing entries table already exists, skipping creation');
    }
    
    console.log('Prize drawing system migration completed successfully');
  } catch (error) {
    console.error('Error during prize drawing system migration:', error);
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
  
  return result[0] && result[0].exists === true;
}

/**
 * Helper to check if an enum type exists
 */
async function checkEnumExists(enumName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM pg_type
      WHERE typname = ${enumName}
    );
  `);
  
  return result[0] && result[0].exists === true;
}

/**
 * Create prize drawing pools table
 */
async function createPrizeDrawingPoolsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE prize_drawing_pools (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      campaign_id VARCHAR(50) NOT NULL,
      prize_description TEXT,
      max_winners INTEGER DEFAULT 1,
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP,
      drawing_date TIMESTAMP,
      status prize_drawing_pool_status DEFAULT 'draft',
      requires_verification BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Create prize drawing entries table
 */
async function createPrizeDrawingEntriesTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE prize_drawing_entries (
      id SERIAL PRIMARY KEY,
      pool_id INTEGER NOT NULL REFERENCES prize_drawing_pools(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      entry_method prize_drawing_entry_method DEFAULT 'quest_completion',
      entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_winner BOOLEAN DEFAULT FALSE,
      drawing_date TIMESTAMP,
      has_been_notified BOOLEAN DEFAULT FALSE,
      notification_date TIMESTAMP,
      token_claimed BOOLEAN DEFAULT FALSE,
      claim_date TIMESTAMP
    );
  `);
}

/**
 * Run migration if this script is executed directly
 * Using import.meta.url to check instead of require.main in ES modules
 */
if (import.meta.url.endsWith(process.argv[1])) {
  migratePrizeDrawingTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}