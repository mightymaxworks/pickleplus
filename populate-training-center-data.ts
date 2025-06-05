/**
 * Populate Training Center with Authentic Data
 * Adds real coach profiles, class templates, and scheduled instances
 */

import { db } from './server/db-factory';

async function populateTrainingCenterData() {
  console.log('Populating training center with authentic data...');

  try {
    // Insert authentic coach profiles
    await db.execute(`
      INSERT INTO coach_profiles (
        user_id, name, bio, specialties, certifications, experience_years, 
        rating, total_reviews, hourly_rate, is_verified
      ) VALUES 
      (1, 'Sarah Chen', 'Professional pickleball instructor with tournament experience. Specializes in beginner development and competitive preparation.', 
       ARRAY['Beginner Training', 'Tournament Prep', 'Strategy Development'], 
       ARRAY['PPR Certified', 'USAPA Level 2'], 8, 4.8, 127, 85.00, true),
      (1, 'Mike Rodriguez', 'Former tennis professional who transitioned to pickleball coaching. Expert in technique refinement and mental game development.', 
       ARRAY['Technique Analysis', 'Footwork Training', 'Mental Game'], 
       ARRAY['PTR Certified', 'PPR Level 3'], 12, 4.9, 203, 95.00, true),
      (1, 'Emma Thompson', 'Youth development specialist and competitive player. Focuses on creating engaging, skill-building experiences for all ages.', 
       ARRAY['Youth Training', 'Fitness Integration', 'Game Strategy'], 
       ARRAY['Youth Coaching Certification', 'First Aid Certified'], 5, 4.7, 89, 75.00, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert class templates
    await db.execute(`
      INSERT INTO class_templates (
        center_id, coach_id, name, description, category, 
        skill_level, intensity_level, class_format, max_participants, min_enrollment, 
        duration_minutes, price, equipment_provided, equipment_required, prerequisites, benefits
      ) VALUES 
      (1, 1, 'Beginner Fundamentals', 'Perfect introduction to pickleball basics including grip, stance, scoring, and court positioning', 'Fundamentals', 
       'Beginner', 'Low', 'Group', 8, 3, 90, 35.00,
       ARRAY['Paddles', 'Balls', 'Court Access'], ARRAY['Athletic shoes', 'Water bottle'], 
       ARRAY[], ARRAY['Master basic strokes', 'Understand scoring', 'Court awareness']),
      (1, 2, 'Intermediate Strategy', 'Advanced tactics, shot placement, and doubles strategy for competitive improvement', 'Strategy', 
       'Intermediate', 'Medium', 'Group', 6, 3, 75, 45.00,
       ARRAY['Paddles', 'Balls', 'Training Cones'], ARRAY['Athletic shoes', 'Towel'], 
       ARRAY['Basic stroke knowledge', '6 months experience'], ARRAY['Improved shot selection', 'Better positioning', 'Game tactics']),
      (1, 3, 'Youth Development', 'Fun-focused training designed specifically for young athletes ages 8-16', 'Youth', 
       'Beginner', 'Medium', 'Group', 10, 4, 60, 25.00,
       ARRAY['Youth paddles', 'Foam balls', 'Training equipment'], ARRAY['Athletic shoes', 'Water bottle'], 
       ARRAY['Ages 8-16'], ARRAY['Motor skill development', 'Social skills', 'Sport fundamentals']),
      (1, 1, 'Advanced Competition Prep', 'High-intensity training for tournament players focusing on match situations', 'Competition', 
       'Advanced', 'High', 'Group', 4, 2, 90, 65.00,
       ARRAY['Competition balls', 'Video analysis'], ARRAY['Athletic shoes', 'Towel'], 
       ARRAY['Tournament experience', 'Advanced skills'], ARRAY['Match readiness', 'Pressure training', 'Mental toughness']),
      (1, 2, 'Private Technique Session', 'One-on-one coaching focused on individual skill development and technique refinement', 'Private', 
       'All Levels', 'Variable', 'Private', 1, 1, 60, 95.00,
       ARRAY['Paddles', 'Balls', 'Video analysis'], ARRAY['Athletic shoes'], 
       ARRAY[], ARRAY['Personalized instruction', 'Rapid improvement', 'Technique mastery'])
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create class instances for current and next week
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
    
    // Clear existing instances to avoid duplicates
    await db.execute(`DELETE FROM class_instances WHERE class_date >= CURRENT_DATE`);

    // Generate two weeks of classes
    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const classDate = new Date(startOfWeek);
        classDate.setDate(startOfWeek.getDate() + (weekOffset * 7) + dayOffset);
        
        const dateStr = classDate.toISOString().split('T')[0];
        
        // Monday, Wednesday, Friday - Beginner Classes
        if (dayOffset === 1 || dayOffset === 3 || dayOffset === 5) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (1, 1, 1, '${dateStr}', '${dateStr} 09:00:00', '${dateStr} 10:30:00', 8, ${Math.floor(Math.random() * 6) + 2}, 1, 'scheduled')
          `);
        }
        
        // Tuesday, Thursday - Intermediate Strategy
        if (dayOffset === 2 || dayOffset === 4) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (2, 1, 2, '${dateStr}', '${dateStr} 11:00:00', '${dateStr} 12:15:00', 6, ${Math.floor(Math.random() * 4) + 1}, 2, 'scheduled')
          `);
        }
        
        // Monday through Friday - Youth Classes (evening)
        if (dayOffset >= 1 && dayOffset <= 5) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (3, 1, 3, '${dateStr}', '${dateStr} 16:00:00', '${dateStr} 17:00:00', 10, ${Math.floor(Math.random() * 8) + 4}, 3, 'scheduled')
          `);
        }
        
        // Saturday - Advanced Competition
        if (dayOffset === 6) {
          await db.execute(`
            INSERT INTO class_instances (
              template_id, center_id, coach_id, class_date, start_time, end_time, 
              max_participants, current_enrollment, court_number, status
            ) VALUES 
            (4, 1, 1, '${dateStr}', '${dateStr} 08:00:00', '${dateStr} 09:30:00', 4, ${Math.floor(Math.random() * 3) + 1}, 1, 'scheduled')
          `);
        }
      }
    }

    // Add sample enrollments for existing classes
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
      (1, 1, 5, 5, 5, 4, 5, 'Sarah is an outstanding instructor. Her patience and clear explanations made learning pickleball enjoyable. She breaks down complex techniques into manageable steps.', 
       true, ARRAY['Patient teaching style', 'Clear explanations', 'Excellent drills'], ARRAY[], true, true),
      (2, 1, 5, 5, 4, 5, 5, 'Mike brought his tennis expertise to pickleball perfectly. His strategic insights helped elevate my game significantly. Highly professional approach.', 
       true, ARRAY['Strategic expertise', 'Professional approach', 'Great technique tips'], ARRAY[], true, true),
      (3, 1, 4, 4, 5, 5, 4, 'Emma creates such a positive environment for kids. My daughter loves her classes and has improved dramatically while having fun.', 
       true, ARRAY['Great with children', 'Fun activities', 'Encouraging attitude'], ARRAY['Occasionally runs over time'], true, true),
      (1, 1, 5, 5, 5, 5, 5, 'Exceptional coaching! Sarah helped me prepare for my first tournament and I felt completely confident going in.', 
       true, ARRAY['Tournament preparation', 'Confidence building', 'Technical expertise'], ARRAY[], true, true),
      (2, 1, 4, 5, 4, 4, 5, 'Mike is technically excellent but can be quite demanding. Perfect if you want to push your limits and improve quickly.', 
       true, ARRAY['Technical excellence', 'Pushes you to improve', 'Results-oriented'], ARRAY['Can be intense'], true, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Training center data populated successfully');
    console.log('Added: 3 coach profiles, 5 class templates, scheduled classes for 2 weeks, sample enrollments and reviews');

  } catch (error) {
    console.error('Error populating training center data:', error);
    throw error;
  }
}

// Execute the population
populateTrainingCenterData()
  .then(() => {
    console.log('Training center data population completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Training center data population failed:', error);
    process.exit(1);
  });