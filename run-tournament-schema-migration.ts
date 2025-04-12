/**
 * PKL-278651-TOURN-0006-MIGR
 * Tournament Schema Migration Runner
 * 
 * This script runs the migration for aligning the tournament table schema with code definitions
 * Run with: npx tsx run-tournament-schema-migration.ts
 */

import { migrateTournamentSchema } from "./migrations/tournament-schema-migration";

async function main() {
  try {
    console.log("Starting Tournament Schema migration...");
    await migrateTournamentSchema();
    console.log("Tournament Schema migration completed successfully.");
  } catch (error) {
    console.error("Error during Tournament Schema migration:", error);
    process.exit(1);
  }
}

main();