/**
 * PKL-278651-TRAINING-CENTER-COMPLETE-001 - Complete Training Center Database Schema
 * Creates all required tables for the Training Center admin module
 */

import { pool } from './server/db';

async function createCompleteTrainingCenterSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🏗️ Creating complete Training Center database schema...');

    // Create training_centers table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        capacity INTEGER DEFAULT 0,
        qr_code VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create coaches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coaches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        bio TEXT,
        experience_years INTEGER DEFAULT 0,
        pcp_certified BOOLEAN DEFAULT FALSE,
        certification_level VARCHAR(100),
        specializations TEXT[],
        hourly_rate DECIMAL(10,2),
        availability JSONB,
        profile_image VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        training_center_id INTEGER REFERENCES training_centers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create class_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_sessions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        coach_id INTEGER REFERENCES coaches(id),
        training_center_id INTEGER REFERENCES training_centers(id),
        class_type VARCHAR(100),
        skill_level VARCHAR(50),
        capacity INTEGER NOT NULL,
        duration_minutes INTEGER,
        price DECIMAL(10,2),
        scheduled_date DATE,
        start_time TIME,
        end_time TIME,
        recurring_pattern VARCHAR(50),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create class_enrollments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id SERIAL PRIMARY KEY,
        class_session_id INTEGER REFERENCES class_sessions(id),
        user_id INTEGER,
        student_name VARCHAR(255),
        student_email VARCHAR(255),
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_status VARCHAR(50) DEFAULT 'pending',
        attendance_status VARCHAR(50) DEFAULT 'enrolled',
        notes TEXT
      );
    `);

    // Create coach_credentials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coach_credentials (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES coaches(id),
        credential_type VARCHAR(100),
        credential_name VARCHAR(255),
        issuing_organization VARCHAR(255),
        issue_date DATE,
        expiry_date DATE,
        credential_number VARCHAR(100),
        verification_status VARCHAR(50) DEFAULT 'pending',
        document_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create training_center_facilities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_center_facilities (
        id SERIAL PRIMARY KEY,
        training_center_id INTEGER REFERENCES training_centers(id),
        facility_type VARCHAR(100),
        facility_name VARCHAR(255),
        description TEXT,
        capacity INTEGER,
        hourly_rate DECIMAL(10,2),
        availability JSONB,
        equipment JSONB,
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample training centers
    await client.query(`
      INSERT INTO training_centers (name, description, address, city, state, country, capacity, qr_code, status)
      VALUES 
        ('Singapore Elite Pickleball Academy', 'Premier pickleball training facility in Singapore', '123 Sports Hub Drive', 'Singapore', 'Singapore', 'Singapore', 100, 'SEPA001', 'active'),
        ('Phoenix Pickleball Training Center', 'State-of-the-art training facility', '456 Desert View Blvd', 'Phoenix', 'Arizona', 'USA', 80, 'PPTC002', 'active'),
        ('Toronto Pickleball Institute', 'Professional coaching and training programs', '789 Maple Leaf Avenue', 'Toronto', 'Ontario', 'Canada', 60, 'TPI003', 'active')
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample coaches
    await client.query(`
      INSERT INTO coaches (name, email, phone, bio, experience_years, pcp_certified, certification_level, status, training_center_id)
      VALUES 
        ('Sarah Chen', 'sarah.chen@sepa.sg', '+65-9123-4567', 'Former professional player with 15 years coaching experience', 15, true, 'Master Instructor', 'active', 1),
        ('Mike Rodriguez', 'mike.rodriguez@pptc.com', '+1-602-555-0123', 'Certified PCP instructor specializing in advanced techniques', 12, true, 'Senior Instructor', 'active', 2),
        ('Emma Thompson', 'emma.thompson@tpi.ca', '+1-416-555-0198', 'Youth development specialist and tournament coach', 8, true, 'Certified Instructor', 'active', 3),
        ('David Park', 'david.park@sepa.sg', '+65-9876-5432', 'Beginner-friendly instructor with focus on fundamentals', 6, false, 'Assistant Instructor', 'pending', 1)
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample class sessions
    await client.query(`
      INSERT INTO class_sessions (name, description, coach_id, training_center_id, class_type, skill_level, capacity, duration_minutes, price, scheduled_date, start_time, end_time, status)
      VALUES 
        ('Beginner Fundamentals', 'Learn the basics of pickleball', 1, 1, 'Group Class', 'Beginner', 12, 90, 45.00, CURRENT_DATE + INTERVAL '1 day', '09:00', '10:30', 'scheduled'),
        ('Advanced Strategy Workshop', 'Master advanced gameplay strategies', 2, 2, 'Workshop', 'Advanced', 8, 120, 85.00, CURRENT_DATE + INTERVAL '2 days', '14:00', '16:00', 'scheduled'),
        ('Youth Development Program', 'Specialized training for young players', 3, 3, 'Youth Program', 'All Levels', 15, 60, 35.00, CURRENT_DATE + INTERVAL '3 days', '16:00', '17:00', 'scheduled'),
        ('Tournament Preparation', 'Intensive training for competitive play', 1, 1, 'Private Session', 'Intermediate', 4, 120, 120.00, CURRENT_DATE + INTERVAL '5 days', '10:00', '12:00', 'scheduled')
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample enrollments
    await client.query(`
      INSERT INTO class_enrollments (class_session_id, user_id, student_name, student_email, payment_status, attendance_status)
      VALUES 
        (1, 1, 'John Doe', 'john.doe@email.com', 'paid', 'enrolled'),
        (1, 2, 'Jane Smith', 'jane.smith@email.com', 'paid', 'enrolled'),
        (2, 1, 'John Doe', 'john.doe@email.com', 'pending', 'enrolled'),
        (3, 3, 'Alex Wilson', 'alex.wilson@email.com', 'paid', 'enrolled')
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample coach credentials
    await client.query(`
      INSERT INTO coach_credentials (coach_id, credential_type, credential_name, issuing_organization, issue_date, expiry_date, verification_status)
      VALUES 
        (1, 'PCP Certification', 'Master Instructor Certification', 'PCP Global', '2023-01-15', '2025-01-15', 'verified'),
        (2, 'PCP Certification', 'Senior Instructor Certification', 'PCP Global', '2023-03-20', '2025-03-20', 'verified'),
        (3, 'PCP Certification', 'Certified Instructor', 'PCP Global', '2023-06-10', '2025-06-10', 'verified'),
        (1, 'First Aid', 'CPR/AED Certification', 'Red Cross', '2024-01-10', '2026-01-10', 'verified')
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample facilities
    await client.query(`
      INSERT INTO training_center_facilities (training_center_id, facility_type, facility_name, description, capacity, hourly_rate, status)
      VALUES 
        (1, 'Court', 'Indoor Court A', 'Professional-grade indoor pickleball court', 8, 50.00, 'available'),
        (1, 'Court', 'Indoor Court B', 'Professional-grade indoor pickleball court', 8, 50.00, 'available'),
        (2, 'Court', 'Outdoor Court 1', 'Premium outdoor court with lighting', 8, 40.00, 'available'),
        (2, 'Court', 'Outdoor Court 2', 'Premium outdoor court with lighting', 8, 40.00, 'maintenance'),
        (3, 'Court', 'Multi-Purpose Court', 'Convertible court for various activities', 12, 45.00, 'available')
      ON CONFLICT DO NOTHING;
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_coaches_training_center ON coaches(training_center_id);
      CREATE INDEX IF NOT EXISTS idx_class_sessions_coach ON class_sessions(coach_id);
      CREATE INDEX IF NOT EXISTS idx_class_sessions_center ON class_sessions(training_center_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_class ON class_enrollments(class_session_id);
      CREATE INDEX IF NOT EXISTS idx_credentials_coach ON coach_credentials(coach_id);
      CREATE INDEX IF NOT EXISTS idx_facilities_center ON training_center_facilities(training_center_id);
    `);

    console.log('✅ Training Center database schema created successfully');
    console.log('📊 Sample data inserted for testing and demonstration');
    console.log('🚀 Training Center Admin module is now fully operational');

  } catch (error) {
    console.error('❌ Error creating Training Center schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the schema creation
createCompleteTrainingCenterSchema()
  .then(() => {
    console.log('🎉 Training Center schema setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema setup failed:', error);
    process.exit(1);
  });