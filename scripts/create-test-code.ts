import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { redemptionCodes } from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createTestCode() {
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Create TEST123 code with 500 XP - only using the fields that actually exist in the database
    const [code] = await db.insert(redemptionCodes)
      .values({
        code: "TEST123",
        description: "Test Code for API Testing",
        xpReward: 500,
        isActive: true,
        isFoundingMemberCode: false,
        maxRedemptions: 100,
        currentRedemptions: 0,
        expiresAt: new Date(2026, 11, 31) // Expires Dec 31, 2026
      })
      .returning();
    
    console.log("✅ TEST123 redemption code created successfully!");
    console.log(code);
    
  } catch (error) {
    console.error("Error creating redemption code:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the function
createTestCode();