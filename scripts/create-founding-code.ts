import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { redemptionCodes } from '../shared/schema.js';

// Generate a random code in format FOUNDER-XXXX where X is alphanumeric
function generateFounderCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = 'FOUNDER-';
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

async function createFoundingMemberCode() {
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    const code = generateFounderCode();
    
    // Create the founding member code
    const [redemptionCode] = await db
      .insert(redemptionCodes)
      .values({
        code,
        description: "Founding Member Status - 1.1x XP Multiplier",
        xpReward: 100, // Small XP reward
        isActive: true,
        isFoundingMemberCode: true,
        maxRedemptions: 40, // Limit to 40 founding members
        currentRedemptions: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      })
      .returning();
    
    console.log("✅ Created Founding Member code:");
    console.log("----------------------------------");
    console.log(`Code: ${redemptionCode.code}`);
    console.log(`Description: ${redemptionCode.description}`);
    console.log(`Max Redemptions: ${redemptionCode.maxRedemptions}`);
    console.log(`Expires: ${redemptionCode.expiresAt}`);
    console.log("----------------------------------");
    console.log("Share this code with your first 40 users to grant them Founding Member status!");
    
  } catch (error) {
    console.error("Error creating founding member code:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the function
createFoundingMemberCode();