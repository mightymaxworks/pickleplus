/**
 * PKL-278651-COMM-0006-HUB - Community Hub Implementation
 * Migration Script
 * 
 * This script runs the migration to create the community tables.
 * Run with: npx tsx run-community-hub-migration.ts
 */
import postgres from 'postgres';
import dotenv from 'dotenv';
import { db } from './server/db';
import { pushSchema } from './shared/schema/community';

dotenv.config();

async function migrateCommunityHub() {
  console.log('Starting Community Hub migration...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const sql = postgres(dbUrl);

  try {
    // Check if tables already exist
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'communities'
      )`;
    
    if (result[0]?.exists) {
      console.log('Communities tables already exist, skipping migration.');
      process.exit(0);
    }
    
    console.log('Creating tables using the pushSchema from shared/schema/community...');
    await pushSchema();
    
    console.log('Community Hub migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the migration
migrateCommunityHub().catch(error => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});