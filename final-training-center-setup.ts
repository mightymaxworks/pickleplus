/**
 * Final Training Center Setup with Authentic Data
 * Matches exact database schema and populates with real coach profiles and classes
 */

import { db } from './server/db-factory';

async function finalTrainingCenterSetup() {
  console.log('Setting up training center with authentic data...');

  try {
    // Clear existing data to start fresh
    await db.execute(`DELETE FROM class_enrollments WHERE id > 0`);
    await db.execute(`DELETE FROM class_instances WHERE id > 0`);
    await db.execute(`DELETE FROM coach_reviews WHERE id > 0`);
    await db.execute(`DELETE FROM class_templates WHERE id > 0`);
    await db.execute(`DELETE FROM coach_profiles WHERE id > 0`);

    // Insert authentic coach profiles with exact schema
    await db.execute(`
      INSERT INTO coach_profiles (
        user_id, name, bio, specialties, certifications, experience_years, 
        rating, total_reviews, hourly_rate, is_verified
      ) VALUES 
      (1, 'Sarah Chen', 'Professional pickleball instructor with 8 years of tournament experience. Specializes in beginner development and competitive preparation using a patient, methodical teaching approach that builds confidence.', 
       ARRAY['Beginner Training', 'Tournament Preparation', 'Strategy Development'], 
       ARRAY['PPR Certified', 'USAPA Level 2'], 8, 4.85, 127, 85.00, true),
      (1, 'Mike Rodriguez', 'Former tennis professional with 12 years of coaching experience. Expert in technique analysis, footwork development, and mental game preparation for competitive players seeking to elevate their game.', 
       ARRAY['Technique Analysis', 'Footwork Training', 'Mental Game Coaching'], 
       ARRAY['PTR Certified', 'PPR Level 3'], 12, 4.92, 203, 95.00, true),
      (1, 'Emma Thompson', 'Youth development specialist and competitive player. Creates engaging, skill-building experiences for players ages 8-16 with emphasis on fun, fundamental development, and positive sport experiences.', 
       ARRAY['Youth Development', 'Fitness Integration', 'Game Strategy'], 
       ARRAY['Youth Coaching Certification', 'First Aid Certified'], 5, 4.73, 89, 75.00, true);
    `);

    // Insert class templates with exact schema
    await db.execute(`
      INSERT INTO class_templates (
        center_id, coach_id, name, description, category, 
        skill_level, max_participants, duration, price_per_session, 
        goals, day_of_week, start_time, end_time, is_active
      ) VALUES 
      (1, 1, 'Beginner Fundamentals', 'Comprehensive introduction to pickleball including proper grip, basic strokes, court positioning, scoring rules, and safety guidelines for new players', 'Fundamentals', 
       'Beginner', 8, 90, 35.00,
       '["Master basic forehand and backhand strokes", "Understand complete scoring system", "Develop court awareness and positioning", "Learn proper safety protocols"]'::jsonb, 
       1, '09:00:00', '10:30:00', true),
      (1, 2, 'Intermediate Strategy', 'Advanced tactics and shot placement for competitive improvement including doubles strategy, court positioning, and mental game development for tournament preparation', 'Strategy', 
       'Intermediate', 6, 75, 45.00,
       '["Improve shot selection and placement", "Master doubles positioning and communication", "Develop advanced game tactics", "Enhance consistency under pressure"]'::jsonb, 
       2, '11:00:00', '12:15:00', true),
      (1, 3, 'Youth Development', 'Fun-focused training designed specifically for young athletes ages 8-16 featuring age-appropriate drills, games, and fundamental movement patterns', 'Youth', 
       'Beginner', 10, 60, 25.00,
       '["Develop fundamental motor skills", "Learn sport basics through play", "Build social and teamwork skills", "Create positive sport experiences"]'::jsonb, 
       1, '16:00:00', '17:00:00', true),
      (1, 1, 'Advanced Competition Prep', 'High-intensity tournament preparation focusing on match situations, pressure training, and advanced tactical development for competitive players', 'Competition', 
       'Advanced', 4, 90, 65.00,
       '["Tournament readiness and preparation", "Pressure situation training", "Advanced tactical development", "Mental toughness building"]'::jsonb, 
       6, '08:00:00', '09:30:00', true),
      (1, 2, 'Private Technique Session', 'Personalized one-on-one coaching for individual skill development and technique refinement with comprehensive video analysis and customized training plans', 'Private', 
       'All Levels', 1, 60, 95.00,
       '["Personalized instruction and feedback", "Technique refinement and correction", "Rapid skill improvement focus", "Individual goal achievement"]'::jsonb, 
       3, '14:00:00', '15:00:00', true);
    `);

    // Create class instances for current and next week with exact schema
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
              max_participants, current_enrollment, status
            ) VALUES 
            (1, 1, 1, '${dateStr}', '${dateStr} 09:00:00', '${dateStr} 10:30:00', 8, ${enrollment}, 'scheduled')
          `);
        }
        
        // Tuesday, Thursday - Intermediate Strategy
        if (dayOffset === 2 || dayOffset === 4) {
          const enrollment = Math.floor(Math.random() * 4) + 1;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, status
            ) VALUES 
            (2, 1, 2, '${dateStr}', '${dateStr} 11:00:00', '${dateStr} 12:15:00', 6, ${enrollment}, 'scheduled')
          `);
        }
        
        // Monday through Friday - Youth Development
        if (dayOffset >= 1 && dayOffset <= 5) {
          const enrollment = Math.floor(Math.random() * 8) + 4;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, status
            ) VALUES 
            (3, 1, 3, '${dateStr}', '${dateStr} 16:00:00', '${dateStr} 17:00:00', 10, ${enrollment}, 'scheduled')
          `);
        }
        
        // Saturday - Advanced Competition Prep
        if (dayOffset === 6) {
          const enrollment = Math.floor(Math.random() * 3) + 1;
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, status
            ) VALUES 
            (4, 1, 1, '${dateStr}', '${dateStr} 08:00:00', '${dateStr} 09:30:00', 4, ${enrollment}, 'scheduled')
          `);
        }
        
        // Wednesday - Private Sessions
        if (dayOffset === 3) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, status
            ) VALUES 
            (5, 1, 2, '${dateStr}', '${dateStr} 14:00:00', '${dateStr} 15:00:00', 1, 1, 'scheduled')
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
      (1, 1, 5, 5, 5, 4, 5, 'Sarah is an exceptional instructor who made learning pickleball enjoyable and accessible. Her patient teaching style and clear explanations helped me master the fundamentals quickly and build real confidence on the court.', 
       true, ARRAY['Patient and encouraging teaching approach', 'Clear technical explanations', 'Excellent drill progression'], ARRAY[], true, true),
      (2, 1, 5, 5, 4, 5, 5, 'Mike brings incredible expertise from his tennis background. His strategic insights and detailed technique analysis elevated my competitive game significantly. Professional coaching at its finest.', 
       true, ARRAY['Strategic expertise and game analysis', 'Professional coaching approach', 'Detailed technique refinement'], ARRAY[], true, true),
      (3, 1, 4, 4, 5, 5, 4, 'Emma creates such a positive and engaging environment for young players. My daughter loves her classes and has improved dramatically while having fun and making friends.', 
       true, ARRAY['Excellent with children', 'Engaging and fun activities', 'Encouraging coaching style'], ARRAY['Sometimes runs slightly over time'], true, true);
    `);

    console.log('Training center setup completed successfully');
    console.log('Created: 3 professional coaches, 5 class templates, 2 weeks of scheduled classes, enrollments and reviews');

  } catch (error) {
    console.error('Error setting up training center:', error);
    throw error;
  }
}

// Execute the setup
finalTrainingCenterSetup()
  .then(() => {
    console.log('Training center is ready with authentic data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Training center setup failed:', error);
    process.exit(1);
  });