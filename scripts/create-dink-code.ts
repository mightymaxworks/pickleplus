import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { redemptionCodes } from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createDinkCode() {
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Create DINK2025 code with 1000 XP
    const [code] = await db.insert(redemptionCodes)
      .values({
        code: "DINK2025",
        description: "Pickle+ Special Launch Code",
        xpReward: 1000,
        isActive: true,
        isFoundingMemberCode: false,
        maxRedemptions: 50,
        currentRedemptions: 0,
        expiresAt: new Date(2025, 11, 31) // Expires Dec 31, 2025
      })
      .returning();
    
    console.log("✅ DINK2025 redemption code created successfully!");
    console.log(code);
    
  } catch (error) {
    console.error("Error creating redemption code:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the function
createDinkCode();