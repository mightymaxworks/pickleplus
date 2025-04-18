/**
 * PKL-278651-COMM-0019-VISUALS
 * Community Visual Enhancements Migration
 * 
 * This script runs the migration to add themeColor to communities table
 * and updates the schema in preparation for enhanced visual elements.
 * 
 * Run with: npx tsx run-community-visual-enhancements-migration.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config();

// Ensure database URL is available
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function main() {
  console.log("Starting community visual enhancements migration...");
  
  try {
    // Connect to the database
    const queryClient = postgres(process.env.DATABASE_URL!);
    const db = drizzle(queryClient);
    
    // Add the themeColor column to the communities table
    await db.execute(
      sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50)`
    );
    
    console.log("Successfully added themeColor to communities table");
    
    // Create the uploads directory for community visuals if it doesn't exist
    await db.execute(
      sql`DO $$
        BEGIN
          -- No SQL operation needed for creating directories
          -- This is handled by the server code
          RAISE NOTICE 'Ensuring file upload directories exist';
        END
      $$;`
    );
    
    console.log("Migration completed successfully");
    
    // Close the database connection
    await queryClient.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();