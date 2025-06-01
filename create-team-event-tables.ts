/**
 * PKL-278651-TEAM-0001-CREATE - Create Team Event System Database Tables
 * 
 * This script creates the complete team event database schema for flexible team management.
 * Supports variable team sizes, constraint validation, and diverse tournament formats.
 * 
 * Run with: npx tsx create-team-event-tables.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

import { db } from "./server/db";
import { 
  teamEventTemplates, 
  teamEventConstraints, 
  teams, 
  teamMembers, 
  teamMatches 
} from "./shared/schema/team-events";

async function createTeamEventTables() {
  console.log('🏓 Creating Team Event System Tables...');

  try {
    // Create the team event tables
    console.log('Creating team_event_templates table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS team_event_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        min_players INTEGER NOT NULL,
        max_players INTEGER NOT NULL,
        allow_substitutes BOOLEAN DEFAULT false,
        max_substitutes INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Creating team_event_constraints table...');
    await db.execute(`
      CREATE TYPE constraint_type AS ENUM (
        'no_repeat_players',
        'skill_level_range', 
        'gender_requirement',
        'age_requirement',
        'organization_limit',
        'custom'
      );

      CREATE TABLE IF NOT EXISTS team_event_constraints (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES team_event_templates(id) ON DELETE CASCADE,
        constraint_type constraint_type NOT NULL,
        parameters JSONB NOT NULL,
        error_message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Creating teams table...');
    await db.execute(`
      CREATE TYPE team_status AS ENUM (
        'forming',
        'complete', 
        'active',
        'inactive',
        'disbanded'
      );

      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        template_id INTEGER REFERENCES team_event_templates(id),
        name VARCHAR(255) NOT NULL,
        status team_status DEFAULT 'forming',
        captain_user_id INTEGER REFERENCES users(id),
        notes TEXT,
        registration_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        activated_at TIMESTAMP,
        disbanded_at TIMESTAMP
      );
    `);

    console.log('Creating team_members table...');
    await db.execute(`
      CREATE TYPE team_member_role AS ENUM (
        'captain',
        'co_captain',
        'member', 
        'substitute'
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role team_member_role DEFAULT 'member',
        is_substitute BOOLEAN DEFAULT false,
        position_requirements JSONB,
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP,
        invited_at TIMESTAMP,
        invitation_accepted BOOLEAN,
        UNIQUE(team_id, user_id)
      );
    `);

    console.log('Creating team_matches table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS team_matches (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id),
        team1_id INTEGER REFERENCES teams(id),
        team2_id INTEGER REFERENCES teams(id),
        winner_id INTEGER REFERENCES teams(id),
        score TEXT,
        match_data JSONB,
        scheduled_at TIMESTAMP,
        played_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Creating indexes for performance...');
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
      CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_constraints_template_id ON team_event_constraints(template_id);
      CREATE INDEX IF NOT EXISTS idx_team_matches_tournament_id ON team_matches(tournament_id);
    `);

    console.log('Inserting sample team event templates...');
    await createSampleTemplates();

    console.log('✅ Team Event System tables created successfully!');
    console.log('\nNext steps:');
    console.log('1. Extend storage service with team methods');
    console.log('2. Create API endpoints for team management');
    console.log('3. Build admin UI components');

  } catch (error) {
    console.error('❌ Error creating team event tables:', error);
    throw error;
  }
}

async function createSampleTemplates() {
  console.log('Creating sample team event templates...');

  // Template 1: Traditional Doubles
  const doublesTemplateId = await db.execute(`
    INSERT INTO team_event_templates (
      name, description, category, min_players, max_players, 
      allow_substitutes, max_substitutes, created_by
    ) VALUES (
      'Traditional Doubles',
      'Standard pickleball doubles format with 2 players per team',
      'doubles',
      2, 2, true, 1, 1
    ) RETURNING id;
  `);

  await db.execute(`
    INSERT INTO team_event_constraints (template_id, constraint_type, parameters, error_message) VALUES
    (${doublesTemplateId.rows[0].id}, 'no_repeat_players', '{"scope": "tournament"}', 'Players cannot be on multiple teams in this tournament'),
    (${doublesTemplateId.rows[0].id}, 'skill_level_range', '{"maxDifference": 1.0}', 'Team skill levels must be within 1.0 rating points');
  `);

  // Template 2: Mixed Doubles
  const mixedDoublesId = await db.execute(`
    INSERT INTO team_event_templates (
      name, description, category, min_players, max_players,
      allow_substitutes, max_substitutes, created_by
    ) VALUES (
      'Mixed Doubles',
      'Mixed gender doubles with exactly 1 male and 1 female player',
      'mixed_doubles',
      2, 2, true, 2, 1
    ) RETURNING id;
  `);

  await db.execute(`
    INSERT INTO team_event_constraints (template_id, constraint_type, parameters, error_message) VALUES
    (${mixedDoublesId.rows[0].id}, 'no_repeat_players', '{"scope": "tournament"}', 'Players cannot be on multiple teams in this tournament'),
    (${mixedDoublesId.rows[0].id}, 'gender_requirement', '{"male": 1, "female": 1, "flexible": false}', 'Team must have exactly 1 male and 1 female player'),
    (${mixedDoublesId.rows[0].id}, 'skill_level_range', '{"maxDifference": 0.5}', 'Team skill levels must be within 0.5 rating points');
  `);

  // Template 3: Corporate Team Challenge
  const corporateId = await db.execute(`
    INSERT INTO team_event_templates (
      name, description, category, min_players, max_players,
      allow_substitutes, max_substitutes, created_by
    ) VALUES (
      'Corporate Team Challenge',
      'Large team format for corporate events with 6-8 players and rotation',
      'corporate',
      6, 8, true, 4, 1
    ) RETURNING id;
  `);

  await db.execute(`
    INSERT INTO team_event_constraints (template_id, constraint_type, parameters, error_message) VALUES
    (${corporateId.rows[0].id}, 'no_repeat_players', '{"scope": "tournament"}', 'Employees cannot be on multiple teams in this event'),
    (${corporateId.rows[0].id}, 'skill_level_range', '{"maxDifference": 2.0, "averageRequired": false}', 'Team allows diverse skill levels for inclusive participation');
  `);

  // Template 4: Community Recreation
  const recreationId = await db.execute(`
    INSERT INTO team_event_templates (
      name, description, category, min_players, max_players,
      allow_substitutes, max_substitutes, created_by
    ) VALUES (
      'Community Recreation',
      'Flexible format for community leagues with 2-4 players',
      'recreational',
      2, 4, true, 2, 1
    ) RETURNING id;
  `);

  await db.execute(`
    INSERT INTO team_event_constraints (template_id, constraint_type, parameters, error_message) VALUES
    (${recreationId.rows[0].id}, 'skill_level_range', '{"minRating": 2.0, "maxRating": 3.5}', 'Teams are for beginner to intermediate players (2.0-3.5 rating)'),
    (${recreationId.rows[0].id}, 'no_repeat_players', '{"scope": "season", "exemptions": []}', 'Players should stick with one team per season for consistency');
  `);

  console.log('✅ Sample templates created successfully!');
}

// Execute the script
createTeamEventTables()
  .then(() => {
    console.log('🎉 Team Event System setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });

export { createTeamEventTables };