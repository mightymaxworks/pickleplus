/**
 * PKL-278651-COMM-0019-VISUALS
 * Community Visual Enhancements Migration
 * 
 * This script runs the migration to add themeColor to communities table
 * and updates the schema in preparation for enhanced visual elements.
 * 
 * Run with: npx tsx run-community-visual-enhancements-migration.ts
 */
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Running community visual enhancements migration...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    // Check if themeColor column already exists to avoid errors
    const checkColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'communities' 
        AND column_name = 'theme_color'
    `);
    
    if (checkColumnExists.rows.length === 0) {
      // Add themeColor column to communities table
      await db.execute(sql`
        ALTER TABLE communities
        ADD COLUMN theme_color VARCHAR(50)
      `);
      console.log('Successfully added theme_color column to communities table');
      
      // Update existing communities with default theme colors based on name hash
      await db.execute(sql`
        UPDATE communities
        SET theme_color = CASE 
          WHEN id % 5 = 0 THEN '#22c55e' -- Green
          WHEN id % 5 = 1 THEN '#3b82f6' -- Blue
          WHEN id % 5 = 2 THEN '#f59e0b' -- Amber
          WHEN id % 5 = 3 THEN '#ec4899' -- Pink
          ELSE '#8b5cf6' -- Purple
        END
        WHERE theme_color IS NULL
      `);
      console.log('Updated existing communities with default theme colors');
    } else {
      console.log('theme_color column already exists in communities table');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log('Community visual enhancements migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to run community visual enhancements migration:', err);
    process.exit(1);
  });