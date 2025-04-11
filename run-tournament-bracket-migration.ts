/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament Bracket Migration Runner
 * 
 * This script runs the migration for creating tournament bracket tables
 * Run with: npx tsx run-tournament-bracket-migration.ts
 */

import { migrateTournamentBracketTables } from "./migrations/tournament-bracket-migration";

async function main() {
  try {
    console.log("Starting Tournament Bracket System migration...");
    await migrateTournamentBracketTables();
    console.log("Tournament Bracket System migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Tournament Bracket System migration failed:", error);
    process.exit(1);
  }
}

main();