/**
 * PKL-278651-TRAINING-CENTER-001 - Database Schema Creation
 * Direct SQL execution to create training center tables
 * 
 * Run with: npx tsx create-training-center-schema.ts
 */

import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function createTrainingCenterSchema() {
  console.log("Creating training center database schema...");

  try {
    // Add isCoach column to users table
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_coach BOOLEAN DEFAULT false;
    `);
    console.log("✓ Added isCoach column to users table");

    // Create training_centers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS training_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(50) NOT NULL,
        state VARCHAR(50),
        country VARCHAR(50) NOT NULL DEFAULT 'Singapore',
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        phone_number VARCHAR(20),
        email VARCHAR(100),
        website VARCHAR(200),
        operating_hours JSONB,
        court_count INTEGER DEFAULT 4,
        court_surface VARCHAR(50) DEFAULT 'outdoor',
        amenities JSONB,
        is_active BOOLEAN DEFAULT true,
        qr_code VARCHAR(50) UNIQUE,
        manager_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created training_centers table");

    // Create coaching_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coaching_sessions (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES users(id),
        coach_id INTEGER NOT NULL REFERENCES users(id),
        center_id INTEGER NOT NULL REFERENCES training_centers(id),
        session_type VARCHAR(50) NOT NULL DEFAULT 'individual',
        check_in_time TIMESTAMP NOT NULL,
        check_out_time TIMESTAMP,
        planned_duration INTEGER DEFAULT 60,
        actual_duration INTEGER,
        court_number INTEGER,
        session_notes TEXT,
        player_goals TEXT,
        coach_observations TEXT,
        skills_focused JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created coaching_sessions table");

    // Create challenges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        skill_level VARCHAR(20) NOT NULL,
        difficulty_rating DECIMAL(3, 1) NOT NULL,
        estimated_duration INTEGER NOT NULL,
        instructions TEXT NOT NULL,
        coaching_tips TEXT,
        equipment_needed JSONB,
        success_criteria TEXT NOT NULL,
        assessment_method VARCHAR(50) NOT NULL,
        target_metric JSONB,
        prerequisite_challenges JSONB,
        badge_reward VARCHAR(100),
        rating_impact DECIMAL(3, 2) DEFAULT 0.1,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER NOT NULL REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created challenges table");

    // Create challenge_completions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS challenge_completions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES coaching_sessions(id),
        challenge_id INTEGER NOT NULL REFERENCES challenges(id),
        player_id INTEGER NOT NULL REFERENCES users(id),
        coach_id INTEGER NOT NULL REFERENCES users(id),
        attempt_number INTEGER DEFAULT 1,
        is_completed BOOLEAN NOT NULL,
        actual_result JSONB,
        success_rate DECIMAL(5, 2),
        time_spent INTEGER,
        coach_notes TEXT,
        player_feedback TEXT,
        improvement_areas JSONB,
        next_recommendations TEXT,
        media_urls JSONB,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created challenge_completions table");

    // Create digital_badges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS digital_badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        icon_url VARCHAR(200),
        background_color VARCHAR(7) DEFAULT '#FF6B35',
        criteria TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created digital_badges table");

    // Create player_badges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_badges (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES users(id),
        badge_id INTEGER NOT NULL REFERENCES digital_badges(id),
        session_id INTEGER REFERENCES coaching_sessions(id),
        challenge_id INTEGER REFERENCES challenges(id),
        coach_id INTEGER NOT NULL REFERENCES users(id),
        earned_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created player_badges table");

    // Insert sample training center
    await db.execute(sql`
      INSERT INTO training_centers (name, address, city, country, qr_code, operating_hours, court_count)
      VALUES (
        'Pickle+ Training Center Singapore',
        '123 Marina Bay Drive',
        'Singapore',
        'Singapore',
        'TC001-SG',
        '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "20:00"}}',
        6
      )
      ON CONFLICT (qr_code) DO NOTHING;
    `);
    console.log("✓ Inserted sample training center");

    // Insert sample challenges
    await db.execute(sql`
      INSERT INTO challenges (name, description, category, skill_level, difficulty_rating, estimated_duration, instructions, coaching_tips, equipment_needed, success_criteria, assessment_method, target_metric, badge_reward, created_by)
      VALUES 
      (
        'Basic Serve Consistency',
        'Demonstrate consistent underhand serving technique',
        'serving',
        'BEGINNER',
        1.5,
        10,
        'Serve 10 consecutive serves into the service box from the baseline',
        'Focus on consistent toss height, underhand motion, and follow-through. Keep weight on front foot.',
        '["paddles", "balls", "court"]',
        'Successfully land 8 out of 10 serves in the correct service box',
        'count',
        '{"type": "successes", "target": 8, "unit": "serves"}',
        'Serve Basic',
        1
      ),
      (
        'Forehand Cross-Court Control',
        'Hit consistent forehand shots cross-court',
        'groundstrokes',
        'BEGINNER',
        2.0,
        15,
        'Hit 15 consecutive forehand shots cross-court from baseline',
        'Focus on proper grip, stance, and contact point. Aim for consistency over power.',
        '["paddles", "balls", "court", "cones"]',
        'Successfully hit 12 out of 15 shots cross-court',
        'percentage',
        '{"type": "successes", "target": 12, "unit": "shots"}',
        'Ground Basic',
        1
      ),
      (
        'Kitchen Dinking Precision',
        'Demonstrate soft hands and control in the non-volley zone',
        'net_play',
        'INTERMEDIATE',
        3.0,
        20,
        'Maintain a dinking rally for 25 consecutive shots staying within the kitchen',
        'Keep paddle face open, use soft hands, focus on placement over pace. Stay patient.',
        '["paddles", "balls", "court"]',
        'Complete 25 consecutive dinks without error',
        'count',
        '{"type": "consecutive", "target": 25, "unit": "dinks"}',
        'Net Master',
        1
      )
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✓ Inserted sample challenges");

    // Set user as coach for testing
    await db.execute(sql`
      UPDATE users SET is_coach = true WHERE username = 'mightymax';
    `);
    console.log("✓ Set mightymax as coach for testing");

    console.log("\n🎾 Training Center schema created successfully!");
    console.log("Ready to implement Sprint 1 features:");
    console.log("- Player check-in system");
    console.log("- Coach session management");
    console.log("- Challenge completion tracking");
    console.log("- Basic progress analytics");

  } catch (error) {
    console.error("Error creating training center schema:", error);
    throw error;
  }
}

// Run the schema creation
createTrainingCenterSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Schema creation failed:", error);
    process.exit(1);
  });