/**
 * PKL-278651-COMM-0032-UI-ALIGN
 * Community UI Alignment Migration Runner
 * 
 * This script creates or updates the necessary database schema for enhanced
 * community profile UI alignment with mockups, including fields for banner images,
 * profile pictures, and theme colors.
 * 
 * Run with: npx tsx run-community-ui-align-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @date 2025-04-20
 */

import { db } from "./server/db";
import { sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if specified columns exist in a table
 */
async function checkColumnsExist(db: any, tableName: string, columnNames: string[]): Promise<boolean> {
  try {
    // Query to check if columns exist in PostgreSQL
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      AND column_name IN (${sql.join(columnNames, sql`, `)})
    `);
    
    // If we found the same number of columns as in our list, all exist
    return result.length === columnNames.length;
  } catch (error) {
    console.error(`Error checking columns for ${tableName}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrateCommunityUiAlignment() {
  console.log("[PKL-278651-COMM-0032-UI-ALIGN] Starting Community UI Alignment migration...");
  
  try {
    // Check if the columns already exist using standardized field names
    const columnsExist = await checkColumnsExist(db, 'communities', 
      ['avatar_url', 'banner_url', 'theme_color', 'accent_color', 'banner_pattern', 'last_ui_update']);
    
    if (!columnsExist) {
      console.log("[PKL-278651-COMM-0032-UI-ALIGN] Adding columns for enhanced media support with standardized field names...");
      
      // Add avatar_url column if it doesn't exist (standardized field name)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL
      `);
      
      // Add banner_url column if it doesn't exist (standardized field name)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT NULL
      `);
      
      // Add theme_color column if it doesn't exist (with default value)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#4F46E5'
      `);
      
      // Add accent_color column if it doesn't exist (with default value)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#818CF8'
      `);
      
      // Add banner_pattern column if it doesn't exist (with default value null)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS banner_pattern TEXT DEFAULT NULL
      `);
      
      // Add last_ui_update column (for tracking when UI was last updated)
      await db.execute(sql`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS last_ui_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      // Migration for existing data - move profile_picture to avatar_url if it exists
      await db.execute(sql`
        UPDATE communities 
        SET avatar_url = profile_picture 
        WHERE profile_picture IS NOT NULL AND avatar_url IS NULL
      `);
      
      // Migration for existing data - move banner_image to banner_url if it exists
      await db.execute(sql`
        UPDATE communities 
        SET banner_url = banner_image 
        WHERE banner_image IS NOT NULL AND banner_url IS NULL
      `);
      
      console.log("[PKL-278651-COMM-0032-UI-ALIGN] Community UI Alignment migration completed successfully");
    } else {
      console.log("[PKL-278651-COMM-0032-UI-ALIGN] Migration already applied - columns exist");
    }
    
    // Ensure directories exist for uploads
    const dirs = [
      path.join(process.cwd(), 'uploads/communities/banners'),
      path.join(process.cwd(), 'uploads/communities/avatars')
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    console.log("[PKL-278651-COMM-0032-UI-ALIGN] Upload directories verified");
    
  } catch (error) {
    console.error("[PKL-278651-COMM-0032-UI-ALIGN] Migration failed:", error);
    process.exit(1);
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await migrateCommunityUiAlignment();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
main();