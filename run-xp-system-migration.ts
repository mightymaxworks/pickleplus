/**
 * PKL-278651-XP-0001-FOUND
 * XP System Migration
 * 
 * This script creates the database tables for the XP system:
 * - xp_transactions: Records all XP awards to users
 * - xp_level_thresholds: Defines XP needed for each level and associated benefits
 * - activity_multipliers: Stores the current multiplier values for Pickle Pulse™
 * - multiplier_recalibrations: Logs changes to multipliers for audit purposes
 * 
 * Run with: npx tsx run-xp-system-migration.ts
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';
import { 
  xpTransactions, 
  xpLevelThresholds, 
  activityMultipliers, 
  multiplierRecalibrations,
  XP_SOURCE
} from './shared/schema/xp';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import ws from 'ws';

dotenv.config();

// Configure Neon to use ws for WebSocket
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

/**
 * Main migration function
 */
async function migrateXpSystem() {
  console.log('Starting XP system migration...');

  try {
    // Create XP transactions table
    console.log('Creating XP transactions table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS xp_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        source VARCHAR(50) NOT NULL,
        source_type VARCHAR(100),
        source_id INTEGER,
        description TEXT,
        running_total INTEGER NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE,
        created_by_id INTEGER REFERENCES users(id),
        match_id INTEGER,
        community_id INTEGER,
        achievement_id INTEGER,
        tournament_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create XP level thresholds table
    console.log('Creating XP level thresholds table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS xp_level_thresholds (
        id SERIAL PRIMARY KEY,
        level INTEGER NOT NULL UNIQUE,
        xp_required INTEGER NOT NULL,
        description TEXT,
        benefits JSONB,
        badge_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create activity multipliers table for Pickle Pulse™
    console.log('Creating activity multipliers table...');
    await db.execute(`
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
      );
    `);
    
    // Create multiplier recalibrations table for Pickle Pulse™ history
    console.log('Creating multiplier recalibrations table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS multiplier_recalibrations (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL,
        previous_multiplier INTEGER NOT NULL,
        new_multiplier INTEGER NOT NULL,
        adjustment_reason TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        metadata JSONB
      );
    `);

    // Populate XP level thresholds with default values
    console.log('Populating XP level thresholds with default values...');
    const levelCount = await db.select().from(xpLevelThresholds).execute();
    
    if (levelCount.length === 0) {
      // Define XP thresholds for levels 1-100 with ultra-lean progression
      // Using a more gradual formula for 100 levels: xpRequired = 20 * level^1.8
      const thresholds = [];
      
      for (let level = 1; level <= 100; level++) {
        // Level 1 starts at 0 XP
        const xpRequired = level === 1 ? 0 : Math.floor(20 * Math.pow(level, 1.8));
        
        // Define milestone benefits
        let benefits = {};
        if (level % 25 === 0) {
          // Major milestones at level 25, 50, 75, 100
          benefits = {
            perks: ["Premium Badge", "Profile Highlight", "Special Title"],
            isKeyMilestone: true
          };
        } else if (level % 10 === 0) {
          // Medium milestones at level 10, 20, 30, etc.
          benefits = {
            perks: ["Special Badge", "Profile Accent"],
            isKeyMilestone: false
          };
        } else if (level % 5 === 0) {
          // Minor milestones at level 5, 15, 25, etc.
          benefits = {
            perks: ["Badge"],
            isKeyMilestone: false
          };
        }
        
        thresholds.push({
          level,
          xpRequired,
          description: `Level ${level}${level % 25 === 0 ? " - Master" : level % 10 === 0 ? " - Expert" : ""}`,
          benefits
        });
      }
      
      console.log(`Inserting ${thresholds.length} level thresholds...`);
      await db.insert(xpLevelThresholds).values(thresholds).execute();
    } else {
      console.log(`Found ${levelCount.length} existing level thresholds, skipping insertion.`);
    }
    
    // Populate activity multipliers with default values
    console.log('Populating activity multipliers with default values...');
    const multiplierCount = await db.select().from(activityMultipliers).execute();
    
    if (multiplierCount.length === 0) {
      // Define base XP values and target distribution for each activity
      const baseMultipliers = [
        // Match-related activities (40% target distribution)
        { 
          activityType: 'match_play', 
          category: 'match', 
          currentMultiplier: 100, 
          targetRatio: 40,
          baseXpValue: 5 // Ultra-lean value from 10 → 5
        },
        { 
          activityType: 'match_win', 
          category: 'match', 
          currentMultiplier: 100, 
          targetRatio: 35, 
          baseXpValue: 2 // Ultra-lean value from 5 → 2
        },
        { 
          activityType: 'first_match_of_day', 
          category: 'match', 
          currentMultiplier: 100, 
          targetRatio: 35, 
          baseXpValue: 3 // Ultra-lean value from 7 → 3
        },
        
        // Community activities (35% target distribution)
        { 
          activityType: 'create_post', 
          category: 'community', 
          currentMultiplier: 100, 
          targetRatio: 20, 
          baseXpValue: 1 // Ultra-lean value from 2 → 1
        },
        { 
          activityType: 'add_comment', 
          category: 'community', 
          currentMultiplier: 100, 
          targetRatio: 25, 
          baseXpValue: 0.5 // Ultra-lean value from 1 → 0.5
        },
        { 
          activityType: 'create_event', 
          category: 'community', 
          currentMultiplier: 100, 
          targetRatio: 20, 
          baseXpValue: 3 // Ultra-lean value from 8 → 3
        },
        { 
          activityType: 'attend_event', 
          category: 'community', 
          currentMultiplier: 100, 
          targetRatio: 35, 
          baseXpValue: 2 // Ultra-lean value from 5 → 2
        },
        
        // Profile completion (15% target distribution)
        { 
          activityType: 'complete_profile_field', 
          category: 'profile', 
          currentMultiplier: 100, 
          targetRatio: 80, 
          baseXpValue: 1 // Ultra-lean value from 3 → 1
        },
        { 
          activityType: 'upload_profile_photo', 
          category: 'profile', 
          currentMultiplier: 100, 
          targetRatio: 90, 
          baseXpValue: 2 // Ultra-lean value from 5 → 2
        },
        { 
          activityType: 'verify_external_rating', 
          category: 'profile', 
          currentMultiplier: 100, 
          targetRatio: 40, 
          baseXpValue: 5 // Ultra-lean value from 15 → 5
        },
        
        // Achievement related (10% target distribution)
        { 
          activityType: 'unlock_achievement', 
          category: 'achievement', 
          currentMultiplier: 100, 
          targetRatio: 90, 
          baseXpValue: 0 // Varies by achievement, set in achievement table
        },
      ];
      
      console.log(`Inserting ${baseMultipliers.length} activity multipliers...`);
      await db.insert(activityMultipliers).values(baseMultipliers).execute();
    } else {
      console.log(`Found ${multiplierCount.length} existing activity multipliers, skipping insertion.`);
    }
    
    console.log('XP system migration completed successfully!');
  } catch (error) {
    console.error('Error during XP system migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateXpSystem().catch(console.error);