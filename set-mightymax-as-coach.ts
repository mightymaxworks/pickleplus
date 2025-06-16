/**
 * Temporary script to set mightymax as a coach for navigation testing
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function setMightymaxAsCoach() {
  console.log('Setting mightymax as coach for navigation testing...');
  
  try {
    // First, check if coach_profiles table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'coach_profiles'
      ) as exists
    `);
    
    if (!tableCheck.rows[0]?.exists) {
      console.log('Creating coach_profiles table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS coach_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          professional_bio TEXT,
          years_experience INTEGER DEFAULT 0,
          certifications JSON,
          specializations JSON,
          teaching_style VARCHAR(50),
          hourly_rate DECIMAL(6,2),
          is_verified BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        )
      `);
    }
    
    // Insert or update coach profile for mightymax (user id 1)
    await db.execute(sql`
      INSERT INTO coach_profiles (
        user_id, 
        professional_bio, 
        years_experience, 
        certifications, 
        specializations,
        teaching_style,
        hourly_rate,
        is_verified,
        is_active
      )
      VALUES (
        1,
        'Experienced pickleball coach specializing in PCP assessment and player development.',
        5,
        '["PCP Certified", "Advanced Coaching"]'::json,
        '["Singles", "Doubles", "Beginner Development", "Advanced Tactics"]'::json,
        'analytical',
        75.00,
        true,
        true
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        professional_bio = EXCLUDED.professional_bio,
        years_experience = EXCLUDED.years_experience,
        certifications = EXCLUDED.certifications,
        specializations = EXCLUDED.specializations,
        is_verified = EXCLUDED.is_verified,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    console.log('✅ mightymax successfully configured as coach');
    console.log('📋 Coach profile created with PCP certification');
    
  } catch (error) {
    console.error('❌ Error setting up coach profile:', error);
  }
}

setMightymaxAsCoach();