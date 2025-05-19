/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament System Migration
 * 
 * This script creates the necessary database tables for the multi-event tournament system
 * with parent-child relationships and team tournament functionality.
 */

import { db } from '../server/db';
import * as schema from '../shared/schema';
import { enhancedTournamentSystem } from '../shared/schema/enhanced-tournament-system';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';
import ws from 'ws';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('[Migration] Starting Enhanced Tournament System migration...');

  try {
    // Create parent tournaments table
    console.log('[Migration] Creating parent_tournaments table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS parent_tournaments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        registration_start_date TIMESTAMP,
        registration_end_date TIMESTAMP,
        organizer VARCHAR(255),
        logo_url VARCHAR(255),
        banner_url VARCHAR(255),
        website_url VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
        is_test_data BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] parent_tournaments table created successfully');

    // Create tournament relationships table
    console.log('[Migration] Creating tournament_relationships table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_relationships (
        id SERIAL PRIMARY KEY,
        parent_tournament_id INTEGER NOT NULL REFERENCES parent_tournaments(id),
        child_tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_tournament_id, child_tournament_id)
      );
    `);
    console.log('[Migration] tournament_relationships table created successfully');

    // Create team types enum
    console.log('[Migration] Creating team_type enum...');
    await db.execute(/* sql */`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_type') THEN
          CREATE TYPE team_type AS ENUM ('standard', 'recreational', 'competitive', 'club', 'elite');
        END IF;
      END
      $$;
    `);
    console.log('[Migration] team_type enum created successfully');

    // Create teams table
    console.log('[Migration] Creating teams table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        logo_url VARCHAR(255),
        captain_id INTEGER NOT NULL REFERENCES users(id),
        team_type team_type DEFAULT 'standard',
        location VARCHAR(255),
        average_rating INTEGER,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        is_test_data BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] teams table created successfully');

    // Create team member roles enum
    console.log('[Migration] Creating team_member_role enum...');
    await db.execute(/* sql */`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_role') THEN
          CREATE TYPE team_member_role AS ENUM ('captain', 'player', 'alternate', 'coach', 'manager');
        END IF;
      END
      $$;
    `);
    console.log('[Migration] team_member_role enum created successfully');

    // Create team members table
    console.log('[Migration] Creating team_members table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role team_member_role DEFAULT 'player',
        is_active BOOLEAN DEFAULT TRUE,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        position VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      );
    `);
    console.log('[Migration] team_members table created successfully');

    // Create team tournament registrations table
    console.log('[Migration] Creating team_tournament_registrations table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS team_tournament_registrations (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        seed_number INTEGER,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, tournament_id)
      );
    `);
    console.log('[Migration] team_tournament_registrations table created successfully');

    // Create tournament directors table
    console.log('[Migration] Creating tournament_directors table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_directors (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role VARCHAR(50) NOT NULL DEFAULT 'director',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      );
    `);
    console.log('[Migration] tournament_directors table created successfully');

    // Create tournament courts table
    console.log('[Migration] Creating tournament_courts table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_courts (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        court_number VARCHAR(20) NOT NULL,
        court_name VARCHAR(100),
        location VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] tournament_courts table created successfully');

    // Create tournament status history table
    console.log('[Migration] Creating tournament_status_history table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_status_history (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
        previous_status VARCHAR(50) NOT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        changed_by_id INTEGER NOT NULL REFERENCES users(id),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] tournament_status_history table created successfully');

    // Create tournament templates table
    console.log('[Migration] Creating tournament_templates table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        configuration JSONB NOT NULL,
        category VARCHAR(50),
        division VARCHAR(50),
        format VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] tournament_templates table created successfully');

    // Create tournament audit logs table
    console.log('[Migration] Creating tournament_audit_logs table...');
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS tournament_audit_logs (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id),
        parent_tournament_id INTEGER REFERENCES parent_tournaments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Migration] tournament_audit_logs table created successfully');

    // Update tournaments table with parent-child relationship fields
    console.log('[Migration] Updating tournaments table with parent-child relationship fields...');
    await db.execute(/* sql */`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE tournaments ADD COLUMN parent_tournament_id INTEGER REFERENCES parent_tournaments(id);
        EXCEPTION
          WHEN duplicate_column THEN
            RAISE NOTICE 'Column parent_tournament_id already exists in tournaments';
        END;

        BEGIN
          ALTER TABLE tournaments ADD COLUMN is_parent BOOLEAN DEFAULT FALSE;
        EXCEPTION
          WHEN duplicate_column THEN
            RAISE NOTICE 'Column is_parent already exists in tournaments';
        END;

        BEGIN
          ALTER TABLE tournaments ADD COLUMN is_sub_event BOOLEAN DEFAULT FALSE;
        EXCEPTION
          WHEN duplicate_column THEN
            RAISE NOTICE 'Column is_sub_event already exists in tournaments';
        END;
      END $$;
    `);
    console.log('[Migration] tournaments table updated successfully');

    console.log('[Migration] Enhanced Tournament System migration completed successfully');
  } catch (error) {
    console.error('[Migration] Error during migration:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('[Migration] Process completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('[Migration] Process failed:', err);
    process.exit(1);
  });