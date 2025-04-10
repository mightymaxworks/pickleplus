/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Migration Runner
 * 
 * This script runs the migration for creating golden ticket tables
 * Run with: npx tsx run-golden-ticket-migration.ts
 */

import { migrateGoldenTicketTables } from './migrations/golden-ticket-migration';

async function main() {
  try {
    console.log('Starting Golden Ticket migration...');
    await migrateGoldenTicketTables();
    console.log('Golden Ticket migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Golden Ticket migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();