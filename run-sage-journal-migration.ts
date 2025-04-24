/**
 * PKL-278651-SAGE-0003-JOURNAL
 * SAGE Journal System Migration
 * 
 * This script creates the database tables for the SAGE Journaling System.
 * Run with: npx tsx run-sage-journal-migration.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';
import { 
  journalEntries, 
  journalPrompts, 
  journalReflections 
} from './shared/schema/sage';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('[SAGE-JOURNAL] Starting migration for SAGE Journaling System tables');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist(db);
    
    if (tablesExist) {
      console.log('[SAGE-JOURNAL] Tables already exist, skipping migration');
      return;
    }
    
    // Create Journal Entries table
    console.log('[SAGE-JOURNAL] Creating journal_entries table');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        entry_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_private BOOLEAN DEFAULT TRUE NOT NULL,
        session_id INTEGER, -- Removed foreign key reference temporarily
        match_id INTEGER REFERENCES matches(id),
        dimension_code TEXT,
        tags TEXT,
        metadata JSONB DEFAULT '{}'::JSONB NOT NULL
      )
    `);
    
    // Create Journal Prompts table
    console.log('[SAGE-JOURNAL] Creating journal_prompts table');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS journal_prompts (
        id SERIAL PRIMARY KEY,
        prompt_text TEXT NOT NULL,
        prompt_type TEXT NOT NULL,
        dimension_code TEXT,
        skill_level TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        metadata JSONB DEFAULT '{}'::JSONB NOT NULL
      )
    `);
    
    // Create Journal Reflections table
    console.log('[SAGE-JOURNAL] Creating journal_reflections table');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS journal_reflections (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
        content TEXT NOT NULL,
        insight_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        user_feedback TEXT,
        metadata JSONB DEFAULT '{}'::JSONB NOT NULL
      )
    `);
    
    // Seed initial journal prompts
    console.log('[SAGE-JOURNAL] Seeding initial journal prompts');
    await seedInitialPrompts(db);
    
    console.log('[SAGE-JOURNAL] Migration completed successfully');
  } catch (error) {
    console.error('[SAGE-JOURNAL] Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Check if the Journaling System tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('journal_entries', 'journal_prompts', 'journal_reflections')
    `);
    
    return result.length > 0;
  } catch (error) {
    console.error('[SAGE-JOURNAL] Error checking if tables exist:', error);
    return false;
  }
}

/**
 * Seed initial journal prompts
 */
async function seedInitialPrompts(db: any) {
  // Create the initial prompts directly with SQL to avoid parameter issues
  await db.execute(`
    INSERT INTO journal_prompts (prompt_text, prompt_type, dimension_code, skill_level, is_active)
    VALUES 
      ('How did you feel about your performance in your last match?', 'reflection', 'MENT', 'beginner', TRUE),
      ('What skill are you most proud of improving recently?', 'reflection', 'TECH', 'beginner', TRUE),
      ('Describe a moment in your last match where your mental game was tested. How did you respond?', 'emotional', 'MENT', 'intermediate', TRUE),
      ('What''s one technique you want to master in the next month?', 'goal_setting', 'TECH', 'intermediate', TRUE),
      ('How did your body feel during your last training session?', 'reflection', 'PHYS', 'beginner', TRUE),
      ('What strategic adjustments did you make during your last match?', 'technical', 'TACT', 'advanced', TRUE),
      ('What helps you stay consistent when under pressure?', 'reflection', 'CONS', 'intermediate', TRUE),
      ('Set three specific tactical goals for your next match.', 'goal_setting', 'TACT', 'advanced', TRUE),
      ('How do you feel before competitions? Describe your pre-match emotions.', 'emotional', 'MENT', 'beginner', TRUE),
      ('What''s your biggest strength on the court and how do you leverage it?', 'reflection', 'TECH', 'intermediate', TRUE)
  `);
  
  console.log(`[SAGE-JOURNAL] Seeded 10 journal prompts`);
}

// Run the migration
main().catch(console.error);