/**
 * PKL-278651-ADMIN-0013-SEC
 * Audit Log Database Migration
 * 
 * This script creates the audit_logs table in the database.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { auditLogs } from '../shared/schema/audit';

/**
 * Main migration function
 */
export async function migrateAuditLogTable(): Promise<void> {
  console.log('[MIGRATION] Starting audit log table migration...');

  // Check if table exists
  const tableExists = await checkTableExists('audit_logs');
  
  if (tableExists) {
    console.log('[MIGRATION] audit_logs table already exists, skipping creation.');
    return;
  }

  try {
    // Create the audit_logs table using the schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "user_id" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "resource" TEXT NOT NULL,
        "resource_id" TEXT,
        "ip_address" TEXT NOT NULL,
        "user_agent" TEXT,
        "status_code" INTEGER,
        "additional_data" JSONB
      );
    `);

    // Create indexes for efficient querying
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs" ("timestamp");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("user_id");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_resource" ON "audit_logs" ("resource");
    `);

    console.log('[MIGRATION] audit_logs table created successfully.');
  } catch (error) {
    console.error('[MIGRATION] Error creating audit_logs table:', error);
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
    ) AS "exists";
  `);
  
  // Access the first row and check the exists property
  const records = result as unknown as { rows: { exists: boolean }[] };
  return records.rows?.[0]?.exists || false;
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateAuditLogTable()
    .then(() => {
      console.log('[MIGRATION] Audit log migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[MIGRATION] Audit log migration failed:', error);
      process.exit(1);
    });
}