/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Display Order Fix
 * 
 * This script updates the bounce_achievements table to add the display_order column
 * that is required by the Bounce achievements system.
 * 
 * Run with: npx tsx run-bounce-achievements-display-order-fix.ts
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
    
    console.log('Checking if display_order column exists in bounce_achievements table...');
    
    // Check if the column already exists
    const checkColumnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bounce_achievements' AND column_name = 'display_order';
    `);
    
    if (checkColumnExists.rows.length === 0) {
      console.log('Adding display_order column to bounce_achievements table...');
      
      // Add the display_order column with a default value
      await pool.query(`
        ALTER TABLE bounce_achievements
        ADD COLUMN display_order INTEGER DEFAULT 100;
      `);
      
      console.log('display_order column added successfully!');
      
      // Update any existing achievements with sequential display order values
      console.log('Updating existing achievements with sequential display orders...');
      
      // First, get all achievements
      const achievements = await pool.query(`
        SELECT id, name, category 
        FROM bounce_achievements 
        ORDER BY category, name;
      `);
      
      // Update each achievement with a sequential display order
      let counter = 1;
      for (const achievement of achievements.rows) {
        await pool.query(`
          UPDATE bounce_achievements
          SET display_order = $1
          WHERE id = $2;
        `, [counter, achievement.id]);
        counter++;
      }
      
      console.log(`Updated ${achievements.rows.length} achievements with sequential display orders.`);
    } else {
      console.log('display_order column already exists in bounce_achievements table.');
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