/**
 * Create load test users for load testing
 * Run with: npx tsx scripts/create-load-test-users.ts
 */

import { eq } from 'drizzle-orm';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { hashPassword } from '../server/auth';

// Test user credentials
const testUsers = [
  {
    username: "loadtest_user",
    password: "pickleballRocks2025!",
    isAdmin: false
  },
  {
    username: "loadtest_admin",
    password: "adminPass2025!",
    isAdmin: true
  }
];

/**
 * Generate a random 7-character alphanumeric passport code
 */
function generatePassportCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Create a test user in the database if it doesn't already exist
 */
async function createTestUser(username: string, password: string, isAdmin = false) {
  console.log(`Checking if user '${username}' exists...`);
  
  // Check if user exists
  const existingUser = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  
  if (existingUser && existingUser.length > 0) {
    console.log(`User '${username}' already exists with ID: ${existingUser[0].id}`);
    return existingUser[0];
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Generate passport code (7-character alphanumeric)
  const passportCode = generatePassportCode();
  
  // Create user
  console.log(`Creating test user '${username}'...`);
  
  const newUser = {
    username: username,
    email: `${username}@example.com`,
    password: hashedPassword,
    firstName: 'Load',
    lastName: 'Test',
    passport_code: passportCode,
    role: isAdmin ? 'admin' : 'user',
    profileCompletionPct: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await db.insert(users).values(newUser).returning();
  
  if (result && result.length > 0) {
    console.log(`Created user '${username}' with ID: ${result[0].id}`);
    return result[0];
  } else {
    console.error(`Failed to create user '${username}'`);
    return null;
  }
}

/**
 * Main function to create all test users
 */
async function main() {
  try {
    console.log('=== Creating Load Test Users ===');
    
    for (const user of testUsers) {
      await createTestUser(user.username, user.password, user.isAdmin);
    }
    
    console.log('All test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

// Run the main function
main();