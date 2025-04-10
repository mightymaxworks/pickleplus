/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Golden Ticket File Upload Enhancement Migration Runner
 * 
 * This script runs the migration for adding file upload fields to golden ticket tables
 * Run with: npx tsx run-golden-ticket-file-upload-migration.ts
 */

import { migrateFileUploadFields } from './migrations/golden-ticket-file-upload-migration';

async function main() {
  try {
    console.log('Starting Golden Ticket file upload migration...');
    await migrateFileUploadFields();
    console.log('Golden Ticket file upload migration completed successfully');
  } catch (error) {
    console.error('Error running Golden Ticket file upload migration:', error);
    process.exit(1);
  }
}

main();