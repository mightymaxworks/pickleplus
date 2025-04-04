import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { redemptionCodes } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function listRedemptionCodes() {
  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Get all active founding member codes
    const codes = await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.isFoundingMemberCode, true));
    
    if (codes.length === 0) {
      console.log("No founding member codes found. Run create-founding-code.ts to create one.");
      return;
    }
    
    console.log("📋 Active Founding Member Codes:");
    console.log("----------------------------------");
    
    codes.forEach(code => {
      console.log(`Code: ${code.code}`);
      console.log(`Description: ${code.description}`);
      console.log(`Redemptions: ${code.currentRedemptions}/${code.maxRedemptions}`);
      console.log(`Expires: ${code.expiresAt}`);
      console.log("----------------------------------");
    });
    
  } catch (error) {
    console.error("Error listing redemption codes:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the function
listRedemptionCodes();