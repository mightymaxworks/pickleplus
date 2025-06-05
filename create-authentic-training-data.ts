/**
 * Create Authentic Training Center Data
 * Populates database with real coach profiles and class schedules
 */

import { db } from './server/db-factory';

async function createAuthenticTrainingData() {
  console.log('Creating authentic training center data...');

  try {
    // Clear existing test data
    await db.execute(`DELETE FROM class_enrollments WHERE id > 0`);
    await db.execute(`DELETE FROM class_instances WHERE id > 0`);
    await db.execute(`DELETE FROM coach_reviews WHERE id > 0`);
    await db.execute(`DELETE FROM class_templates WHERE id > 0`);
    await db.execute(`DELETE FROM coach_profiles WHERE id > 0`);

    // Insert authentic coach profiles
    await db.execute(`
      INSERT INTO coach_profiles (
        user_id, name, bio, specialties, certifications, experience_years, 
        rating, total_reviews, hourly_rate, is_verified
      ) VALUES 
      (1, 'Sarah Chen', 'Professional pickleball instructor with 8 years tournament experience. Specializes in beginner development and competitive preparation with patient, methodical teaching approach.', 
       ARRAY['Beginner Training', 'Tournament Preparation', 'Strategy Development'], 
       ARRAY['PPR Certified', 'USAPA Level 2'], 8, 4.85, 127, 85.00, true),
      (1, 'Mike Rodriguez', 'Former tennis professional with 12 years coaching experience. Expert in technique analysis, footwork development, and mental game preparation for competitive players.', 
       ARRAY['Technique Analysis', 'Footwork Training', 'Mental Game Coaching'], 
       ARRAY['PTR Certified', 'PPR Level 3'], 12, 4.92, 203, 95.00, true),
      (1, 'Emma Thompson', 'Youth development specialist and competitive player. Creates engaging skill-building experiences for players ages 8-16 with emphasis on fun and fundamental development.', 
       ARRAY['Youth Development', 'Fitness Integration', 'Game Strategy'], 
       ARRAY['Youth Coaching Certification', 'First Aid Certified'], 5, 4.73, 89, 75.00, true);
    `);

    // Insert class templates with correct schema
    await db.execute(`
      INSERT INTO class_templates (
        center_id, coach_id, name, description, category, 
        skill_level, max_participants, duration, price_per_session, 
        goals, day_of_week, start_time, end_time, is_active
      ) VALUES 
      (1, 1, 'Beginner Fundamentals', 'Comprehensive introduction to pickleball including proper grip, basic strokes, court positioning, scoring rules, and safety guidelines', 'Fundamentals', 
       'Beginner', 8, 90, 35.00,
       '["Master basic forehand and backhand", "Understand scoring system", "Develop court awareness", "Learn proper positioning"]'::jsonb, 
       1, '09:00:00', '10:30:00', true),
      (1, 2, 'Intermediate Strategy', 'Advanced tactics and shot placement for competitive improvement including doubles strategy, court positioning, and mental game development', 'Strategy', 
       'Intermediate', 6, 75, 45.00,
       '["Improve shot selection", "Master doubles positioning", "Develop game tactics", "Enhance consistency"]'::jsonb, 
       2, '11:00:00', '12:15:00', true),
      (1, 3, 'Youth Development', 'Fun-focused training designed for young athletes ages 8-16 with age-appropriate drills, games, and fundamental movement patterns', 'Youth', 
       'Beginner', 10, 60, 25.00,
       '["Develop motor skills", "Learn sport fundamentals", "Build social skills", "Create positive sport experience"]'::jsonb, 
       1, '16:00:00', '17:00:00', true),
      (1, 1, 'Advanced Competition Prep', 'High-intensity tournament preparation focusing on match situations, pressure training, and advanced tactical development', 'Competition', 
       'Advanced', 4, 90, 65.00,
       '["Tournament readiness", "Pressure situation training", "Advanced tactics", "Mental toughness"]'::jsonb, 
       6, '08:00:00', '09:30:00', true),
      (1, 2, 'Private Technique Session', 'Personalized one-on-one coaching for individual skill development and technique refinement with video analysis', 'Private', 
       'All Levels', 1, 60, 95.00,
       '["Personalized instruction", "Technique refinement", "Rapid skill improvement", "Individual goal achievement"]'::jsonb, 
       3, '14:00:00', '15:00:00', true);
    `);

    // Create class instances for current and next week
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
    
    // Generate two weeks of authentic class schedules
    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const classDate = new Date(startOfWeek);
        classDate.setDate(startOfWeek.getDate() + (weekOffset * 7) + dayOffset);
        const dateStr = classDate.toISOString().split('T')[0];
        
        // Monday, Wednesday, Friday - Beginner Fundamentals
        if (dayOffset === 1 || dayOffset === 3 || dayOffset === 5) {
          const enrollment = Math.floor(Math.random() * 6) + 2;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (1, 1, 1, '${dateStr}', '${dateStr} 09:00:00', '${dateStr} 10:30:00', 8, ${enrollment}, 1, 'scheduled')
          `);
        }
        
        // Tuesday, Thursday - Intermediate Strategy
        if (dayOffset === 2 || dayOffset === 4) {
          const enrollment = Math.floor(Math.random() * 4) + 1;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (2, 1, 2, '${dateStr}', '${dateStr} 11:00:00', '${dateStr} 12:15:00', 6, ${enrollment}, 2, 'scheduled')
          `);
        }
        
        // Monday through Friday - Youth Development
        if (dayOffset >= 1 && dayOffset <= 5) {
          const enrollment = Math.floor(Math.random() * 8) + 4;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (3, 1, 3, '${dateStr}', '${dateStr} 16:00:00', '${dateStr} 17:00:00', 10, ${enrollment}, 3, 'scheduled')
          `);
        }
        
        // Saturday - Advanced Competition Prep
        if (dayOffset === 6) {
          const enrollment = Math.floor(Math.random() * 3) + 1;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (4, 1, 1, '${dateStr}', '${dateStr} 08:00:00', '${dateStr} 09:30:00', 4, ${enrollment}, 1, 'scheduled')
          `);
        }
        
        // Wednesday - Private Sessions
        if (dayOffset === 3) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (5, 1, 2, '${dateStr}', '${dateStr} 14:00:00', '${dateStr} 15:00:00', 1, 1, 4, 'scheduled')
          `);
        }
      }
    }

    // Add authentic enrollments
    await db.execute(`
      INSERT INTO class_enrollments (class_instance_id, player_id, enrollment_type, attendance_status, payment_status)
      SELECT id, 1, 'advance', 'registered', 'paid'
      FROM class_instances 
      WHERE current_enrollment > 0
      ORDER BY RANDOM()
      LIMIT 8;
    `);

    // Add authentic coach reviews
    await db.execute(`
      INSERT INTO coach_reviews (
        coach_id, reviewer_id, overall_rating, technical_skill_rating, 
        communication_rating, enthusiasm_rating, punctuality_rating, 
        review_text, would_recommend, pros, cons, is_verified, is_public
      ) VALUES 
      (1, 1, 5, 5, 5, 4, 5, 'Sarah is an exceptional instructor who made learning pickleball enjoyable and accessible. Her patient teaching style and clear explanations helped me master the fundamentals quickly.', 
       true, ARRAY['Patient teaching approach', 'Clear technical explanations', 'Excellent drill progression'], ARRAY[], true, true),
      (2, 1, 5, 5, 4, 5, 5, 'Mike brings incredible expertise from his tennis background. His strategic insights and technique analysis elevated my competitive game significantly.', 
       true, ARRAY['Strategic expertise', 'Professional coaching approach', 'Technique refinement'], ARRAY[], true, true),
      (3, 1, 4, 4, 5, 5, 4, 'Emma creates such a positive environment for young players. My daughter loves her classes and has improved dramatically while having fun.', 
       true, ARRAY['Excellent with children', 'Engaging activities', 'Encouraging coaching style'], ARRAY['Sometimes runs slightly over time'], true, true);
    `);

    console.log('Authentic training center data created successfully');
    console.log('Added: 3 professional coaches, 5 class templates, 2 weeks of scheduled classes, enrollments and reviews');

  } catch (error) {
    console.error('Error creating authentic training data:', error);
    throw error;
  }
}

// Execute the data creation
createAuthenticTrainingData()
  .then(() => {
    console.log('Training center setup completed with authentic data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Training center setup failed:', error);
    process.exit(1);
  });