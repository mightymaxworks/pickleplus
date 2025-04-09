/**
 * PKL-278651-MATCH-0003-DBCONST: Database Schema Migration Service
 * This service handles migrations for the match module database schema.
 * 
 * Following Framework 4.0 Database Schema Management Guidelines:
 * - Database-level constraints are favored over application-level validations
 * - Migration scripts include both "up" and "down" paths
 * - Data integrity is maintained through constraints, defaults, and transactions
 * - Synchronization is maintained between application code and database schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../db';
import { matches } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Handle ES modules context for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Runs the points_awarded and xp_awarded default constraint migration
 */
export async function migrateMatchDefaultConstraints(): Promise<void> {
  try {
    console.log('[Match Module] Running match default constraint migrations');
    
    // Read the SQL file
    const migrationPath = path.join(__dirname, 'migrations', '20250409_points_awarded_default.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into statements (simple approach - assumes each statement ends with semicolon)
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        await db.execute(sql.raw(statement + ';'));
        console.log('[Match Module] Executed SQL:', statement);
      }
    }
    
    console.log('[Match Module] Migration completed successfully');
    
    // Verify the migration for both columns
    await verifyMatchDefaultConstraints();
  } catch (error) {
    console.error('[Match Module] Migration failed:', error);
    throw error;
  }
}

/**
 * For backward compatibility
 * @deprecated Use migrateMatchDefaultConstraints instead
 */
export async function migratePointsAwardedDefault(): Promise<void> {
  return migrateMatchDefaultConstraints();
}

/**
 * Verifies that the points_awarded and xp_awarded columns have the correct default constraints
 */
async function verifyMatchDefaultConstraints(): Promise<void> {
  try {
    // Query the information schema using direct SQL
    const query = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'matches' AND column_name IN ('points_awarded', 'xp_awarded');
    `;
    
    // Use the postgres client directly for this raw query
    const { client } = await import('../../db');
    // Using any here because the client's query method is not properly typed in the LSP
    const result = await (client as any).query(query);
    
    if (result.rows && result.rows.length > 0) {
      // Log the verification result
      console.log('[Match Module] Verification results:', result.rows);
      
      // Check each column
      result.rows.forEach(function(columnInfo: { column_name: string, column_default: string }) {
        if (columnInfo.column_default !== '0') {
          console.warn(`[Match Module] Default constraint for ${columnInfo.column_name} is not set to 0`);
        } else {
          console.log(`[Match Module] Default constraint for ${columnInfo.column_name} verified correctly`);
        }
      });
    } else {
      console.warn('[Match Module] No column information found');
    }
  } catch (error) {
    console.error('[Match Module] Verification failed:', error);
  }
}

/**
 * Rolls back the match default constraint migrations
 */
export async function rollbackMatchDefaultConstraints(): Promise<void> {
  try {
    console.log('[Match Module] Rolling back match default constraint migrations');
    
    // Execute the rollback statements
    await db.execute(sql`
      ALTER TABLE matches ALTER COLUMN points_awarded DROP DEFAULT;
      ALTER TABLE matches ALTER COLUMN xp_awarded DROP DEFAULT;
    `);
    
    console.log('[Match Module] Rollback completed successfully');
  } catch (error) {
    console.error('[Match Module] Rollback failed:', error);
    throw error;
  }
}

/**
 * For backward compatibility
 * @deprecated Use rollbackMatchDefaultConstraints instead
 */
export async function rollbackPointsAwardedDefault(): Promise<void> {
  return rollbackMatchDefaultConstraints();
}