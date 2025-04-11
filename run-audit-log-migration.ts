/**
 * PKL-278651-ADMIN-0013-SEC
 * Audit Log Migration Runner
 * 
 * This script runs the migration for creating the audit_logs table
 * Run with: npx tsx run-audit-log-migration.ts
 */

import { migrateAuditLogTable } from './migrations/audit-log-migration';

async function main() {
  try {
    console.log('Starting audit log migration...');
    await migrateAuditLogTable();
    console.log('Audit log migration completed successfully!');
  } catch (error) {
    console.error('Audit log migration failed:', error);
    process.exit(1);
  }
}

main();