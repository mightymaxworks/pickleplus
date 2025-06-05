/**
 * Check Database Schema Script
 * Examines existing training center related tables
 */

import { db } from './server/db-factory';

async function checkDatabaseSchema() {
  console.log('🔍 Checking existing database schema...');

  try {
    // Check for existing tables
    const tablesResult = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    tablesResult.rows.forEach((row: any) => {
      console.log('  -', row.table_name);
    });

    // Check for training center related tables specifically
    const trainingTablesResult = await db.execute(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%training%' OR table_name LIKE '%class%' OR table_name LIKE '%coach%')
      ORDER BY table_name, ordinal_position;
    `);
    
    console.log('\n🏢 Training center related tables:');
    if (trainingTablesResult.rows.length === 0) {
      console.log('  No training center tables found');
    } else {
      trainingTablesResult.rows.forEach((row: any) => {
        console.log(`  ${row.table_name}.${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database schema:', error);
    throw error;
  }
}

// Run the check
checkDatabaseSchema()
  .then(() => {
    console.log('✅ Database schema check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database schema check failed:', error);
    process.exit(1);
  });