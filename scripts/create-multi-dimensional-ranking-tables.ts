/**
 * Script to create the multi-dimensional ranking tables in the database
 */
import { db, client } from '../server/db';
import { sql } from 'drizzle-orm';

async function createMultiDimensionalRankingTables() {
  try {
    console.log('Creating multi-dimensional ranking tables...');

    // Create the play_format enum
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'play_format') THEN
          CREATE TYPE play_format AS ENUM ('singles', 'doubles', 'mixed');
        END IF;
      END$$;
    `);
    console.log('Created play_format enum type');

    // Create the age_division enum
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'age_division') THEN
          CREATE TYPE age_division AS ENUM ('19plus', '35plus', '50plus');
        END IF;
      END$$;
    `);
    console.log('Created age_division enum type');

    // Create player_rankings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_rankings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        format play_format NOT NULL DEFAULT 'singles',
        age_division age_division NOT NULL DEFAULT '19plus',
        rating_tier_id INTEGER REFERENCES rating_tiers(id),
        ranking_points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created player_rankings table');

    // Create a unique constraint instead of another primary key
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'player_rankings_user_id_format_age_division_rating_tier_id_unique'
        ) THEN
          ALTER TABLE player_rankings
          ADD CONSTRAINT player_rankings_user_id_format_age_division_rating_tier_id_unique
          UNIQUE (user_id, format, age_division, rating_tier_id);
        END IF;
      EXCEPTION
        WHEN duplicate_table THEN
          NULL;
      END$$;
    `);
    console.log('Created player_rankings unique constraint');

    // Create ranking history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS multi_ranking_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        format play_format NOT NULL DEFAULT 'singles',
        age_division age_division NOT NULL DEFAULT '19plus',
        rating_tier_id INTEGER REFERENCES rating_tiers(id),
        old_ranking INTEGER NOT NULL,
        new_ranking INTEGER NOT NULL,
        reason TEXT NOT NULL,
        match_id INTEGER REFERENCES matches(id),
        tournament_id INTEGER REFERENCES tournaments(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created multi_ranking_history table');

    console.log('Multi-dimensional ranking tables created successfully');
  } catch (error) {
    console.error('Error creating multi-dimensional ranking tables:', error);
  } finally {
    await client.end();
  }
}

createMultiDimensionalRankingTables();