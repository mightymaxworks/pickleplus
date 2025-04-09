/**
 * Database migration script for CourtIQ™ Mastery Paths tables
 * Sprint: PKL-278651-MAST-0003-DB
 * 
 * This script creates the needed database tables for the Mastery Paths system:
 * - mastery_tiers
 * - mastery_rules
 * - player_tier_status
 * - tier_progressions
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Create the Mastery Path tables if they don't exist
 */
export async function migrateMasteryPathsTables(): Promise<void> {
  console.log("Starting Mastery Paths database migration...");

  // Check if tables already exist
  const checkMasteryTiers = await checkTableExists("mastery_tiers");
  const checkMasteryRules = await checkTableExists("mastery_rules");
  const checkPlayerTierStatus = await checkTableExists("player_tier_status");
  const checkTierProgressions = await checkTableExists("tier_progressions");

  // Create tables that don't exist
  const pendingTables = [];
  
  if (!checkMasteryTiers) {
    pendingTables.push("mastery_tiers");
    await createMasteryTiersTable();
  }

  if (!checkMasteryRules) {
    pendingTables.push("mastery_rules");
    await createMasteryRulesTable();
  }

  if (!checkPlayerTierStatus) {
    pendingTables.push("player_tier_status");
    await createPlayerTierStatusTable();
  }

  if (!checkTierProgressions) {
    pendingTables.push("tier_progressions");
    await createTierProgressionsTable();
  }

  if (pendingTables.length > 0) {
    console.log(`Created ${pendingTables.length} Mastery Paths tables: ${pendingTables.join(", ")}`);
  } else {
    console.log("All Mastery Paths tables already exist. No changes made.");
  }
}

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  return result[0].exists;
}

/**
 * Create the mastery_tiers table
 */
async function createMasteryTiersTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mastery_tiers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      display_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      min_rating INTEGER NOT NULL,
      max_rating INTEGER NOT NULL,
      badge_url TEXT,
      color_code TEXT,
      description TEXT,
      "order" INTEGER NOT NULL,
      icon_name TEXT
    );
  `);
}

/**
 * Create the mastery_rules table
 */
async function createMasteryRulesTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mastery_rules (
      id SERIAL PRIMARY KEY,
      tier_id INTEGER NOT NULL REFERENCES mastery_tiers(id),
      promotion_matches_required INTEGER NOT NULL,
      promotion_requires_consecutive BOOLEAN NOT NULL DEFAULT false,
      promotion_celebration_level TEXT NOT NULL DEFAULT 'basic',
      promotion_starting_position_pct INTEGER NOT NULL DEFAULT 20,
      demotion_grace_period INTEGER NOT NULL,
      demotion_matches_required INTEGER NOT NULL,
      demotion_requires_consecutive BOOLEAN NOT NULL DEFAULT false,
      inactivity_threshold_days INTEGER,
      demotion_buffer_zone_pct INTEGER NOT NULL DEFAULT 10,
      base_k_factor INTEGER NOT NULL DEFAULT 32,
      min_rating_gain INTEGER NOT NULL DEFAULT 5,
      max_rating_gain INTEGER NOT NULL DEFAULT 50,
      min_rating_loss INTEGER NOT NULL DEFAULT 0,
      max_rating_loss INTEGER NOT NULL DEFAULT 30,
      underperformance_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
      overperformance_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
      features TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

/**
 * Create the player_tier_status table
 */
async function createPlayerTierStatusTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS player_tier_status (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tier_id INTEGER NOT NULL REFERENCES mastery_tiers(id),
      rating INTEGER NOT NULL,
      global_rank INTEGER,
      tier_rank INTEGER,
      matches_in_tier INTEGER NOT NULL DEFAULT 0,
      joined_tier_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      matches_above_threshold INTEGER NOT NULL DEFAULT 0,
      matches_below_threshold INTEGER NOT NULL DEFAULT 0,
      grace_period_remaining INTEGER NOT NULL DEFAULT 0,
      last_match_date TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

/**
 * Create the tier_progressions table
 */
async function createTierProgressionsTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tier_progressions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      old_tier_id INTEGER NOT NULL REFERENCES mastery_tiers(id),
      new_tier_id INTEGER NOT NULL REFERENCES mastery_tiers(id),
      rating_at_progression INTEGER NOT NULL,
      reason TEXT NOT NULL,
      match_id INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}