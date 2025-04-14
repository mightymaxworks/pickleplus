/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Migration Script
 * 
 * This script runs the migration to create the bug reports table.
 * Run with: npx tsx run-bug-reports-migration.ts
 */

import { migrateBugReportsTable } from './migrations/bug-reports-migration';

// Execute the migration
async function main() {
  try {
    console.log('Starting bug reports migration...');
    await migrateBugReportsTable();
    console.log('Bug reports migration completed successfully!');
  } catch (error) {
    console.error('Error during bug reports migration:', error);
    process.exit(1);
  }
}

// Run the main function
main();