/**
 * PKL-278651-CONN-0005-DEFEVT
 * Default Events Migration Runner
 * 
 * This script creates the necessary database structure for default events
 * and adds two default events that all users will automatically see:
 * 1. "Welcome to Pickle+ Orientation" - Getting started with the platform
 * 2. "Pickle+ Feature Showcase" - Monthly feature demos and updates
 * 
 * Run with: npx tsx run-default-events-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import "dotenv/config";
import { getDatabase } from "./server/database";

// If you're running this directly, you might need to call the server/database.ts file instead
// Uncomment the line below if you encounter import errors
// import { getDatabase } from "./server/database.ts";

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `, [tableName]);
  
  return result.rows[0].exists;
}

/**
 * Helper function to check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      AND column_name = $2
    )
  `, [tableName, columnName]);
  
  return result.rows[0].exists;
}

/**
 * Create event_registrations table if it doesn't exist
 */
async function createEventRegistrationsTable(): Promise<void> {
  const db = getDatabase();
  
  try {
    const tableExists = await checkTableExists('event_registrations');
    
    if (!tableExists) {
      console.log("Creating event_registrations table...");
      
      await db.query(`
        CREATE TABLE event_registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          event_id INTEGER NOT NULL,
          registration_date TIMESTAMP NOT NULL DEFAULT NOW(),
          status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
          notes TEXT,
          is_auto_registered BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, event_id)
        );
        
        CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
        CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
      `);
      
      console.log("Successfully created event_registrations table");
    } else {
      console.log("event_registrations table already exists");
    }
  } catch (error) {
    console.error("Error creating event_registrations table:", error);
    throw error;
  }
}

/**
 * Add is_default and hide_participant_count columns to events table if they don't exist
 */
async function addColumnsToEventsTable(): Promise<void> {
  const db = getDatabase();
  
  try {
    // Check if is_default column exists
    const isDefaultColumnExists = await checkColumnExists('events', 'is_default');
    
    if (!isDefaultColumnExists) {
      console.log("Adding is_default column to events table...");
      await db.query(`
        ALTER TABLE events 
        ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;
        
        CREATE INDEX idx_events_is_default ON events(is_default);
      `);
      console.log("Successfully added is_default column to events table");
    } else {
      console.log("is_default column already exists in events table");
    }
    
    // Check if hide_participant_count column exists
    const hideParticipantCountColumnExists = await checkColumnExists('events', 'hide_participant_count');
    
    if (!hideParticipantCountColumnExists) {
      console.log("Adding hide_participant_count column to events table...");
      await db.query(`
        ALTER TABLE events 
        ADD COLUMN hide_participant_count BOOLEAN NOT NULL DEFAULT false;
      `);
      console.log("Successfully added hide_participant_count column to events table");
    } else {
      console.log("hide_participant_count column already exists in events table");
    }
  } catch (error) {
    console.error("Error adding columns to events table:", error);
    throw error;
  }
}

/**
 * Create default events if they don't exist
 */
async function createDefaultEvents(): Promise<void> {
  const db = getDatabase();
  
  try {
    // Check if Welcome Orientation event exists
    const orientationResult = await db.query(`
      SELECT id FROM events 
      WHERE name = 'Welcome to Pickle+ Orientation' AND is_default = true
    `);
    
    if (orientationResult.rowCount === 0) {
      console.log("Creating Welcome Orientation default event...");
      
      await db.query(`
        INSERT INTO events (
          name, 
          description, 
          event_type, 
          location, 
          start_date_time, 
          end_date_time, 
          organizer_id, 
          max_attendees, 
          requires_check_in,
          is_default,
          hide_participant_count,
          status
        ) VALUES (
          'Welcome to Pickle+ Orientation',
          'Get started with Pickle+ in this interactive orientation session. Learn about all platform features, community guidelines, and how to make the most of your membership. This event automatically appears in your calendar as a new member benefit.',
          'onboarding',
          'Virtual',
          CURRENT_TIMESTAMP + INTERVAL '7 days',
          CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '1 hour',
          1, -- Admin user ID
          NULL, -- Unlimited attendees
          false,
          true, -- This is a default event
          true, -- Hide participant count
          'upcoming'
        )
      `);
      
      console.log("Successfully created Welcome Orientation default event");
    } else {
      console.log("Welcome Orientation default event already exists");
    }
    
    // Check if Feature Showcase event exists
    const showcaseResult = await db.query(`
      SELECT id FROM events 
      WHERE name = 'Pickle+ Feature Showcase' AND is_default = true
    `);
    
    if (showcaseResult.rowCount === 0) {
      console.log("Creating Feature Showcase default event...");
      
      await db.query(`
        INSERT INTO events (
          name, 
          description, 
          event_type, 
          location, 
          start_date_time, 
          end_date_time, 
          organizer_id, 
          max_attendees, 
          requires_check_in,
          is_default,
          hide_participant_count,
          status
        ) VALUES (
          'Pickle+ Feature Showcase',
          'Join us for our monthly feature showcase where we highlight new and upcoming platform features, community success stories, and provide exclusive beta access to upcoming functionality. As a valued Pickle+ member, you automatically receive access to these monthly sessions.',
          'special',
          'Virtual',
          date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' + INTERVAL '15 days',
          date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' + INTERVAL '15 days' + INTERVAL '1 hour',
          1, -- Admin user ID
          NULL, -- Unlimited attendees
          false,
          true, -- This is a default event
          true, -- Hide participant count
          'upcoming'
        )
      `);
      
      console.log("Successfully created Feature Showcase default event");
    } else {
      console.log("Feature Showcase default event already exists");
    }
  } catch (error) {
    console.error("Error creating default events:", error);
    throw error;
  }
}

/**
 * Update existing events data if needed
 */
async function updateExistingEvents(): Promise<void> {
  const db = getDatabase();
  
  try {
    // Make sure existing default events have hide_participant_count set to true
    await db.query(`
      UPDATE events
      SET hide_participant_count = true
      WHERE is_default = true AND hide_participant_count = false
    `);
    
    // Update dates for default events if they're in the past
    await db.query(`
      UPDATE events
      SET 
        start_date_time = CASE 
          WHEN name = 'Welcome to Pickle+ Orientation' THEN CURRENT_TIMESTAMP + INTERVAL '7 days'
          WHEN name = 'Pickle+ Feature Showcase' THEN date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' + INTERVAL '15 days'
          ELSE start_date_time
        END,
        end_date_time = CASE 
          WHEN name = 'Welcome to Pickle+ Orientation' THEN CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '1 hour'
          WHEN name = 'Pickle+ Feature Showcase' THEN date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' + INTERVAL '15 days' + INTERVAL '1 hour'
          ELSE end_date_time
        END
      WHERE is_default = true AND start_date_time < CURRENT_TIMESTAMP
    `);
    
    console.log("Updated existing default events");
  } catch (error) {
    console.error("Error updating existing events:", error);
    throw error;
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  console.log("Starting Default Events Migration...");
  
  try {
    // Step 1: Create event_registrations table if needed
    await createEventRegistrationsTable();
    
    // Step 2: Add necessary columns to events table
    await addColumnsToEventsTable();
    
    // Step 3: Create default events
    await createDefaultEvents();
    
    // Step 4: Update existing events if needed
    await updateExistingEvents();
    
    console.log("Default Events Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();