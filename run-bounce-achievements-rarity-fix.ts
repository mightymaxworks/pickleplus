/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Rarity Fix
 * 
 * This script updates the bounce_achievements table to add the rarity column
 * that is required by the Bounce achievements system.
 * 
 * Run with: npx tsx run-bounce-achievements-rarity-fix.ts
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
    
    console.log('Checking if rarity column exists in bounce_achievements table...');
    
    // Check if the column already exists
    const checkColumnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements' AND column_name = 'rarity';
    `);
    
    if (checkColumnExists.rows.length === 0) {
      console.log('Adding rarity column to bounce_achievements table...');
      
      // Add the rarity column with a default value
      await pool.query(`
        ALTER TABLE bounce_achievements
        ADD COLUMN rarity VARCHAR(50) DEFAULT 'common';
      `);
      
      console.log('rarity column added successfully!');
      
      // Update any existing achievements with appropriate rarity values based on points
      console.log('Updating existing achievements with default rarity values...');
      
      await pool.query(`
        UPDATE bounce_achievements
        SET rarity = CASE
          WHEN points >= 100 THEN 'legendary'
          WHEN points >= 75 THEN 'epic'
          WHEN points >= 50 THEN 'rare'
          WHEN points >= 25 THEN 'uncommon'
          ELSE 'common'
        END;
      `);
      
      console.log('Existing achievements updated with default rarity values successfully!');
    } else {
      console.log('rarity column already exists in bounce_achievements table.');
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