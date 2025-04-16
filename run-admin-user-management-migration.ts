/**
 * PKL-278651-ADMIN-0015-USER
 * Admin User Management Migration Runner
 * 
 * This script runs the migration for creating the admin user management tables
 * Run with: npx tsx run-admin-user-management-migration.ts
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Starting Admin User Management migration (PKL-278651-ADMIN-0015-USER)');

  // Check if tables already exist
  const tablesExist = await checkTablesExist(db);
  
  if (tablesExist) {
    console.log('Admin User Management tables already exist, skipping migration');
    process.exit(0);
  }

  // Admin User Notes Table
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
  console.log('Created admin_user_notes table');

  // Admin User Actions Table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_user_actions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      admin_id INTEGER NOT NULL REFERENCES users(id),
      action_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created admin_user_actions table');

  // User Permission Overrides Table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_permission_overrides (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      permission_key VARCHAR(100) NOT NULL,
      allowed BOOLEAN NOT NULL,
      reason TEXT,
      added_by_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    )
  `);
  console.log('Created user_permission_overrides table');

  // User Login History Table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_login_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      success BOOLEAN NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      device_info TEXT,
      login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created user_login_history table');

  // User Account Status Table
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
  console.log('Created user_account_status table');

  // Create indexes
  await db.execute(sql`CREATE INDEX idx_admin_user_notes_user_id ON admin_user_notes(user_id)`);
  await db.execute(sql`CREATE INDEX idx_admin_user_actions_user_id ON admin_user_actions(user_id)`);
  await db.execute(sql`CREATE INDEX idx_user_permission_overrides_user_id ON user_permission_overrides(user_id)`);
  await db.execute(sql`CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id)`);
  await db.execute(sql`CREATE INDEX idx_user_account_status_user_id ON user_account_status(user_id)`);
  
  console.log('Created indexes');
  console.log('Admin User Management migration completed successfully');
}

/**
 * Check if the Admin User Management tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_user_notes'
      ) AS notes_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_user_actions'
      ) AS actions_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_permission_overrides'
      ) AS permissions_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_login_history'
      ) AS login_history_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_account_status'
      ) AS account_status_exists
    `);

    const { notes_exists, actions_exists, permissions_exists, login_history_exists, account_status_exists } = result.rows[0];
    return notes_exists && actions_exists && permissions_exists && login_history_exists && account_status_exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

// Run the migration
main().catch(err => {
  console.error('Error running migration:', err);
  process.exit(1);
});