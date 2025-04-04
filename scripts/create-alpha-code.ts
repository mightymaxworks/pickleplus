// Script to create the ALPHA100 Easter egg redemption code
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { redemptionCodes } from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAlphaCode() {
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Create the ALPHA100 Easter egg code
    const [alphaCode] = await db.insert(redemptionCodes).values({
      code: "ALPHA100",
      description: "Easter Egg Alpha Reward",
      xpReward: 100,
      isActive: true,
      isFoundingMemberCode: false, // Not a founding member code
      maxRedemptions: null, // No max, but each user can only use it once
      currentRedemptions: 0,
      expiresAt: null // No expiration date
    }).returning();
    
    console.log("✅ Created ALPHA100 Easter Egg Code!");
    console.log("----------------------------------");
    console.log(`Code: ${alphaCode.code}`);
    console.log(`Description: ${alphaCode.description}`);
    console.log(`XP Reward: ${alphaCode.xpReward}`);
    console.log(`Active: ${alphaCode.isActive}`);
    console.log("----------------------------------");
    
  } catch (error) {
    console.error("Error creating ALPHA100 code:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the function
createAlphaCode();