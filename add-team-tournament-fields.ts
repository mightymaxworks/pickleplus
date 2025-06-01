/**
 * Add Team Tournament Fields to Existing Tournaments Table
 * This script adds the new team tournament fields to the unified tournaments table
 * while preserving all existing data and structure.
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function addTeamTournamentFields() {
  console.log('Adding team tournament fields to tournaments table...');
  
  try {
    // Add team tournament fields to the existing tournaments table
    const alterQueries = [
      // Team tournament flag
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_team_tournament BOOLEAN DEFAULT FALSE`,
      
      // Team size configuration
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS team_size INTEGER`,
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS min_team_size INTEGER`,
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_team_size INTEGER`,
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_teams INTEGER`,
      
      // Team configuration (JSON fields)
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS team_match_format JSONB`,
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS team_eligibility_rules JSONB`,
      sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS team_lineup_rules JSONB`,
      
      // Team registration fields
      sql`ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS team_name VARCHAR(255)`,
      sql`ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS team_players JSONB`,
      sql`ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS team_captain VARCHAR(255)`,
      sql`ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS is_team_registration BOOLEAN DEFAULT FALSE`
    ];
    
    // Execute all alter statements
    for (const query of alterQueries) {
      await db.execute(query);
      console.log('✓ Added field');
    }
    
    console.log('✅ Successfully added all team tournament fields');
    console.log('📊 Schema now supports:');
    console.log('  • Single tournaments (existing functionality)');
    console.log('  • Multi-event tournaments (existing functionality)');
    console.log('  • Team tournaments (new functionality)');
    console.log('  • Multi-event team tournaments (combined functionality)');
    
  } catch (error) {
    console.error('❌ Error adding team tournament fields:', error);
    throw error;
  }
}

async function main() {
  await addTeamTournamentFields();
  process.exit(0);
}

main().catch(console.error);