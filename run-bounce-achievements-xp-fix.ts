/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements XP Fix
 * 
 * This script updates the bounce_achievements table to add the xp_value column
 * that is required for XP integration.
 * 
 * Run with: npx tsx run-bounce-achievements-xp-fix.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure NeonDB
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function main() {
  try {
    // Connect to the database
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    console.log('Checking if xp_value column exists in bounce_achievements table...');
    
    // Check if the column already exists
    const checkColumnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements' AND column_name = 'xp_value';
    `);
    
    if (checkColumnExists.rows.length === 0) {
      console.log('Adding xp_value column to bounce_achievements table...');
      
      // Add the xp_value column
      await pool.query(`
        ALTER TABLE bounce_achievements
        ADD COLUMN xp_value INTEGER NOT NULL DEFAULT 10;
      `);
      
      console.log('xp_value column added successfully!');
      
      // Update any existing achievements to have appropriate XP values
      console.log('Updating existing achievements with appropriate XP values...');
      
      await pool.query(`
        UPDATE bounce_achievements
        SET xp_value = CASE
          WHEN category = 'FINDING' THEN 30
          WHEN category = 'VERIFICATION' THEN 15
          WHEN category = 'PARTICIPATION' THEN 10
          WHEN category = 'CONSISTENCY' THEN 20
          WHEN category = 'FIRST_TIME' THEN 25
          ELSE points
        END;
      `);
      
      console.log('Existing achievements updated successfully!');
    } else {
      console.log('xp_value column already exists in bounce_achievements table.');
    }
    
    // Verify the schema is correct now
    const verifySchema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current bounce_achievements schema:');
    console.table(verifySchema.rows);
    
    console.log('Fix completed successfully!');
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

main().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((error) => {
  console.error('Error in main function:', error);
  process.exit(1);
});