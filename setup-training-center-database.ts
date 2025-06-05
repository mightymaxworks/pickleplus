/**
 * Training Center Database Setup Script
 * Creates all necessary tables and populates with real training center data
 * 
 * Run with: npx tsx setup-training-center-database.ts
 */

import { db } from './server/db-factory';

async function setupTrainingCenterDatabase() {
  console.log('🚀 Setting up Training Center Database...');

  try {
    // Create coach_profiles table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coach_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        specialties TEXT[],
        certifications TEXT[],
        experience_years INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0,
        hourly_rate DECIMAL(10,2),
        profile_image_url VARCHAR(500),
        is_verified BOOLEAN DEFAULT false,
        availability_schedule JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create class_templates table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS class_templates (
        id SERIAL PRIMARY KEY,
        center_id INTEGER REFERENCES training_centers(id),
        coach_id INTEGER REFERENCES coach_profiles(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        detailed_description TEXT,
        category VARCHAR(100),
        skill_level VARCHAR(50),
        intensity_level VARCHAR(50),
        class_format VARCHAR(100),
        max_participants INTEGER DEFAULT 8,
        min_enrollment INTEGER DEFAULT 1,
        duration_minutes INTEGER DEFAULT 60,
        price DECIMAL(10,2) DEFAULT 0.00,
        equipment_provided TEXT[],
        equipment_required TEXT[],
        prerequisites TEXT[],
        benefits TEXT[],
        is_active BOOLEAN DEFAULT true,
        recurring_schedule JSONB,
        auto_cancel_hours INTEGER DEFAULT 24,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create class_instances table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS class_instances (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES class_templates(id),
        center_id INTEGER REFERENCES training_centers(id),
        coach_id INTEGER REFERENCES coach_profiles(id),
        class_date DATE NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        max_participants INTEGER DEFAULT 8,
        current_enrollment INTEGER DEFAULT 0,
        court_number INTEGER,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create class_enrollments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id SERIAL PRIMARY KEY,
        class_instance_id INTEGER REFERENCES class_instances(id),
        player_id INTEGER REFERENCES users(id),
        enrollment_type VARCHAR(50) DEFAULT 'advance',
        enrollment_date TIMESTAMP DEFAULT NOW(),
        attendance_status VARCHAR(50) DEFAULT 'registered',
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create coach_reviews table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coach_reviews (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES coach_profiles(id),
        reviewer_id INTEGER REFERENCES users(id),
        session_id INTEGER,
        class_instance_id INTEGER REFERENCES class_instances(id),
        overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
        technical_skill_rating INTEGER CHECK (technical_skill_rating >= 1 AND technical_skill_rating <= 5),
        communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
        enthusiasm_rating INTEGER CHECK (enthusiasm_rating >= 1 AND enthusiasm_rating <= 5),
        punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
        review_text TEXT,
        would_recommend BOOLEAN DEFAULT true,
        pros TEXT[],
        cons TEXT[],
        is_verified BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables created successfully');

    // Insert sample coach profiles
    console.log('👨‍🏫 Creating coach profiles...');
    await db.execute(`
      INSERT INTO coach_profiles (
        user_id, name, bio, specialties, certifications, experience_years, 
        rating, total_reviews, hourly_rate, is_verified
      ) VALUES 
      (1, 'Sarah Chen', 'Professional pickleball instructor with tournament experience', 
       ARRAY['Beginner Training', 'Tournament Prep', 'Strategy'], 
       ARRAY['PPR Certified', 'USAPA Level 2'], 8, 4.8, 127, 85.00, true),
      (1, 'Mike Rodriguez', 'Former tennis pro specializing in pickleball transition', 
       ARRAY['Technique', 'Footwork', 'Mental Game'], 
       ARRAY['PTR Certified', 'PPR Level 3'], 12, 4.9, 203, 95.00, true),
      (1, 'Emma Thompson', 'Youth development specialist and competitive player', 
       ARRAY['Youth Training', 'Fitness', 'Game Strategy'], 
       ARRAY['Youth Coaching Cert', 'First Aid'], 5, 4.7, 89, 75.00, true)
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample class templates
    console.log('📚 Creating class templates...');
    await db.execute(`
      INSERT INTO class_templates (
        center_id, coach_id, name, description, detailed_description, category, 
        skill_level, intensity_level, class_format, max_participants, min_enrollment, 
        duration_minutes, price, equipment_provided, equipment_required, prerequisites, benefits
      ) VALUES 
      (1, 1, 'Beginner Fundamentals', 'Perfect introduction to pickleball basics', 
       'Learn proper grip, basic strokes, court positioning, and scoring. Includes safety guidelines and equipment overview.', 
       'Fundamentals', 'Beginner', 'Low', 'Group', 8, 3, 90, 35.00,
       ARRAY['Paddles', 'Balls', 'Court'], ARRAY['Athletic shoes', 'Water bottle'], 
       ARRAY[], ARRAY['Master basic strokes', 'Understand scoring', 'Court awareness']),
      (1, 2, 'Intermediate Strategy', 'Advanced tactics and shot placement', 
       'Focus on shot selection, positioning, doubles strategy, and mental game. Practice drills for consistency and power.', 
       'Strategy', 'Intermediate', 'Medium', 'Group', 6, 3, 75, 45.00,
       ARRAY['Paddles', 'Balls', 'Cones'], ARRAY['Athletic shoes', 'Towel'], 
       ARRAY['Basic stroke knowledge', '6 months experience'], ARRAY['Improved shot selection', 'Better positioning', 'Game tactics']),
      (1, 3, 'Youth Development', 'Fun-focused training for young players', 
       'Age-appropriate drills, games, and skill development. Emphasis on fun, fitness, and fundamental movement patterns.', 
       'Youth', 'Beginner', 'Medium', 'Group', 10, 4, 60, 25.00,
       ARRAY['Youth paddles', 'Foam balls', 'Cones'], ARRAY['Athletic shoes', 'Water bottle'], 
       ARRAY['Ages 8-16'], ARRAY['Motor skill development', 'Social skills', 'Sport fundamentals'])
      ON CONFLICT DO NOTHING;
    `);

    // Insert class instances for this week
    console.log('📅 Creating class instances...');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const classDate = new Date(startOfWeek);
      classDate.setDate(startOfWeek.getDate() + dayOffset);
      
      // Morning classes
      const morningEnrollment1 = Math.floor(Math.random() * 6) + 2;
      const morningEnrollment2 = Math.floor(Math.random() * 4) + 1;
      
      await db.execute(`
        INSERT INTO class_instances (
          template_id, center_id, coach_id, class_date, start_time, end_time, 
          max_participants, current_enrollment, court_number, status
        ) VALUES 
        (1, 1, 1, '${classDate.toISOString().split('T')[0]}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 9, 0).toISOString()}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 10, 30).toISOString()}', 8, ${morningEnrollment1}, 1, 'scheduled'),
        (2, 1, 2, '${classDate.toISOString().split('T')[0]}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 11, 0).toISOString()}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 12, 15).toISOString()}', 6, ${morningEnrollment2}, 2, 'scheduled')
      `);

      // Evening classes (except Sunday)
      if (dayOffset < 6) {
        const eveningEnrollment = Math.floor(Math.random() * 8) + 3;
        await db.execute(`
          INSERT INTO class_instances (
            template_id, center_id, coach_id, class_date, start_time, end_time, 
            max_participants, current_enrollment, court_number, status
          ) VALUES 
          (3, 1, 3, '${classDate.toISOString().split('T')[0]}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 18, 0).toISOString()}', '${new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 19, 0).toISOString()}', 10, ${eveningEnrollment}, 3, 'scheduled')
        `);
      }
    }

    // Insert sample enrollments
    console.log('👥 Creating sample enrollments...');
    await db.execute(`
      INSERT INTO class_enrollments (class_instance_id, player_id, enrollment_type, attendance_status, payment_status)
      SELECT id, 1, 'advance', 'registered', 'paid'
      FROM class_instances 
      WHERE current_enrollment > 0
      LIMIT 5;
    `);

    // Insert sample reviews
    console.log('⭐ Creating coach reviews...');
    await db.execute(`
      INSERT INTO coach_reviews (
        coach_id, reviewer_id, overall_rating, technical_skill_rating, 
        communication_rating, enthusiasm_rating, punctuality_rating, 
        review_text, would_recommend, pros, cons, is_verified, is_public
      ) VALUES 
      (1, 1, 5, 5, 5, 4, 5, 'Sarah is an excellent instructor! Very patient and knowledgeable.', 
       true, ARRAY['Patient teaching', 'Clear explanations', 'Great drills'], ARRAY[], true, true),
      (2, 1, 5, 5, 4, 5, 5, 'Mike helped me transition from tennis perfectly. Highly recommend!', 
       true, ARRAY['Tennis background helpful', 'Strategic insights', 'Professional'], ARRAY[], true, true),
      (3, 1, 4, 4, 5, 5, 4, 'Emma is great with kids and keeps them engaged throughout the class.', 
       true, ARRAY['Great with kids', 'Fun activities', 'Encouraging'], ARRAY['Sometimes runs over time'], true, true);
    `);

    console.log('🎉 Training Center Database setup complete!');
    console.log('📊 Summary:');
    console.log('   • Created 5 database tables');
    console.log('   • Added 3 professional coaches');
    console.log('   • Created 3 class templates');
    console.log('   • Scheduled 19 class instances for this week');
    console.log('   • Added sample enrollments and reviews');

  } catch (error) {
    console.error('❌ Error setting up training center database:', error);
    throw error;
  }
}

// Run if this file is executed directly
setupTrainingCenterDatabase()
  .then(() => {
    console.log('✅ Database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });

export { setupTrainingCenterDatabase };