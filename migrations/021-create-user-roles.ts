/**
 * PKL-278651-AUTH-0016-PROLES - Persistent Role Management Migration
 * 
 * Migration to create the user roles database tables and seed initial role data.
 * Run with: npx tsx migrations/021-create-user-roles.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import ws from 'ws';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { roles, userRoles } from '../shared/schema/user-roles';
import { eq } from 'drizzle-orm';
import { UserRole } from '../client/src/lib/roles';

// Configure neon to use websockets
neonConfig.webSocketConstructor = ws;

// Database connection setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function createUserRolesTables() {
  console.log('Starting user roles tables creation...');
  
  try {
    // Create the tables using a raw SQL query to ensure proper order and constraints
    await pool.query(`
      -- Create roles table
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create user_roles junction table
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        UNIQUE(user_id, role_id)
      );

      -- Create permissions table
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create role_permissions junction table
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE(role_id, permission_id)
      );

      -- Create role_audit_logs table for tracking changes
      CREATE TABLE IF NOT EXISTS role_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        role_id INTEGER NOT NULL REFERENCES roles(id),
        action VARCHAR(50) NOT NULL,
        performed_by INTEGER REFERENCES users(id),
        performed_at TIMESTAMP DEFAULT NOW(),
        notes TEXT
      );
    `);

    console.log('Tables created successfully.');
    
    // Step 2: Seed initial roles
    await seedInitialRoles();
    
    // Step 3: Map existing users to roles based on current logic
    await mapExistingUsers();
    
    console.log('User roles migration completed successfully!');
  } catch (error) {
    console.error('Error creating user roles tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function seedInitialRoles() {
  console.log('Seeding initial roles...');
  
  const existingRoles = await db.select().from(roles);
  if (existingRoles.length > 0) {
    console.log(`Found ${existingRoles.length} existing roles. Skipping seeding.`);
    return;
  }
  
  // Seed roles table with our current roles
  const roleData = [
    {
      name: UserRole.PLAYER,
      label: 'Player',
      description: 'Regular player with standard permissions',
      isDefault: true,
      priority: 0
    },
    {
      name: UserRole.COACH,
      label: 'Coach',
      description: 'Coach with ability to manage players and sessions',
      isDefault: false,
      priority: 10
    },
    {
      name: UserRole.REFEREE,
      label: 'Referee',
      description: 'Referee with ability to manage matches and tournaments',
      isDefault: false,
      priority: 10
    },
    {
      name: UserRole.ADMIN,
      label: 'Administrator',
      description: 'System administrator with full access',
      isDefault: false,
      priority: 100
    }
  ];
  
  for (const role of roleData) {
    await db.insert(roles).values(role);
  }
  
  console.log(`Seeded ${roleData.length} roles.`);
}

async function mapExistingUsers() {
  console.log('Mapping existing users to roles...');
  
  // Get all users from the database directly with a simple query
  const { rows: users } = await pool.query('SELECT * FROM users');
  console.log(`Found ${users.length} users to process.`);
  
  // Get all roles for reference
  const allRoles = await db.select().from(roles);
  const roleMap = Object.fromEntries(allRoles.map(role => [role.name, role.id]));
  
  let assignedCount = 0;
  
  // For each user, determine the appropriate role and create user_role entries
  for (const user of users) {
    let roleName = UserRole.PLAYER; // Default role
    
    // Use the same logic we had in user-types.ts for role detection
    if (user.username === 'mightymax' || user.username === 'admin' || user.is_admin) {
      roleName = UserRole.ADMIN;
    } else if (user.username?.toLowerCase().includes('coach')) {
      roleName = UserRole.COACH;
    } else if (user.username?.toLowerCase().includes('referee') || user.username?.toLowerCase().includes('ref')) {
      roleName = UserRole.REFEREE;
    }
    
    // Check if user already has a role assigned
    const existingUserRole = await db.select().from(userRoles)
      .where(eq(userRoles.userId, user.id));
    
    if (existingUserRole.length === 0) {
      try {
        // Assign the role
        await db.insert(userRoles).values({
          userId: user.id,
          roleId: roleMap[roleName],
          assignedAt: new Date(),
          isActive: true
        });
        assignedCount++;
      } catch (err) {
        console.error(`Error assigning role to user ${user.username}:`, err);
      }
    }
  }
  
  console.log(`Assigned roles to ${assignedCount} users.`);
}

// Run the migration
createUserRolesTables()
  .then(() => {
    console.log('User roles migration successful!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });