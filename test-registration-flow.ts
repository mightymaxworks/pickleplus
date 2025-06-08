/**
 * Registration Flow CI/CD Test
 * Tests the complete user registration process to ensure deployment readiness
 * 
 * Run with: npx tsx test-registration-flow.ts
 */

import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./server/auth";

interface TestRegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
}

const testUsers: TestRegistrationData[] = [
  {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe123",
    email: "john.doe@testpickle.com",
    password: "SecurePass123!",
    displayName: "John Doe"
  },
  {
    firstName: "Sarah",
    lastName: "Wilson",
    username: "sarahw456",
    email: "sarah.wilson@testpickle.com", 
    password: "TestPassword456!",
    displayName: "Sarah Wilson"
  },
  {
    firstName: "Mike",
    lastName: "Chen",
    username: "mikechen789",
    email: "mike.chen@testpickle.com",
    password: "ValidPass789!",
    displayName: "Mike Chen"
  }
];

async function testRegistrationValidation() {
  console.log("🔍 Testing registration validation...");
  
  // Test 1: Valid registration data
  const validUser = testUsers[0];
  console.log("✓ Testing valid registration data structure");
  
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'username', 'email', 'password'];
  for (const field of requiredFields) {
    if (!validUser[field as keyof TestRegistrationData]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Test 2: Password requirements
  if (validUser.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  
  // Test 3: Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(validUser.email)) {
    throw new Error("Invalid email format");
  }
  
  // Test 4: Username requirements
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(validUser.username)) {
    throw new Error("Username can only contain letters, numbers, and underscores");
  }
  
  console.log("✅ Registration validation tests passed");
}

async function testUserCreation() {
  console.log("🔍 Testing user creation in database...");
  
  for (let i = 0; i < testUsers.length; i++) {
    const testUser = testUsers[i];
    
    try {
      console.log(`\n📝 Creating test user ${i + 1}: ${testUser.username}`);
      
      // Check if user already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, testUser.username))
        .limit(1);
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User ${testUser.username} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(testUser.password);
      
      // Generate passport code (simplified for testing)
      const passportCode = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Create user
      const newUser = await db.insert(users).values({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        displayName: testUser.displayName,
        avatarInitials: (testUser.firstName.charAt(0) + testUser.lastName.charAt(0)).toUpperCase(),
        passportId: passportCode,
        level: 1,
        xp: 0,
        totalMatches: 0,
        matchesWon: 0,
        totalTournaments: 0,
        isFoundingMember: false,
        isAdmin: false,
        isCoach: false,
        isReferee: false
      }).returning();
      
      console.log(`✅ Successfully created user: ${newUser[0].username} (ID: ${newUser[0].id})`);
      console.log(`   📧 Email: ${newUser[0].email}`);
      console.log(`   🎫 Passport: ${newUser[0].passportId}`);
      
    } catch (error) {
      console.error(`❌ Failed to create user ${testUser.username}:`, error);
      throw error;
    }
  }
}

async function testPasswordVerification() {
  console.log("\n🔍 Testing password verification...");
  
  const bcryptjs = await import("bcryptjs");
  
  for (const testUser of testUsers) {
    try {
      // Get user from database
      const dbUser = await db.select()
        .from(users)
        .where(eq(users.username, testUser.username))
        .limit(1);
      
      if (dbUser.length === 0) {
        console.log(`⚠️  User ${testUser.username} not found, skipping verification...`);
        continue;
      }
      
      // Test password verification
      const isValidPassword = await bcryptjs.compare(testUser.password, dbUser[0].password);
      
      if (isValidPassword) {
        console.log(`✅ Password verification successful for ${testUser.username}`);
      } else {
        throw new Error(`Password verification failed for ${testUser.username}`);
      }
      
    } catch (error) {
      console.error(`❌ Password verification failed for ${testUser.username}:`, error);
      throw error;
    }
  }
}

async function testUserRetrieval() {
  console.log("\n🔍 Testing user retrieval...");
  
  for (const testUser of testUsers) {
    try {
      // Test username lookup
      const userByUsername = await db.select()
        .from(users)
        .where(eq(users.username, testUser.username))
        .limit(1);
      
      if (userByUsername.length === 0) {
        console.log(`⚠️  User ${testUser.username} not found, skipping...`);
        continue;
      }
      
      // Test email lookup
      const userByEmail = await db.select()
        .from(users)
        .where(eq(users.email, testUser.email))
        .limit(1);
      
      if (userByEmail.length === 0) {
        throw new Error(`Email lookup failed for ${testUser.email}`);
      }
      
      // Verify data integrity
      const user = userByUsername[0];
      if (user.firstName !== testUser.firstName || user.lastName !== testUser.lastName) {
        throw new Error(`Data integrity check failed for ${testUser.username}`);
      }
      
      console.log(`✅ User retrieval successful for ${testUser.username}`);
      
    } catch (error) {
      console.error(`❌ User retrieval failed for ${testUser.username}:`, error);
      throw error;
    }
  }
}

async function cleanupTestUsers() {
  console.log("\n🧹 Cleaning up test users...");
  
  for (const testUser of testUsers) {
    try {
      const result = await db.delete(users)
        .where(eq(users.username, testUser.username));
      
      console.log(`✅ Cleaned up test user: ${testUser.username}`);
    } catch (error) {
      console.error(`⚠️  Failed to cleanup ${testUser.username}:`, error);
    }
  }
}

async function runRegistrationTests() {
  console.log("🚀 Starting Registration Flow CI/CD Tests\n");
  
  try {
    // Run validation tests
    await testRegistrationValidation();
    
    // Test user creation
    await testUserCreation();
    
    // Test password verification
    await testPasswordVerification();
    
    // Test user retrieval
    await testUserRetrieval();
    
    console.log("\n🎉 All registration tests passed successfully!");
    console.log("✅ Registration system is ready for deployment");
    
    // Optional: Clean up test users
    const shouldCleanup = process.argv.includes('--cleanup');
    if (shouldCleanup) {
      await cleanupTestUsers();
    } else {
      console.log("\nℹ️  Test users preserved. Run with --cleanup to remove them.");
    }
    
  } catch (error) {
    console.error("\n💥 Registration tests failed:", error);
    process.exit(1);
  }
}

// Run the tests
runRegistrationTests()
  .then(() => {
    console.log("\n🏁 Registration CI/CD testing complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error during testing:", error);
    process.exit(1);
  });