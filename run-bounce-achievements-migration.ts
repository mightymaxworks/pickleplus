/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Gamification System
 * Migration Script
 * 
 * This script creates database tables for Bounce achievements and gamification features,
 * including achievements, user achievements tracking, and leaderboards.
 * 
 * Run with: npx tsx run-bounce-achievements-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

async function main() {
  try {
    console.log("Starting Bounce Achievements migration...");
    
    // Check if tables already exist
    if (await checkTablesExist()) {
      console.log("Bounce Achievements tables already exist. Migration skipped.");
      return;
    }
    
    // Run the migration script
    await runMigration();
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

/**
 * Check if Bounce Achievements tables already exist
 */
async function checkTablesExist(): Promise<boolean> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bounce_achievements'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error("Error checking if tables exist:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Run the migration script
 */
async function runMigration(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Read and execute migration SQL
    const migrationPath = path.join(__dirname, 'migrations', '0002_bounce_achievements.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("Executing migration script...");
    await pool.query(migrationSql);
    
    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Error executing migration script:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main();