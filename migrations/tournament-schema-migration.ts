/**
 * PKL-278651-TOURN-0006-MIGR
 * Tournament Schema Migration
 * 
 * This script aligns the database schema with the code definition by adding missing 
 * columns to the tournaments table.
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Main migration function
 */
export async function migrateTournamentSchema(): Promise<void> {
  console.log("Starting Tournament Schema migration...");
  
  try {
    // Get existing columns
    const existingColumns = await getTableColumns("tournaments");
    console.log("Existing columns:", existingColumns);
    
    // Add missing columns if they don't exist
    const columnsToAdd = [
      // These are the columns that exist in schema.ts but not in the database
      { name: "registration_start_date", def: "TIMESTAMP" },
      { name: "registration_end_date", def: "TIMESTAMP" },
      { name: "max_participants", def: "INTEGER" },
      { name: "current_participants", def: "INTEGER DEFAULT 0" },
      { name: "format", def: "VARCHAR(50)" },
      { name: "division", def: "VARCHAR(50)" },
      { name: "min_rating", def: "INTEGER" },
      { name: "max_rating", def: "INTEGER" },
      { name: "entry_fee", def: "INTEGER" },
      { name: "prize_pool", def: "INTEGER" },
      { name: "status", def: "VARCHAR(50) DEFAULT 'upcoming'" },
      { name: "organizer", def: "VARCHAR(255)" },
      { name: "created_at", def: "TIMESTAMP DEFAULT NOW()" },
      { name: "updated_at", def: "TIMESTAMP DEFAULT NOW()" }
    ];
    
    // Add each column if it doesn't exist
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        await addColumn("tournaments", column.name, column.def);
        console.log(`Added column ${column.name} to tournaments table`);
      } else {
        console.log(`Column ${column.name} already exists in tournaments table`);
      }
    }
    
    console.log("Tournament Schema migration completed successfully");
  } catch (error) {
    console.error("Error during Tournament Schema migration:", error);
    throw error;
  }
}

/**
 * Get column names for a table
 */
async function getTableColumns(tableName: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = ${tableName}
  `);
  
  if (!result.rows) {
    console.error("No rows returned from column query:", result);
    return [];
  }
  
  return result.rows.map((row: any) => row.column_name);
}

/**
 * Add a column to a table
 */
async function addColumn(tableName: string, columnName: string, columnDefinition: string): Promise<void> {
  await db.execute(sql`
    ALTER TABLE ${sql.raw(tableName)}
    ADD COLUMN IF NOT EXISTS ${sql.raw(columnName)} ${sql.raw(columnDefinition)}
  `);
}

/**
 * Run migration if this script is executed directly
 */
if (process.argv[1].endsWith("tournament-schema-migration.ts")) {
  migrateTournamentSchema()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}