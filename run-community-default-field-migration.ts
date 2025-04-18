/**
 * PKL-278651-COMM-0020-DEFGRP
 * Default Community Flag Migration Runner
 * 
 * This script adds the isDefault field to the communities table if it doesn't exist.
 * Run with: npx tsx run-community-default-field-migration.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

/**
 * Main function to run the migration
 */
async function main() {
  console.log("[PKL-278651-COMM-0020-DEFGRP] Starting default field migration...");
  
  // Initialize DB connection
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const pgConnection = postgres(dbUrl);
  const db = drizzle(pgConnection);
  
  try {
    // Check if isDefault column exists
    const checkColumnSql = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'communities' 
      AND column_name = 'is_default'
    `;
    
    const result = await pgConnection.unsafe(checkColumnSql);
    const columnExists = result.length > 0;
    
    if (columnExists) {
      console.log("[PKL-278651-COMM-0020-DEFGRP] Column 'is_default' already exists in communities table");
    } else {
      console.log("[PKL-278651-COMM-0020-DEFGRP] Adding 'is_default' column to communities table");
      
      // Add the isDefault column
      const alterTableSql = `
        ALTER TABLE communities
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE
      `;
      
      await pgConnection.unsafe(alterTableSql);
      console.log("[PKL-278651-COMM-0020-DEFGRP] Added 'is_default' column to communities table");
    }
    
    // Add an explanatory comment to the column
    const commentSql = `
      COMMENT ON COLUMN communities.is_default IS 'Marks communities that users automatically join on registration'
    `;
    
    try {
      await pgConnection.unsafe(commentSql);
      console.log("[PKL-278651-COMM-0020-DEFGRP] Added comment to 'is_default' column");
    } catch (error) {
      // Comment addition is non-critical, so just log it
      console.warn("[PKL-278651-COMM-0020-DEFGRP] Could not add comment to column:", error);
    }
    
    console.log("[PKL-278651-COMM-0020-DEFGRP] Default field migration completed successfully");
    
  } catch (error) {
    console.error("[PKL-278651-COMM-0020-DEFGRP] Migration failed:", error);
    throw error;
  } finally {
    await pgConnection.end();
  }
}

// Run the migration
main()
  .then(() => {
    console.log("[PKL-278651-COMM-0020-DEFGRP] Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[PKL-278651-COMM-0020-DEFGRP] Migration script failed:", error);
    process.exit(1);
  });