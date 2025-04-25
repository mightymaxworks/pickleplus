/**
 * PKL-278651-SAGE-0009-VIDEO - Add YouTube Fields Migration
 * 
 * This migration adds YouTube video fields to the pickleball_drills table
 * Part of Sprint 4: Enhanced Training Plans & Video Integration
 * 
 * Run with: npx tsx server/migrations/20250425_add_youtube_fields.ts
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Starting migration: Adding YouTube video fields to pickleball_drills table');
  
  try {
    // Check if columns already exist
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pickleball_drills' 
      AND column_name IN ('youtube_video_ids', 'primary_video_id', 'video_timestamps', 'video_source')
    `);
    
    // If all columns already exist, skip migration
    if (checkColumns.rows.length === 4) {
      console.log('All YouTube video fields already exist. Skipping migration.');
      return;
    }
    
    // Add the YouTube fields if they don't exist
    const alterTableCommands = [];
    
    // Check each column and prepare SQL if needed
    const columnNames = checkColumns.rows.map(row => row.column_name);
    
    if (!columnNames.includes('youtube_video_ids')) {
      alterTableCommands.push(sql`ADD COLUMN youtube_video_ids TEXT[] DEFAULT '{}'`);
    }
    
    if (!columnNames.includes('primary_video_id')) {
      alterTableCommands.push(sql`ADD COLUMN primary_video_id TEXT DEFAULT NULL`);
    }
    
    if (!columnNames.includes('video_timestamps')) {
      alterTableCommands.push(sql`ADD COLUMN video_timestamps JSONB DEFAULT '{}'`);
    }
    
    if (!columnNames.includes('video_source')) {
      alterTableCommands.push(sql`ADD COLUMN video_source TEXT DEFAULT 'youtube'`);
    }
    
    // Execute the ALTER TABLE command if we have columns to add
    if (alterTableCommands.length > 0) {
      // Execute each command separately
      for (const command of alterTableCommands) {
        await db.execute(sql`
          ALTER TABLE pickleball_drills 
          ${command}
        `);
      }
      
      console.log(`Added ${alterTableCommands.length} YouTube video fields to pickleball_drills table`);
    } else {
      console.log('No new columns to add. All required fields exist.');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration when imported directly
main()
  .then(() => console.log('Migration completed successfully'))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

export default main;