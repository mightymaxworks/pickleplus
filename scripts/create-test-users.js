/**
 * Create test users for load testing
 * Run with: node scripts/create-test-users.js
 */

const { client } = require('../server/db');
const bcrypt = require('bcryptjs');

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
async function createTestUser(username, password, isAdmin = false) {
  console.log(`Checking if user '${username}' exists...`);
  
  // Check if user exists
  const existingUser = await client.query(
    'SELECT id FROM users WHERE username = $1 LIMIT 1',
    [username]
  );
  
  if (existingUser.rows && existingUser.rows.length > 0) {
    console.log(`User '${username}' already exists with ID: ${existingUser.rows[0].id}`);
    return existingUser.rows[0];
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Generate passport code (7-character alphanumeric)
  const passportCode = generatePassportCode();
  
  // Create user
  console.log(`Creating test user '${username}'...`);
  
  try {
    const result = await client.query(
      `INSERT INTO users (
        username, 
        email, 
        password, 
        first_name, 
        last_name, 
        display_name,
        passport_id,
        is_admin,
        profile_completion_pct,
        created_at,
        last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        username,
        `${username}@example.com`,
        hashedPassword,
        'Load',
        'Test',
        `Load Test ${isAdmin ? 'Admin' : 'User'}`,
        passportCode,
        isAdmin,
        60,
        new Date(),
        new Date()
      ]
    );
    
    if (result.rows && result.rows.length > 0) {
      console.log(`Created user '${username}' with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } else {
      console.error(`Failed to create user '${username}'`);
      return null;
    }
  } catch (error) {
    console.error(`Error creating user '${username}':`, error.message);
    if (error.detail) {
      console.error(`Detail: ${error.detail}`);
    }
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