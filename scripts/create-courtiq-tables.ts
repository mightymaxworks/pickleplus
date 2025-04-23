/**
 * Create CourtIQ Tables
 * 
 * This script creates the necessary tables for the CourtIQ rating system
 * Run with: npx tsx scripts/create-courtiq-tables.ts
 */

import { db } from "../server/db";
import { 
  courtiqUserRatings, 
  courtiqRatingImpacts, 
  matchAssessments, 
  courtiqCalculationRules,
  courtiqPlayerAttributes,
  incompleteAssessments
} from "../shared/schema/courtiq";
import { sql } from "drizzle-orm";

async function createCourtIQTables() {
  console.log("Creating CourtIQ tables...");
  
  try {
    // Create the tables one by one to handle dependencies properly
    console.log("Creating courtiq_user_ratings table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "courtiq_user_ratings" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "technical_rating" INTEGER DEFAULT 0,
        "tactical_rating" INTEGER DEFAULT 0,
        "physical_rating" INTEGER DEFAULT 0,
        "mental_rating" INTEGER DEFAULT 0,
        "consistency_rating" INTEGER DEFAULT 0,
        "overall_rating" INTEGER DEFAULT 0,
        "confidence_score" INTEGER DEFAULT 0,
        "assessment_count" INTEGER DEFAULT 0,
        "last_updated" TIMESTAMP DEFAULT NOW(),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "version" INTEGER DEFAULT 1,
        CONSTRAINT "courtiq_user_ratings_user_id_idx" UNIQUE("user_id")
      )
    `);
    
    console.log("Creating courtiq_rating_impacts table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "courtiq_rating_impacts" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "match_id" INTEGER REFERENCES "matches"("id"),
        "dimension" VARCHAR(10) NOT NULL,
        "impact_value" INTEGER NOT NULL,
        "impact_weight" INTEGER DEFAULT 100,
        "reason" VARCHAR(50) NOT NULL,
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "processed_at" TIMESTAMP
      )
    `);
    
    console.log("Creating match_assessments table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "match_assessments" (
        "id" SERIAL PRIMARY KEY,
        "match_id" INTEGER NOT NULL REFERENCES "matches"("id"),
        "assessor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "target_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "technical_rating" INTEGER NOT NULL,
        "tactical_rating" INTEGER NOT NULL,
        "physical_rating" INTEGER NOT NULL,
        "mental_rating" INTEGER NOT NULL,
        "consistency_rating" INTEGER NOT NULL,
        "notes" TEXT,
        "assessment_type" VARCHAR(20) NOT NULL,
        "match_context" JSONB,
        "is_complete" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating courtiq_calculation_rules table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "courtiq_calculation_rules" (
        "id" SERIAL PRIMARY KEY,
        "dimension" VARCHAR(10) NOT NULL,
        "self_assessment_weight" INTEGER DEFAULT 20,
        "opponent_assessment_weight" INTEGER DEFAULT 30,
        "coach_assessment_weight" INTEGER DEFAULT 40,
        "derived_assessment_weight" INTEGER DEFAULT 10,
        "context_weighting_rules" JSONB,
        "assessment_decay_rate" INTEGER DEFAULT 5,
        "minimum_assessments_for_confidence" INTEGER DEFAULT 3,
        "version" INTEGER DEFAULT 1,
        "active_from" TIMESTAMP DEFAULT NOW(),
        "active_to" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating courtiq_player_attributes table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "courtiq_player_attributes" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "shot_mechanics" INTEGER DEFAULT 0,
        "footwork" INTEGER DEFAULT 0,
        "technique" INTEGER DEFAULT 0,
        "court_positioning" INTEGER DEFAULT 0,
        "decision_making" INTEGER DEFAULT 0,
        "strategy_implementation" INTEGER DEFAULT 0,
        "agility" INTEGER DEFAULT 0,
        "endurance" INTEGER DEFAULT 0,
        "strength" INTEGER DEFAULT 0,
        "focus_level" INTEGER DEFAULT 0,
        "pressure_handling" INTEGER DEFAULT 0,
        "resilience" INTEGER DEFAULT 0,
        "error_rate" INTEGER DEFAULT 0,
        "performance_variance" INTEGER DEFAULT 0,
        "repeatability" INTEGER DEFAULT 0,
        "last_updated" TIMESTAMP DEFAULT NOW(),
        "last_updated_by_id" INTEGER REFERENCES "users"("id"),
        "created_at" TIMESTAMP DEFAULT NOW(),
        CONSTRAINT "courtiq_player_attributes_user_id_idx" UNIQUE("user_id")
      )
    `);
    
    console.log("Creating incomplete_assessments table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "incomplete_assessments" (
        "id" SERIAL PRIMARY KEY,
        "match_id" INTEGER NOT NULL,
        "assessor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "target_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "form_data" JSONB NOT NULL,
        "current_step" VARCHAR(20) DEFAULT 'self',
        "is_complete" BOOLEAN DEFAULT FALSE,
        "last_updated" TIMESTAMP DEFAULT NOW(),
        "created_at" TIMESTAMP DEFAULT NOW(),
        CONSTRAINT "incomplete_assessments_key_idx" UNIQUE("match_id", "assessor_id", "target_id")
      )
    `);
    
    console.log("CourtIQ tables created successfully!");
    
    // Insert default calculation rules if table is empty
    const rulesCount = await db.select({ count: sql`COUNT(*)` }).from(courtiqCalculationRules);
    if (rulesCount[0].count === '0') {
      console.log("Adding default calculation rules...");
      
      const dimensions = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS', 'OVERALL'];
      for (const dimension of dimensions) {
        await db.insert(courtiqCalculationRules).values({
          dimension: dimension,
          selfAssessmentWeight: 20,
          opponentAssessmentWeight: 30,
          coachAssessmentWeight: 40,
          derivedAssessmentWeight: 10,
          contextWeightingRules: {},
          version: 1,
          activeFrom: new Date()
        });
      }
      
      console.log("Default calculation rules added!");
    }
    
  } catch (error) {
    console.error("Error creating CourtIQ tables:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the function
createCourtIQTables();