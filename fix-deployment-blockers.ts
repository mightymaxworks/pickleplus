/**
 * Fix Deployment Blockers - Create Missing Tables
 * Resolves critical deployment issues to achieve 100% readiness
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createUserProfilesTable(): Promise<void> {
  console.log('Creating user_profiles table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      bio TEXT,
      skill_level VARCHAR(50) DEFAULT 'beginner',
      location VARCHAR(200),
      avatar_url VARCHAR(500),
      date_of_birth DATE,
      phone VARCHAR(20),
      emergency_contact VARCHAR(200),
      medical_conditions TEXT,
      dietary_restrictions TEXT,
      total_xp INTEGER DEFAULT 0,
      ranking_points INTEGER DEFAULT 0,
      current_tier VARCHAR(50) DEFAULT 'Bronze',
      matches_played INTEGER DEFAULT 0,
      matches_won INTEGER DEFAULT 0,
      tournaments_entered INTEGER DEFAULT 0,
      achievements_earned INTEGER DEFAULT 0,
      preferred_playing_style VARCHAR(100),
      dominant_hand VARCHAR(10) DEFAULT 'right',
      paddle_brand VARCHAR(100),
      paddle_model VARCHAR(100),
      years_playing INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )
  `);
  
  console.log('✅ User profiles table created');
}

async function createMatchStatisticsTable(): Promise<void> {
  console.log('Creating match_statistics table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS match_statistics (
      id SERIAL PRIMARY KEY,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      aces INTEGER DEFAULT 0,
      double_faults INTEGER DEFAULT 0,
      winners INTEGER DEFAULT 0,
      unforced_errors INTEGER DEFAULT 0,
      volleys_won INTEGER DEFAULT 0,
      volleys_total INTEGER DEFAULT 0,
      dinks_successful INTEGER DEFAULT 0,
      dinks_total INTEGER DEFAULT 0,
      third_shot_drops INTEGER DEFAULT 0,
      overhead_smashes INTEGER DEFAULT 0,
      serves_in INTEGER DEFAULT 0,
      serves_total INTEGER DEFAULT 0,
      return_winners INTEGER DEFAULT 0,
      return_errors INTEGER DEFAULT 0,
      net_points_won INTEGER DEFAULT 0,
      net_points_total INTEGER DEFAULT 0,
      baseline_points_won INTEGER DEFAULT 0,
      baseline_points_total INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Match statistics table created');
}

async function createUserRankingsTable(): Promise<void> {
  console.log('Creating user_rankings table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_rankings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ranking_type VARCHAR(50) NOT NULL DEFAULT 'overall',
      current_ranking INTEGER,
      previous_ranking INTEGER,
      rating_points INTEGER DEFAULT 1000,
      tier VARCHAR(50) DEFAULT 'Bronze',
      division VARCHAR(50),
      season VARCHAR(50),
      matches_played INTEGER DEFAULT 0,
      matches_won INTEGER DEFAULT 0,
      win_percentage DECIMAL(5,2) DEFAULT 0.00,
      last_match_date TIMESTAMP,
      ranking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      UNIQUE(user_id, ranking_type, season)
    )
  `);
  
  console.log('✅ User rankings table created');
}

async function createAchievementsTable(): Promise<void> {
  console.log('Creating achievements table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      icon VARCHAR(100),
      xp_reward INTEGER DEFAULT 0,
      tier_requirement VARCHAR(50),
      criteria JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Achievements table created');
}

async function createMasteryTiersTable(): Promise<void> {
  console.log('Creating mastery_tiers table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mastery_tiers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      min_xp INTEGER NOT NULL,
      max_xp INTEGER,
      color VARCHAR(20),
      icon VARCHAR(100),
      description TEXT,
      benefits TEXT[],
      tier_order INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name),
      UNIQUE(tier_order)
    )
  `);
  
  console.log('✅ Mastery tiers table created');
}

async function createDefaultProfilesForExistingUsers(): Promise<void> {
  console.log('Creating default profiles for existing users...');
  
  await db.execute(sql`
    INSERT INTO user_profiles (user_id, first_name, last_name, skill_level, total_xp, ranking_points)
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      'intermediate' as skill_level,
      100 as total_xp,
      1200 as ranking_points
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE up.user_id IS NULL
  `);
  
  console.log('✅ Default profiles created for existing users');
}

async function createDefaultMasteryTiers(): Promise<void> {
  console.log('Creating default mastery tiers...');
  
  const tiers = [
    { name: 'Bronze', min_xp: 0, max_xp: 999, color: '#CD7F32', tier_order: 1 },
    { name: 'Silver', min_xp: 1000, max_xp: 2499, color: '#C0C0C0', tier_order: 2 },
    { name: 'Gold', min_xp: 2500, max_xp: 4999, color: '#FFD700', tier_order: 3 },
    { name: 'Platinum', min_xp: 5000, max_xp: 9999, color: '#E5E4E2', tier_order: 4 },
    { name: 'Diamond', min_xp: 10000, max_xp: 19999, color: '#B9F2FF', tier_order: 5 },
    { name: 'Master', min_xp: 20000, max_xp: 39999, color: '#8A2BE2', tier_order: 6 },
    { name: 'Grandmaster', min_xp: 40000, max_xp: 79999, color: '#FF4500', tier_order: 7 },
    { name: 'Champion', min_xp: 80000, max_xp: 159999, color: '#FF0000', tier_order: 8 },
    { name: 'Legend', min_xp: 160000, max_xp: null, color: '#800080', tier_order: 9 }
  ];
  
  for (const tier of tiers) {
    await db.execute(sql`
      INSERT INTO mastery_tiers (name, min_xp, max_xp, color, tier_order, description)
      VALUES (${tier.name}, ${tier.min_xp}, ${tier.max_xp}, ${tier.color}, ${tier.tier_order}, 
              ${`Reach ${tier.min_xp}+ XP to achieve ${tier.name} tier`})
      ON CONFLICT (name) DO NOTHING
    `);
  }
  
  console.log('✅ Default mastery tiers created');
}

async function createDefaultAchievements(): Promise<void> {
  console.log('Creating default achievements...');
  
  const achievements = [
    { name: 'First Match', description: 'Play your first match', category: 'Matches', xp_reward: 50 },
    { name: 'Win Streak', description: 'Win 5 matches in a row', category: 'Matches', xp_reward: 200 },
    { name: 'Tournament Debut', description: 'Enter your first tournament', category: 'Tournaments', xp_reward: 100 },
    { name: 'PCP Certified', description: 'Complete a PCP assessment', category: 'Training', xp_reward: 150 },
    { name: 'Profile Complete', description: 'Fill out your complete profile', category: 'Profile', xp_reward: 75 }
  ];
  
  for (const achievement of achievements) {
    await db.execute(sql`
      INSERT INTO achievements (name, description, category, xp_reward)
      VALUES (${achievement.name}, ${achievement.description}, ${achievement.category}, ${achievement.xp_reward})
      ON CONFLICT (name) DO NOTHING
    `);
  }
  
  console.log('✅ Default achievements created');
}

async function fixDeploymentBlockers(): Promise<void> {
  console.log('🔧 FIXING DEPLOYMENT BLOCKERS');
  console.log('=============================');
  
  try {
    await createUserProfilesTable();
    await createMatchStatisticsTable();
    await createUserRankingsTable();
    await createAchievementsTable();
    await createMasteryTiersTable();
    
    await createDefaultProfilesForExistingUsers();
    await createDefaultMasteryTiers();
    await createDefaultAchievements();
    
    console.log('\n✅ ALL DEPLOYMENT BLOCKERS RESOLVED');
    console.log('🚀 System ready for re-validation');
    
  } catch (error) {
    console.error('❌ Error fixing deployment blockers:', error);
  }
}

fixDeploymentBlockers();