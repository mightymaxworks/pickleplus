/**
 * Seed script for coaching test data
 * Creates test coaches, students, and assignments for CI/CD testing
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pickle_plus_test'
});

async function seedCoachingTestData() {
  console.log('🌱 Seeding coaching test data for CI/CD...');

  try {
    // Ensure mightymax user exists with coach privileges
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, display_name, coach_level, is_admin, created_at)
      VALUES ('mightymax', 'mightymax@test.com', $1, 'Mighty Max', 3, true, NOW())
      ON CONFLICT (username) DO UPDATE SET
        coach_level = 3,
        is_admin = true,
        password_hash = $1
    `, [hashedPassword]);

    // Create test students
    const studentIds = [];
    
    for (let i = 1; i <= 5; i++) {
      const result = await pool.query(`
        INSERT INTO users (username, email, display_name, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (username) DO UPDATE SET display_name = $3
        RETURNING id
      `, [`test_student_${i}`, `student${i}@test.com`, `Test Student ${i}`]);
      
      studentIds.push(result.rows[0].id);
    }

    // Get coach ID
    const coachResult = await pool.query('SELECT id FROM users WHERE username = $1', ['mightymax']);
    const coachId = coachResult.rows[0].id;

    // Create coach-student assignments
    for (const studentId of studentIds) {
      await pool.query(`
        INSERT INTO coach_student_assignments (coach_id, student_id, assigned_date, is_active)
        VALUES ($1, $2, NOW(), true)
        ON CONFLICT (coach_id, student_id) DO UPDATE SET is_active = true
      `, [coachId, studentId]);
    }

    console.log('✅ Coaching test data seeded successfully');
    console.log(`   - Coach: mightymax (ID: ${coachId}) with Level 3 privileges`);
    console.log(`   - Students: ${studentIds.length} test students created`);
    console.log(`   - Assignments: ${studentIds.length} coach-student assignments created`);

  } catch (error) {
    console.error('❌ Error seeding coaching test data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedCoachingTestData();
}

module.exports = { seedCoachingTestData };