/**
 * PKL-278651-ADMIN-0013-SEC
 * Audit Logging Migration
 * 
 * This script creates the audit_logs table in the database.
 * Run with: npx tsx migrations/run-audit-log-migration.ts
 */

import { db } from '../server/db';
import { auditLogs } from '../shared/schema/audit';
import { sql } from 'drizzle-orm';

async function migrateAuditLogging() {
  console.log('Running audit log migration...');
  
  try {
    // Check if the table already exists
    const tableExists = await checkTableExists('audit_logs');
    
    if (tableExists) {
      console.log('audit_logs table already exists, skipping creation');
    } else {
      // Create the audit_logs table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          resource_id TEXT,
          ip_address TEXT NOT NULL,
          user_agent TEXT,
          status_code INTEGER,
          additional_data JSONB
        );
      `);
      
      console.log('Created audit_logs table successfully');
    }
    
    console.log('Audit log migration completed successfully');
  } catch (error) {
    console.error('Error during audit log migration:', error);
    process.exit(1);
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `);
    
    return result && result[0] && result[0].exists === true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Run the migration
migrateAuditLogging()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });