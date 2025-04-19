/**
 * PKL-278651-XP-0001-FOUND
 * XP System Foundation Migration Script
 * 
 * This script creates the necessary database tables for the enhanced XP system:
 * - Updates the xp_transactions table with new fields for the Pickle Pulse™ system
 * - Creates xp_level_thresholds table for defining level progression
 * - Creates activity_multipliers and multiplier_recalibrations tables for Pickle Pulse™
 * 
 * Run with: npx tsx run-xp-system-migration.ts
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./shared/schema";
import chalk from "chalk";
import { sql } from "drizzle-orm";
import { xpLevelThresholds, activityMultipliers, multiplierRecalibrations } from "./shared/schema/xp";

// Connect to the database
if (!process.env.DATABASE_URL) {
  console.error(chalk.red("DATABASE_URL environment variable is not set"));
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function runMigration() {
  console.log(chalk.blue("Starting XP System Foundation Migration..."));

  try {
    // Check if tables already exist to avoid running migrations multiple times
    const tablesExist = await checkTablesExist();
    if (tablesExist) {
      console.log(chalk.yellow("XP System tables already exist. Migration skipped."));
      process.exit(0);
    }

    // Create XP Level Thresholds Table
    console.log(chalk.blue("Creating xp_level_thresholds table..."));
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS xp_level_thresholds (
        id SERIAL PRIMARY KEY,
        level INTEGER NOT NULL UNIQUE,
        xp_required INTEGER NOT NULL,
        description TEXT,
        benefits JSONB,
        badge_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create Activity Multipliers Table (for Pickle Pulse™)
    console.log(chalk.blue("Creating activity_multipliers table..."));
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_multipliers (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        current_multiplier INTEGER NOT NULL DEFAULT 100,
        target_ratio INTEGER NOT NULL,
        current_ratio INTEGER NOT NULL DEFAULT 0,
        weekly_trend INTEGER DEFAULT 0,
        last_recalibration TIMESTAMP NOT NULL DEFAULT NOW(),
        base_xp_value INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create Multiplier Recalibrations Table (for Pickle Pulse™ history)
    console.log(chalk.blue("Creating multiplier_recalibrations table..."));
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS multiplier_recalibrations (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL,
        previous_multiplier INTEGER NOT NULL,
        new_multiplier INTEGER NOT NULL,
        adjustment_reason TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        metadata JSONB
      )
    `);

    // Modify the existing xp_transactions table to add balance and source_type fields
    console.log(chalk.blue("Updating xp_transactions table..."));
    await db.execute(sql`
      ALTER TABLE xp_transactions 
      ADD COLUMN IF NOT EXISTS balance INTEGER,
      ADD COLUMN IF NOT EXISTS source_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE
    `);

    // Populate XP Level Thresholds with default values
    console.log(chalk.blue("Populating default XP level thresholds..."));
    await populateDefaultXpLevelThresholds();

    // Populate Activity Multipliers with default values
    console.log(chalk.blue("Populating default activity multipliers..."));
    await populateDefaultActivityMultipliers();

    console.log(chalk.green("XP System Foundation Migration completed successfully!"));
  } catch (error) {
    console.error(chalk.red("Error running migration:"), error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Check if the XP System tables already exist
 */
async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'xp_level_thresholds'
      ) AS "exists"
    `);
    
    return result[0]?.exists === true;
  } catch (error) {
    console.error(chalk.red("Error checking if tables exist:"), error);
    return false;
  }
}

/**
 * Populate default XP level thresholds based on our agreed progression
 */
async function populateDefaultXpLevelThresholds() {
  const defaultThresholds = [
    { level: 1, xpRequired: 0, description: "Beginner", benefits: { badge: "beginner" } },
    { level: 2, xpRequired: 50, description: "Novice", benefits: { badge: "novice" } },
    { level: 3, xpRequired: 125, description: "Apprentice", benefits: { features: ["community_creation"] } },
    { level: 4, xpRequired: 250, description: "Enthusiast", benefits: { features: ["avatar_frames"] } },
    { level: 5, xpRequired: 400, description: "Adept", benefits: { title: "Enthusiast" } },
    { level: 6, xpRequired: 600, description: "Skilled", benefits: { badge: "skilled" } },
    { level: 7, xpRequired: 850, description: "Expert", benefits: { badge: "expert" } },
    { level: 8, xpRequired: 1100, description: "Veteran", benefits: { badge: "veteran" } },
    { level: 9, xpRequired: 1400, description: "Master", benefits: { badge: "master" } },
    { level: 10, xpRequired: 1800, description: "Champion", benefits: { features: ["priority_registration"] } },
    { level: 15, xpRequired: 2000, description: "Elite", benefits: { title: "Veteran", features: ["profile_flair"] } },
    { level: 20, xpRequired: 3500, description: "Legend", benefits: { features: ["tournament_discounts"] } },
    { level: 25, xpRequired: 5500, description: "Grandmaster", benefits: { title: "Elite", features: ["animated_effects"] } },
    { level: 30, xpRequired: 8000, description: "Virtuoso", benefits: { features: ["seasonal_rewards"] } },
    { level: 40, xpRequired: 15000, description: "Mythic", benefits: { title: "Legend", features: ["premium_effects"] } },
    { level: 50, xpRequired: 25000, description: "Transcendent", benefits: { title: "Pickle Master", features: ["ultimate_customizations"] } }
  ];

  for (const threshold of defaultThresholds) {
    await db.insert(xpLevelThresholds).values({
      level: threshold.level,
      xpRequired: threshold.xpRequired,
      description: threshold.description,
      benefits: threshold.benefits,
    }).onConflictDoNothing();
  }
}

/**
 * Populate default activity multipliers based on our XP value table
 */
async function populateDefaultActivityMultipliers() {
  const defaultActivities = [
    // Match Play Category
    { 
      activityType: "MATCH_COMPLETE", 
      category: "MATCH", 
      baseXpValue: 10, 
      targetRatio: 3500
    },
    { 
      activityType: "MATCH_WIN", 
      category: "MATCH", 
      baseXpValue: 5, 
      targetRatio: 1500
    },
    { 
      activityType: "FIRST_MATCH_OF_DAY", 
      category: "MATCH", 
      baseXpValue: 7, 
      targetRatio: 1000
    },
    { 
      activityType: "WEEKLY_MATCH_STREAK", 
      category: "MATCH", 
      baseXpValue: 15, 
      targetRatio: 500
    },
    
    // Community Engagement Category
    { 
      activityType: "CREATE_POST", 
      category: "COMMUNITY", 
      baseXpValue: 2, 
      targetRatio: 700
    },
    { 
      activityType: "COMMENT_ON_POST", 
      category: "COMMUNITY", 
      baseXpValue: 1, 
      targetRatio: 1200
    },
    { 
      activityType: "CREATE_EVENT", 
      category: "COMMUNITY", 
      baseXpValue: 8, 
      targetRatio: 200
    },
    { 
      activityType: "ATTEND_EVENT", 
      category: "COMMUNITY", 
      baseXpValue: 5, 
      targetRatio: 800
    },
    { 
      activityType: "JOIN_COMMUNITY", 
      category: "COMMUNITY", 
      baseXpValue: 2, 
      targetRatio: 300
    },
    
    // Profile Completion Category
    { 
      activityType: "COMPLETE_PROFILE", 
      category: "PROFILE", 
      baseXpValue: 10, 
      targetRatio: 300
    },
    { 
      activityType: "ADD_PROFILE_PICTURE", 
      category: "PROFILE", 
      baseXpValue: 5, 
      targetRatio: 150
    },
    
    // Tournament Category
    { 
      activityType: "REGISTER_TOURNAMENT", 
      category: "TOURNAMENT", 
      baseXpValue: 5, 
      targetRatio: 300
    },
    { 
      activityType: "COMPLETE_TOURNAMENT", 
      category: "TOURNAMENT", 
      baseXpValue: 15, 
      targetRatio: 250
    },
    { 
      activityType: "TOURNAMENT_WIN", 
      category: "TOURNAMENT", 
      baseXpValue: 75, 
      targetRatio: 50
    }
  ];

  for (const activity of defaultActivities) {
    await db.insert(activityMultipliers).values({
      activityType: activity.activityType,
      category: activity.category,
      baseXpValue: activity.baseXpValue,
      targetRatio: activity.targetRatio,
      currentMultiplier: 100, // Start with 1.0x multiplier
    }).onConflictDoNothing();
  }
}

// Run the migration
runMigration().catch(console.error);