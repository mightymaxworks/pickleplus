/**
 * PKL-278651-COACH-001 - Coach Application Database Schema Creation
 * Creates the required database tables for the coach application system
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createCoachApplicationTables() {
  console.log('🏗️ Creating coach application database tables...');

  try {
    // Create coach applications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coach_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        coach_type VARCHAR(50) NOT NULL DEFAULT 'independent',
        application_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP,
        reviewer_id INTEGER,
        rejection_reason TEXT,
        
        experience_years INTEGER NOT NULL,
        teaching_philosophy TEXT NOT NULL,
        specializations JSONB NOT NULL DEFAULT '[]',
        availability_data JSONB NOT NULL DEFAULT '{}',
        previous_experience TEXT,
        references JSONB DEFAULT '[]',
        
        background_check_consent BOOLEAN NOT NULL DEFAULT false,
        insurance_details JSONB DEFAULT '{}',
        emergency_contact JSONB DEFAULT '{}',
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(user_id)
      )
    `);

    // Create coach certifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coach_certifications (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL,
        certification_type VARCHAR(100) NOT NULL,
        issuing_organization VARCHAR(200) NOT NULL,
        certification_number VARCHAR(100),
        issued_date TIMESTAMP,
        expiration_date TIMESTAMP,
        document_url VARCHAR(500),
        verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        verified_by INTEGER,
        verified_at TIMESTAMP,
        notes TEXT,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create coach profiles table (for approved coaches)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coach_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        coach_type VARCHAR(50) NOT NULL,
        verification_level VARCHAR(50) NOT NULL DEFAULT 'basic',
        is_active BOOLEAN NOT NULL DEFAULT true,
        
        bio TEXT,
        specializations JSONB NOT NULL DEFAULT '[]',
        teaching_style VARCHAR(100),
        languages_spoken JSONB DEFAULT '["English"]',
        
        hourly_rate DECIMAL(10,2),
        session_types JSONB DEFAULT '[]',
        availability_schedule JSONB DEFAULT '{}',
        
        average_rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INTEGER NOT NULL DEFAULT 0,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        student_retention_rate DECIMAL(5,2) DEFAULT 0,
        
        approved_at TIMESTAMP,
        approved_by INTEGER,
        last_active_at TIMESTAMP DEFAULT NOW(),
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create coach reviews table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coach_reviews (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        session_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        review_date TIMESTAMP DEFAULT NOW(),
        is_verified BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(coach_id, student_id, session_id)
      )
    `);

    // Create coaching sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coaching_sessions (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        session_type VARCHAR(50) NOT NULL,
        session_status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        location_type VARCHAR(50),
        location_details TEXT,
        price_amount DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'USD',
        payment_status VARCHAR(50) DEFAULT 'pending',
        session_notes TEXT,
        feedback_for_student TEXT,
        student_goals JSONB DEFAULT '[]',
        session_summary TEXT,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_coach_applications_user_id ON coach_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_coach_applications_status ON coach_applications(application_status);
      CREATE INDEX IF NOT EXISTS idx_coach_certifications_application_id ON coach_certifications(application_id);
      CREATE INDEX IF NOT EXISTS idx_coach_profiles_user_id ON coach_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_coach_profiles_active ON coach_profiles(is_active);
      CREATE INDEX IF NOT EXISTS idx_coach_reviews_coach_id ON coach_reviews(coach_id);
      CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_id ON coaching_sessions(coach_id);
      CREATE INDEX IF NOT EXISTS idx_coaching_sessions_student_id ON coaching_sessions(student_id);
    `);

    console.log('✅ Coach application database tables created successfully');
    console.log('📝 Tables created:');
    console.log('   - coach_applications');
    console.log('   - coach_certifications');
    console.log('   - coach_profiles');
    console.log('   - coach_reviews');
    console.log('   - coaching_sessions');

  } catch (error) {
    console.error('❌ Error creating coach application tables:', error);
    throw error;
  }
}

// Run the creation script
if (import.meta.url === `file://${process.argv[1]}`) {
  createCoachApplicationTables()
    .then(() => {
      console.log('🎉 Coach application database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to setup coach application database:', error);
      process.exit(1);
    });
}

export { createCoachApplicationTables };