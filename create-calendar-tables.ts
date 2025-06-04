/**
 * Create Calendar Tables for Training Center System
 * Direct database creation script for class scheduling infrastructure
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createCalendarTables() {
  console.log('Creating calendar tables for training center system...');

  try {
    // Create class_templates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS class_templates (
        id SERIAL PRIMARY KEY,
        center_id INTEGER NOT NULL REFERENCES training_centers(id),
        coach_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'general',
        skill_level VARCHAR(50) DEFAULT 'beginner',
        max_participants INTEGER DEFAULT 8,
        duration INTEGER DEFAULT 60,
        price_per_session DECIMAL(10,2),
        goals JSONB DEFAULT '[]'::jsonb,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Created class_templates table');

    // Create class_instances table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS class_instances (
        id SERIAL PRIMARY KEY,
        template_id INTEGER NOT NULL REFERENCES class_templates(id),
        center_id INTEGER NOT NULL REFERENCES training_centers(id),
        coach_id INTEGER NOT NULL REFERENCES users(id),
        class_date DATE NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        max_participants INTEGER DEFAULT 8,
        current_enrollment INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'scheduled',
        special_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Created class_instances table');

    // Create class_enrollments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id SERIAL PRIMARY KEY,
        class_instance_id INTEGER NOT NULL REFERENCES class_instances(id),
        player_id INTEGER NOT NULL REFERENCES users(id),
        enrollment_type VARCHAR(50) DEFAULT 'advance',
        enrolled_at TIMESTAMP DEFAULT NOW(),
        attendance_status VARCHAR(50) DEFAULT 'enrolled',
        payment_status VARCHAR(50) DEFAULT 'pending',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(class_instance_id, player_id)
      );
    `);
    console.log('✓ Created class_enrollments table');

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_class_templates_center_day 
      ON class_templates(center_id, day_of_week);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_class_instances_date_center 
      ON class_instances(class_date, center_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_class_enrollments_player 
      ON class_enrollments(player_id, attendance_status);
    `);

    console.log('✓ Created performance indexes');

    // Insert sample class templates
    await db.execute(sql`
      INSERT INTO class_templates (center_id, coach_id, name, description, category, skill_level, max_participants, duration, price_per_session, goals, day_of_week, start_time, end_time)
      SELECT 
        tc.id,
        (SELECT id FROM users WHERE username = 'mightymax' LIMIT 1),
        'Beginner Fundamentals',
        'Learn the basics of pickleball including grip, stance, and basic shots',
        'fundamentals',
        'beginner',
        6,
        90,
        45.00,
        '["Master proper grip technique", "Learn basic serving", "Understand court positioning", "Practice dink shots"]'::jsonb,
        1, -- Monday
        '10:00:00'::time,
        '11:30:00'::time
      FROM training_centers tc
      WHERE tc.qr_code = 'TC001-SG'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);

    await db.execute(sql`
      INSERT INTO class_templates (center_id, coach_id, name, description, category, skill_level, max_participants, duration, price_per_session, goals, day_of_week, start_time, end_time)
      SELECT 
        tc.id,
        (SELECT id FROM users WHERE username = 'mightymax' LIMIT 1),
        'Intermediate Strategy',
        'Advanced tactics and positioning for competitive play',
        'strategy',
        'intermediate',
        8,
        60,
        55.00,
        '["Advanced shot selection", "Court positioning", "Partner communication", "Match strategy"]'::jsonb,
        3, -- Wednesday
        '18:00:00'::time,
        '19:00:00'::time
      FROM training_centers tc
      WHERE tc.qr_code = 'TC001-SG'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);

    await db.execute(sql`
      INSERT INTO class_templates (center_id, coach_id, name, description, category, skill_level, max_participants, duration, price_per_session, goals, day_of_week, start_time, end_time)
      SELECT 
        tc.id,
        (SELECT id FROM users WHERE username = 'mightymax' LIMIT 1),
        'Advanced Tournament Prep',
        'High-intensity training for competitive tournament play',
        'competitive',
        'advanced',
        4,
        120,
        85.00,
        '["Tournament tactics", "Mental preparation", "Advanced shot execution", "Pressure situations"]'::jsonb,
        5, -- Friday
        '17:00:00'::time,
        '19:00:00'::time
      FROM training_centers tc
      WHERE tc.qr_code = 'TC002-SG'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    `);

    console.log('✓ Inserted sample class templates');

    // Generate class instances for the next 4 weeks
    const today = new Date();
    const nextMonth = new Date(today.getTime() + (28 * 24 * 60 * 60 * 1000));

    await db.execute(sql`
      INSERT INTO class_instances (template_id, center_id, coach_id, class_date, start_time, end_time, max_participants)
      SELECT 
        ct.id,
        ct.center_id,
        ct.coach_id,
        generate_series(
          date_trunc('week', CURRENT_DATE) + (ct.day_of_week || ' days')::interval,
          date_trunc('week', CURRENT_DATE) + interval '4 weeks' + (ct.day_of_week || ' days')::interval,
          '1 week'::interval
        )::date as class_date,
        (generate_series(
          date_trunc('week', CURRENT_DATE) + (ct.day_of_week || ' days')::interval,
          date_trunc('week', CURRENT_DATE) + interval '4 weeks' + (ct.day_of_week || ' days')::interval,
          '1 week'::interval
        )::date + ct.start_time)::timestamp as start_time,
        (generate_series(
          date_trunc('week', CURRENT_DATE) + (ct.day_of_week || ' days')::interval,
          date_trunc('week', CURRENT_DATE) + interval '4 weeks' + (ct.day_of_week || ' days')::interval,
          '1 week'::interval
        )::date + ct.end_time)::timestamp as end_time,
        ct.max_participants
      FROM class_templates ct
      WHERE ct.is_active = true
      ON CONFLICT DO NOTHING;
    `);

    console.log('✓ Generated class instances for next 4 weeks');
    console.log('Calendar system setup complete!');

  } catch (error) {
    console.error('Error creating calendar tables:', error);
    throw error;
  }
}

// Run the script
createCalendarTables()
  .then(() => {
    console.log('Calendar tables created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create calendar tables:', error);
    process.exit(1);
  });

export default createCalendarTables;