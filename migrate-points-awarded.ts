/**
 * PKL-278651-MATCH-0003-DBCONST: Migration Script Executor
 * This script runs the database migration to fix the points_awarded column in the matches table.
 * Run with: npx tsx migrate-points-awarded.ts
 */

import { migratePointsAwardedDefault } from './server/modules/match/migrateMatchSchema';

async function main() {
  try {
    console.log('Starting migration for points_awarded default constraint...');
    await migratePointsAwardedDefault();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();