/**
 * PKL-278651-XP-0003-PULSE
 * PicklePulse Migration Runner
 * 
 * This script runs the migration for creating the PicklePulse system tables
 * Run with: npx tsx run-pickle-pulse-migration.ts
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Main function to run the migration
 */
async function main() {
  try {
    console.log('Starting PicklePulse database migration...');
    
    // Check if the activity_multipliers table already exists
    const tableExists = await checkTableExists('activity_multipliers');
    if (tableExists) {
      console.log('PicklePulse tables already exist, skipping migration');
      return;
    }
    
    // Create activity_multipliers table
    console.log('Creating activity_multipliers table...');
    await db.execute(sql`
      CREATE TABLE activity_multipliers (
        id SERIAL PRIMARY KEY,
        activity_type TEXT NOT NULL,
        category TEXT NOT NULL,
        current_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
        target_ratio DECIMAL(5,3) NOT NULL,
        current_ratio DECIMAL(5,3) NOT NULL DEFAULT 0,
        weekly_trend DECIMAL(5,3) NOT NULL DEFAULT 0,
        last_recalibration TIMESTAMP NOT NULL DEFAULT NOW(),
        base_xp_value DECIMAL(5,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `);
    
    // Create multiplier_recalibrations table
    console.log('Creating multiplier_recalibrations table...');
    await db.execute(sql`
      CREATE TABLE multiplier_recalibrations (
        id SERIAL PRIMARY KEY,
        activity_type TEXT NOT NULL,
        previous_multiplier DECIMAL(5,2) NOT NULL,
        new_multiplier DECIMAL(5,2) NOT NULL,
        adjustment_reason TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('PicklePulse database migration completed successfully');
  } catch (error) {
    console.error('Error during PicklePulse database migration:', error);
    process.exit(1);
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Run the migration
main().catch(console.error);