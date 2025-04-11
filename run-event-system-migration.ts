/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Migration script to create Event and EventCheckIn tables
 */

import { db } from "./server/db";
import { events, eventCheckIns } from "./shared/schema/events";
import { sql } from "drizzle-orm";

async function migrateEventCheckInSystem() {
  console.log("Starting Event Check-in System migration...");

  try {
    // Check if events table exists
    const eventsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'events'
      );
    `);

    if (!eventsExists[0].exists) {
      console.log("Creating 'events' table...");
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(255) NOT NULL DEFAULT 'tournament',
          name VARCHAR(255) NOT NULL,
          description TEXT,
          location TEXT,
          start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
          organizer_id INTEGER,
          max_attendees INTEGER,
          current_attendees INTEGER DEFAULT 0,
          registration_fee DECIMAL(10, 2),
          registration_start_date TIMESTAMP WITH TIME ZONE,
          registration_end_date TIMESTAMP WITH TIME ZONE,
          image_url TEXT,
          website_url TEXT,
          is_private BOOLEAN DEFAULT false,
          requires_check_in BOOLEAN DEFAULT true,
          check_in_code VARCHAR(20),
          status VARCHAR(50) DEFAULT 'upcoming',
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          venue_details JSON,
          prize_details JSON,
          sponsorship_details JSON,
          rules_url TEXT,
          cancellation_policy TEXT,
          additional_info JSON,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("'events' table created successfully.");
    } else {
      console.log("'events' table already exists.");
    }

    // Check if event_check_ins table exists
    const checkInsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'event_check_ins'
      );
    `);

    if (!checkInsExists[0].exists) {
      console.log("Creating 'event_check_ins' table...");
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS event_check_ins (
          id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          check_in_method VARCHAR(50) NOT NULL DEFAULT 'qr',
          verified_by_id INTEGER,
          device_info TEXT,
          check_in_location TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, user_id),
          CONSTRAINT fk_event
            FOREIGN KEY(event_id)
            REFERENCES events(id)
            ON DELETE CASCADE,
          CONSTRAINT fk_user
            FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );
      `);

      console.log("'event_check_ins' table created successfully.");
    } else {
      console.log("'event_check_ins' table already exists.");
    }

    console.log("Event Check-in System migration completed successfully.");
  } catch (error) {
    console.error("Error during Event Check-in System migration:", error);
    throw error;
  }
}

// Execute the migration
migrateEventCheckInSystem()
  .then(() => {
    console.log("Event Check-in System migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error in Event Check-in System migration script:", error);
    process.exit(1);
  });