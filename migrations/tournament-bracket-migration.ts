/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament Bracket System Migration
 * 
 * This script creates the necessary database tables for the tournament bracket system.
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { 
  tournamentTeams, 
  tournamentBrackets, 
  tournamentRounds, 
  tournamentBracketMatches 
} from "../shared/schema/tournament-brackets";

/**
 * Main migration function
 */
export async function migrateTournamentBracketTables(): Promise<void> {
  console.log("Starting Tournament Bracket database migration...");
  
  try {
    // Check if tables exist first
    const teamTableExists = await checkTableExists("tournament_teams");
    const bracketTableExists = await checkTableExists("tournament_brackets");
    const roundTableExists = await checkTableExists("tournament_rounds");
    const matchTableExists = await checkTableExists("tournament_bracket_matches");
    
    // If all tables exist, no need to run migration
    if (teamTableExists && bracketTableExists && roundTableExists && matchTableExists) {
      console.log("All Tournament Bracket tables already exist. No changes made.");
      return;
    }
    
    // Create tables
    if (!teamTableExists) {
      await createTournamentTeamsTable();
      console.log("Created tournament_teams table.");
    }
    
    if (!bracketTableExists) {
      await createTournamentBracketsTable();
      console.log("Created tournament_brackets table.");
    }
    
    if (!roundTableExists) {
      await createTournamentRoundsTable();
      console.log("Created tournament_rounds table.");
    }
    
    if (!matchTableExists) {
      await createTournamentMatchesTable();
      console.log("Created tournament_bracket_matches table.");
    }
    
    // Add foreign key constraints for self-referencing tables
    if (!matchTableExists) {
      await addSelfReferencingConstraints();
      console.log("Added self-referencing constraints.");
    }
    
    console.log("Tournament Bracket database migration completed successfully.");
  } catch (error) {
    console.error("Error during Tournament Bracket migration:", error);
    throw error;
  }
}

/**
 * Helper to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  
  // Check if the exists field is true in the first row
  return result[0]?.exists === true;
}

/**
 * Create tournament teams table
 */
async function createTournamentTeamsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "tournament_teams" (
      "id" SERIAL PRIMARY KEY NOT NULL,
      "tournament_id" INTEGER NOT NULL,
      "player_one_id" INTEGER NOT NULL,
      "player_two_id" INTEGER NOT NULL,
      "team_name" VARCHAR(100),
      "seed_number" INTEGER,
      "registration_date" TIMESTAMP DEFAULT NOW(),
      "notes" TEXT,
      "status" VARCHAR(50) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW(),
      CONSTRAINT "tournament_teams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id"),
      CONSTRAINT "tournament_teams_player_one_id_fkey" FOREIGN KEY ("player_one_id") REFERENCES "users"("id"),
      CONSTRAINT "tournament_teams_player_two_id_fkey" FOREIGN KEY ("player_two_id") REFERENCES "users"("id")
    );
  `);
}

/**
 * Create tournament brackets table
 */
async function createTournamentBracketsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "tournament_brackets" (
      "id" SERIAL PRIMARY KEY NOT NULL,
      "tournament_id" INTEGER NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "bracket_type" VARCHAR(50) NOT NULL DEFAULT 'single_elimination',
      "teams_count" INTEGER NOT NULL,
      "rounds_count" INTEGER NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'created',
      "seeding_method" VARCHAR(50) DEFAULT 'manual',
      "start_date" TIMESTAMP,
      "end_date" TIMESTAMP,
      "metadata" JSONB,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW(),
      CONSTRAINT "tournament_brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id")
    );
  `);
}

/**
 * Create tournament rounds table
 */
async function createTournamentRoundsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "tournament_rounds" (
      "id" SERIAL PRIMARY KEY NOT NULL,
      "bracket_id" INTEGER NOT NULL,
      "round_number" INTEGER NOT NULL,
      "round_name" VARCHAR(100),
      "matches_count" INTEGER NOT NULL,
      "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
      "start_date" TIMESTAMP,
      "end_date" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW(),
      CONSTRAINT "tournament_rounds_bracket_id_fkey" FOREIGN KEY ("bracket_id") REFERENCES "tournament_brackets"("id")
    );
  `);
}

/**
 * Create tournament bracket matches table
 */
async function createTournamentMatchesTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "tournament_bracket_matches" (
      "id" SERIAL PRIMARY KEY NOT NULL,
      "bracket_id" INTEGER NOT NULL,
      "round_id" INTEGER NOT NULL,
      "match_number" INTEGER NOT NULL,
      "team1_id" INTEGER,
      "team2_id" INTEGER,
      "winner_id" INTEGER,
      "loser_id" INTEGER,
      "next_match_id" INTEGER,
      "consolation_match_id" INTEGER,
      "score" VARCHAR(100),
      "score_details" JSONB,
      "match_date" TIMESTAMP,
      "court_number" VARCHAR(50),
      "status" VARCHAR(50) NOT NULL DEFAULT 'scheduled',
      "ranking_points_awarded" BOOLEAN DEFAULT FALSE,
      "team1_points_awarded" INTEGER,
      "team2_points_awarded" INTEGER,
      "notes" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW(),
      CONSTRAINT "tournament_bracket_matches_bracket_id_fkey" FOREIGN KEY ("bracket_id") REFERENCES "tournament_brackets"("id"),
      CONSTRAINT "tournament_bracket_matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "tournament_rounds"("id"),
      CONSTRAINT "tournament_bracket_matches_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "tournament_teams"("id"),
      CONSTRAINT "tournament_bracket_matches_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "tournament_teams"("id"),
      CONSTRAINT "tournament_bracket_matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "tournament_teams"("id"),
      CONSTRAINT "tournament_bracket_matches_loser_id_fkey" FOREIGN KEY ("loser_id") REFERENCES "tournament_teams"("id")
    );
  `);
}

/**
 * Add self-referencing constraints to tournament_bracket_matches table
 */
async function addSelfReferencingConstraints(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tournament_bracket_matches"
    ADD CONSTRAINT "tournament_bracket_matches_next_match_id_fkey"
    FOREIGN KEY ("next_match_id") 
    REFERENCES "tournament_bracket_matches"("id");
  `);
  
  await db.execute(sql`
    ALTER TABLE "tournament_bracket_matches"
    ADD CONSTRAINT "tournament_bracket_matches_consolation_match_id_fkey"
    FOREIGN KEY ("consolation_match_id") 
    REFERENCES "tournament_bracket_matches"("id");
  `);
}

// ES modules don't have direct access to 'require.main === module'
// This code will only run when called from run-tournament-bracket-migration.ts