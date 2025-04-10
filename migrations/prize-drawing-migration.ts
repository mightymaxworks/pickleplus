/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing System Migration
 * 
 * This script creates the necessary database tables for the prize drawing system.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { 
  prizeDrawingPools, 
  prizeDrawingEntries, 
  poolStatusEnum, 
  entryMethodEnum
} from '../shared/prize-drawing.schema';

/**
 * Main migration function
 */
export async function migratePrizeDrawingTables(): Promise<void> {
  console.log('[Migration] Starting prize drawing tables migration...');
  
  try {
    // Check if the enums exist already
    const poolStatusEnumExists = await checkEnumExists('prize_drawing_pool_status');
    const entryMethodEnumExists = await checkEnumExists('prize_drawing_entry_method');
    
    // Create enums if they don't exist
    if (!poolStatusEnumExists) {
      console.log('[Migration] Creating prize_drawing_pool_status enum...');
      await db.execute(sql`
        CREATE TYPE prize_drawing_pool_status AS ENUM (
          'draft', 'active', 'completed', 'cancelled'
        );
      `);
    }
    
    if (!entryMethodEnumExists) {
      console.log('[Migration] Creating prize_drawing_entry_method enum...');
      await db.execute(sql`
        CREATE TYPE prize_drawing_entry_method AS ENUM (
          'quest_completion', 'admin_addition', 'invitation', 'referral'
        );
      `);
    }
    
    // Check if tables exist already
    const poolsTableExists = await checkTableExists('prize_drawing_pools');
    const entriesTableExists = await checkTableExists('prize_drawing_entries');
    
    // Create tables if they don't exist
    if (!poolsTableExists) {
      await createPrizeDrawingPoolsTable();
    }
    
    if (!entriesTableExists) {
      await createPrizeDrawingEntriesTable();
    }
    
    console.log('[Migration] Prize drawing tables migration completed');
  } catch (error) {
    console.error('[Migration] Error during prize drawing tables migration:', error);
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
 * Helper to check if an enum type exists
 */
async function checkEnumExists(enumName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM pg_type 
      WHERE typname = ${enumName}
    );
  `);
  
  return result.rows[0].exists;
}

/**
 * Create prize drawing pools table
 */
async function createPrizeDrawingPoolsTable(): Promise<void> {
  console.log('[Migration] Creating prize_drawing_pools table...');
  
  await db.execute(sql`
    CREATE TABLE prize_drawing_pools (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      campaign_id VARCHAR(50) NOT NULL,
      prize_description TEXT,
      max_winners INTEGER DEFAULT 1,
      start_date TIMESTAMP DEFAULT NOW(),
      end_date TIMESTAMP,
      drawing_date TIMESTAMP,
      status prize_drawing_pool_status DEFAULT 'draft',
      requires_verification BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  console.log('[Migration] prize_drawing_pools table created');
}

/**
 * Create prize drawing entries table
 */
async function createPrizeDrawingEntriesTable(): Promise<void> {
  console.log('[Migration] Creating prize_drawing_entries table...');
  
  await db.execute(sql`
    CREATE TABLE prize_drawing_entries (
      id SERIAL PRIMARY KEY,
      pool_id INTEGER NOT NULL REFERENCES prize_drawing_pools(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      entry_method prize_drawing_entry_method DEFAULT 'quest_completion',
      entry_date TIMESTAMP DEFAULT NOW(),
      is_winner BOOLEAN DEFAULT FALSE,
      drawing_date TIMESTAMP,
      has_been_notified BOOLEAN DEFAULT FALSE,
      notification_date TIMESTAMP,
      token_claimed BOOLEAN DEFAULT FALSE,
      claim_date TIMESTAMP,
      UNIQUE(pool_id, user_id)
    );
  `);
  
  console.log('[Migration] prize_drawing_entries table created');
}

/**
 * Run migration if this script is executed directly
 */
if (require.main === module) {
  migratePrizeDrawingTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}