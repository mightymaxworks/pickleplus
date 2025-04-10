/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Promotional System Migration
 * 
 * This script creates the necessary database tables for the golden ticket system.
 */

import { sql } from 'drizzle-orm';
import { client } from '../server/db';
import {
  ticketStatusEnum,
  claimStatusEnum,
  sponsors,
  goldenTickets,
  goldenTicketClaims
} from '../shared/golden-ticket.schema';

/**
 * Main migration function
 */
export async function migrateGoldenTicketTables(): Promise<void> {
  console.log('Starting Golden Ticket tables migration...');

  // Check if we need to create the enums
  const ticketStatusEnumExists = await checkEnumExists('ticket_status');
  const claimStatusEnumExists = await checkEnumExists('claim_status');

  if (!ticketStatusEnumExists) {
    console.log('Creating ticket_status enum type...');
    await client.execute(sql`
      CREATE TYPE ticket_status AS ENUM (
        'draft', 'active', 'paused', 'completed', 'cancelled'
      )
    `);
  }

  if (!claimStatusEnumExists) {
    console.log('Creating claim_status enum type...');
    await client.execute(sql`
      CREATE TYPE claim_status AS ENUM (
        'pending', 'approved', 'fulfilled', 'rejected', 'expired'
      )
    `);
  }

  // Create tables in order of dependencies
  const sponsorsTableExists = await checkTableExists('sponsors');
  const goldenTicketsTableExists = await checkTableExists('golden_tickets');
  const goldenTicketClaimsTableExists = await checkTableExists('golden_ticket_claims');

  if (!sponsorsTableExists) {
    await createSponsorsTable();
  }

  if (!goldenTicketsTableExists) {
    await createGoldenTicketsTable();
  }

  if (!goldenTicketClaimsTableExists) {
    await createGoldenTicketClaimsTable();
  }

  console.log('Golden Ticket tables migration completed successfully!');
}

/**
 * Helper to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await client.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      )
    `);
    
    return result[0]?.exists === true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Helper to check if an enum type exists
 */
async function checkEnumExists(enumName: string): Promise<boolean> {
  try {
    const result = await client.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = ${enumName}
      )
    `);
    
    return result[0]?.exists === true;
  } catch (error) {
    console.error(`Error checking if enum ${enumName} exists:`, error);
    return false;
  }
}

/**
 * Create sponsors table
 */
async function createSponsorsTable(): Promise<void> {
  console.log('Creating sponsors table...');
  await client.execute(sql`
    CREATE TABLE sponsors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      website TEXT,
      contact_name TEXT,
      contact_email TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Sponsors table created successfully!');
}

/**
 * Create golden tickets table
 */
async function createGoldenTicketsTable(): Promise<void> {
  console.log('Creating golden_tickets table...');
  await client.execute(sql`
    CREATE TABLE golden_tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      sponsor_id INTEGER REFERENCES sponsors(id),
      appearance_rate INTEGER NOT NULL DEFAULT 5,
      max_appearances INTEGER NOT NULL DEFAULT 100,
      current_appearances INTEGER NOT NULL DEFAULT 0,
      max_claims INTEGER NOT NULL DEFAULT 10,
      current_claims INTEGER NOT NULL DEFAULT 0,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      reward_description TEXT NOT NULL,
      reward_type TEXT DEFAULT 'physical',
      discount_code TEXT,
      discount_value TEXT,
      pages_to_appear_on TEXT[],
      status ticket_status NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Golden tickets table created successfully!');
}

/**
 * Create golden ticket claims table
 */
async function createGoldenTicketClaimsTable(): Promise<void> {
  console.log('Creating golden_ticket_claims table...');
  await client.execute(sql`
    CREATE TABLE golden_ticket_claims (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES golden_tickets(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      status claim_status NOT NULL DEFAULT 'pending',
      fulfillment_details TEXT,
      shipping_address TEXT,
      shipping_tracking_code TEXT,
      admin_notes TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Golden ticket claims table created successfully!');
}

/**
 * Run migration if this script is executed directly
 */
if (process.argv[1] === __filename) {
  migrateGoldenTicketTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}