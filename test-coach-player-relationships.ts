/**
 * Test Coach-Player Relationship System
 * Creates mock data to test the new PlayerSearchInput component and coach-player workflow
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createTestData() {
  console.log('Creating test coach-player relationship data...');

  try {
    // Create test players
    const playersResult = await db.execute(sql`
      INSERT INTO users (username, first_name, last_name, display_name, email, password, avatar_url, avatar_initials, created_at)
      VALUES 
        ('player1', 'Alice', 'Johnson', 'Alice J.', 'alice@test.com', '$2a$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'AJ', NOW()),
        ('player2', 'Bob', 'Smith', 'Bob S.', 'bob@test.com', '$2a$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'BS', NOW()),
        ('player3', 'Carol', 'Davis', 'Carol D.', 'carol@test.com', '$2a$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol', 'CD', NOW()),
        ('player4', 'David', 'Wilson', 'David W.', 'david@test.com', '$2a$10$test', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'DW', NOW())
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `);
    console.log('✅ Created test players');

    // Create coaching sessions (Method 1: Session-based relationships)
    await db.execute(sql`
      INSERT INTO coaching_sessions (coach_id, player_id, center_id, session_type, check_in_time, planned_duration, status, session_notes, created_at)
      SELECT 
        1 as coach_id,
        u.id as player_id,
        1 as center_id,
        'individual' as session_type,
        NOW() - INTERVAL '7 days' as check_in_time,
        60 as planned_duration,
        'completed' as status,
        'Initial technical assessment session' as session_notes,
        NOW() as created_at
      FROM users u
      WHERE u.username IN ('player1', 'player2')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Created coaching sessions for session-based relationships');

    // Create class enrollments (Method 3: Facility-based relationships)
    // First ensure we have class instances (using existing template ID 10)
    await db.execute(sql`
      INSERT INTO class_instances (template_id, center_id, coach_id, class_date, start_time, end_time, max_participants, current_enrollment, status, created_at)
      VALUES 
        (10, 1, 1, CURRENT_DATE + INTERVAL '1 day', NOW() + INTERVAL '9 hours', NOW() + INTERVAL '10 hours', 8, 2, 'scheduled', NOW()),
        (10, 1, 1, CURRENT_DATE + INTERVAL '2 days', NOW() + INTERVAL '14 hours', NOW() + INTERVAL '15 hours', 6, 1, 'scheduled', NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    // Create class enrollments for facility relationships
    await db.execute(sql`
      INSERT INTO class_enrollments (player_id, class_instance_id, enrolled_at, payment_status, attendance_status, created_at)
      SELECT 
        u.id as player_id,
        ci.id as class_instance_id,
        NOW() - INTERVAL '3 days' as enrolled_at,
        'paid' as payment_status,
        'enrolled' as attendance_status,
        NOW() as created_at
      FROM users u
      CROSS JOIN class_instances ci
      WHERE u.username IN ('player3', 'player4')
        AND ci.coach_id = 1
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Created class enrollments for facility-based relationships');

    // Create a player with both relationships (session + facility)
    await db.execute(sql`
      INSERT INTO coaching_sessions (coach_id, player_id, center_id, session_type, check_in_time, planned_duration, status, session_notes, created_at)
      SELECT 
        1 as coach_id,
        u.id as player_id,
        1 as center_id,
        'individual' as session_type,
        NOW() - INTERVAL '14 days' as check_in_time,
        90 as planned_duration,
        'completed' as status,
        'Advanced training session' as session_notes,
        NOW() as created_at
      FROM users u
      WHERE u.username = 'player3'
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Created mixed relationship (player3 now has both session and facility relationships)');

    // Verify the relationships
    const relationshipCheck = await db.execute(sql`
      SELECT 
        'session_players' as type,
        COUNT(DISTINCT u.id) as count
      FROM users u
      JOIN coaching_sessions cs ON u.id = cs.player_id
      WHERE cs.coach_id = 1
      
      UNION ALL
      
      SELECT 
        'facility_players' as type,
        COUNT(DISTINCT u.id) as count
      FROM users u
      JOIN class_enrollments ce ON u.id = ce.player_id
      JOIN class_instances ci ON ce.class_instance_id = ci.id
      WHERE ci.coach_id = 1
    `);

    console.log('📊 Relationship Summary:');
    relationshipCheck.rows.forEach((row: any) => {
      console.log(`   ${row.type}: ${row.count} players`);
    });

    console.log('\n🎯 Test Data Summary:');
    console.log('   • player1, player2: Session-based relationships only');
    console.log('   • player3: Both session and facility relationships');
    console.log('   • player4: Facility-based relationship only');
    console.log('\n✅ Coach-player relationship test data created successfully!');
    console.log('\nNow the PlayerSearchInput component will show:');
    console.log('   📱 Session Players section: Alice, Bob, Carol');
    console.log('   🏢 Class Students section: David');
    console.log('   🏆 Regular Players (both): Carol will show in Session Players with "Regular Player" badge');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run the test data creation
createTestData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Failed to create test data:', error);
  process.exit(1);
});