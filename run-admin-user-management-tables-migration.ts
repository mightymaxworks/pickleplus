/**
 * PKL-278651-ADMIN-0015-USER-DB
 * Admin User Management Tables Migration
 * 
 * This script creates the database tables needed for the enhanced user management features.
 * Run with: npx tsx run-admin-user-management-tables-migration.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import { 
  adminUserNotes, 
  adminUserActions, 
  userLoginHistory, 
  userAccountStatus, 
  userPermissionOverrides 
} from './shared/schema/admin/user-management';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('Starting Admin User Management Tables migration...');
  
  // Create the database connection
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);
  
  // Check if tables already exist
  const tablesExist = await checkTablesExist(db);
  
  if (tablesExist) {
    console.log('Admin User Management tables already exist. No changes made.');
    await client.end();
    return;
  }
  
  try {
    // Create admin user notes table
    console.log('Creating admin_user_notes table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_user_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        author_id INTEGER NOT NULL REFERENCES users(id),
        note TEXT NOT NULL,
        visibility VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create admin user actions table
    console.log('Creating admin_user_actions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_user_actions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `);
    
    // Create user login history table
    console.log('Creating user_login_history table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_login_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        location VARCHAR(100),
        device VARCHAR(100)
      )
    `);
    
    // Create user account status table
    console.log('Creating user_account_status table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_account_status (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        reason TEXT,
        changed_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);
    
    // Create user permission overrides table
    console.log('Creating user_permission_overrides table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_permission_overrides (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        permission VARCHAR(100) NOT NULL,
        granted BOOLEAN NOT NULL,
        reason TEXT,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);
    
    console.log('Admin User Management tables created successfully!');
  } catch (error) {
    console.error('Error creating Admin User Management tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Check if Admin User Management tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    // Check if admin_user_notes table exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_user_notes'
      )
    `);
    
    return result[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

main().catch(console.error);