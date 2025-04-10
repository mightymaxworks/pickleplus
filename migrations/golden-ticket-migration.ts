/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Promotional System Migration
 * 
 * This script creates the necessary database tables for the golden ticket system.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { goldenTickets, goldenTicketClaims, sponsors, goldenTicketStatusEnum, goldenTicketClaimStatusEnum } from '../shared/golden-ticket.schema';

/**
 * Main migration function
 */
export async function migrateGoldenTicketTables(): Promise<void> {
  console.log('Starting Golden Ticket system database migration...');

  try {
    // Check if enums exist and create them if not
    const statusEnumExists = await checkEnumExists('golden_ticket_status');
    const claimStatusEnumExists = await checkEnumExists('golden_ticket_claim_status');

    if (!statusEnumExists) {
      console.log('Creating golden_ticket_status enum...');
      await db.execute(sql`
        CREATE TYPE golden_ticket_status AS ENUM (
          'draft', 'active', 'paused', 'completed', 'cancelled'
        );
      `);
    }

    if (!claimStatusEnumExists) {
      console.log('Creating golden_ticket_claim_status enum...');
      await db.execute(sql`
        CREATE TYPE golden_ticket_claim_status AS ENUM (
          'claimed', 'entered_drawing', 'selected', 'redeemed', 'expired'
        );
      `);
    }

    // Create tables in correct order
    const sponsorsExists = await checkTableExists('sponsors');
    const ticketsExists = await checkTableExists('golden_tickets');
    const claimsExists = await checkTableExists('golden_ticket_claims');

    if (!sponsorsExists) {
      await createSponsorsTable();
    } else {
      console.log('Sponsors table already exists.');
    }

    if (!ticketsExists) {
      await createGoldenTicketsTable();
    } else {
      console.log('Golden tickets table already exists.');
    }

    if (!claimsExists) {
      await createGoldenTicketClaimsTable();
    } else {
      console.log('Golden ticket claims table already exists.');
    }

    console.log('Golden Ticket system migration completed successfully.');
  } catch (error) {
    console.error('Error during Golden Ticket system migration:', error);
    throw error;
  }
}

/**
 * Helper to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  
  return result.rows[0].exists;
}

/**
 * Helper to check if an enum type exists
 */
async function checkEnumExists(enumName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM pg_type 
      WHERE typname = ${enumName}
    );
  `);
  
  return result.rows[0].exists;
}

/**
 * Create sponsors table
 */
async function createSponsorsTable(): Promise<void> {
  console.log('Creating sponsors table...');
  await db.execute(sql`
    CREATE TABLE sponsors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      website_url TEXT,
      contact_email TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Sponsors table created successfully.');
}

/**
 * Create golden tickets table
 */
async function createGoldenTicketsTable(): Promise<void> {
  console.log('Creating golden_tickets table...');
  await db.execute(sql`
    CREATE TABLE golden_tickets (
      id SERIAL PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      sponsor_id INTEGER REFERENCES sponsors(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      prize_description TEXT NOT NULL,
      discount_code TEXT,
      discount_value TEXT,
      status golden_ticket_status NOT NULL DEFAULT 'draft',
      appearance_rate INTEGER NOT NULL DEFAULT 5,
      max_claims INTEGER NOT NULL,
      current_claims INTEGER NOT NULL DEFAULT 0,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Golden tickets table created successfully.');
}

/**
 * Create golden ticket claims table
 */
async function createGoldenTicketClaimsTable(): Promise<void> {
  console.log('Creating golden_ticket_claims table...');
  await db.execute(sql`
    CREATE TABLE golden_ticket_claims (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES golden_tickets(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      status golden_ticket_claim_status NOT NULL DEFAULT 'claimed',
      claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      redemption_code TEXT,
      redemption_date TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Golden ticket claims table created successfully.');
}

/**
 * Run migration if this script is executed directly
 */
if (require.main === module) {
  migrateGoldenTicketTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}