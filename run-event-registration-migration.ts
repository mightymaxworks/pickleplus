/**
 * PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
 * Migration script to create EventRegistration table
 * 
 * Run with: npx tsx run-event-registration-migration.ts
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

async function migrateEventRegistrationSystem() {
  console.log('Starting Event Registration system database migration...');

  try {
    // Check if table already exists
    const tableExists = await checkTableExists('event_registrations');
    
    if (!tableExists) {
      // Create the event_registrations table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS event_registrations (
          id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL REFERENCES events(id),
          user_id INTEGER NOT NULL REFERENCES users(id),
          registration_time TIMESTAMP NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'confirmed',
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Create index for efficient queries
      await db.execute(sql`
        CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id)
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id)
      `);
      
      // Create unique constraint to prevent duplicate registrations
      await db.execute(sql`
        CREATE UNIQUE INDEX idx_unique_event_registration ON event_registrations(event_id, user_id)
      `);
      
      console.log('Event Registration table created successfully');
    } else {
      console.log('Event Registration table already exists. No changes made.');
    }
    
    console.log('Event Registration system migration completed successfully.');
  } catch (error) {
    console.error('Error during Event Registration system migration:', error);
    process.exit(1);
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    )
  `);
  
  return result[0]?.exists || false;
}

// Execute the migration
migrateEventRegistrationSystem()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });