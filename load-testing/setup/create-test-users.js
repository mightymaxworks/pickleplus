/**
 * PKL-278651-PERF-0001-LOAD
 * Create Test Users For Load Testing
 * 
 * This script creates test users in the database for load testing purposes.
 * Run with: node load-testing/setup/create-test-users.js
 */

const { db } = require('../../server/db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

// Test user credentials
const testUsers = {
  standard: {
    username: "loadtest_user",
    password: "pickleballRocks2025!"
  },
  admin: {
    username: "loadtest_admin",
    password: "adminPass2025!"
  }
};

/**
 * Create a test user in the database if it doesn't already exist
 */
async function createTestUser(username, password, isAdmin = false) {
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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
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
 * Main function to create all test users
 */
async function main() {
  try {
    console.log('=== Creating Load Test Users ===');
    
    // Create standard test user
    await createTestUser(
      testUsers.standard.username, 
      testUsers.standard.password
    );
    
    // Create admin test user
    await createTestUser(
      testUsers.admin.username, 
      testUsers.admin.password,
      true
    );
    
    console.log('All test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

// Run the main function
main();