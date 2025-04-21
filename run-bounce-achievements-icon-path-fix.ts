/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Icon Path Fix
 * 
 * This script updates the bounce_achievements table to add the icon_path column
 * that is required by the Bounce achievements system.
 * 
 * Run with: npx tsx run-bounce-achievements-icon-path-fix.ts
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
    
    console.log('Checking if icon_path column exists in bounce_achievements table...');
    
    // Check if the column already exists
    const checkColumnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements' AND column_name = 'icon_path';
    `);
    
    if (checkColumnExists.rows.length === 0) {
      console.log('Adding icon_path column to bounce_achievements table...');
      
      // Add the icon_path column
      await pool.query(`
        ALTER TABLE bounce_achievements
        ADD COLUMN icon_path VARCHAR(255);
      `);
      
      console.log('icon_path column added successfully!');
      
      // Update any existing achievements with default icon paths
      console.log('Updating existing achievements with default icon paths...');
      
      await pool.query(`
        UPDATE bounce_achievements
        SET icon_path = CASE
          WHEN category = 'FINDING' THEN '/assets/icons/achievements/finder.svg'
          WHEN category = 'VERIFICATION' THEN '/assets/icons/achievements/verifier.svg'
          WHEN category = 'PARTICIPATION' THEN '/assets/icons/achievements/participant.svg'
          WHEN category = 'CONSISTENCY' THEN '/assets/icons/achievements/consistent.svg'
          WHEN category = 'FIRST_TIME' THEN '/assets/icons/achievements/first_time.svg'
          ELSE '/assets/icons/achievements/default.svg'
        END;
      `);
      
      console.log('Existing achievements updated with default icon paths successfully!');
    } else {
      console.log('icon_path column already exists in bounce_achievements table.');
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