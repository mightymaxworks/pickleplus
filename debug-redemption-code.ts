import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { redemptionCodes } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
console.log(`Connecting to database at ${connectionString}`);
const client = postgres(connectionString);
const db = drizzle(client);

async function debugRedemptionCode() {
  try {
    console.log("Searching for TEST123 code...");
    
    // Try both case-sensitive and case-insensitive searches
    console.log("Case-sensitive search:");
    const exactCodes = await db.select().from(redemptionCodes).where(eq(redemptionCodes.code, "TEST123"));
    console.log(exactCodes);
    
    console.log("\nCase-insensitive search:");
    const caseInsensitiveCodes = await db.select().from(redemptionCodes)
      .where(sql`UPPER(${redemptionCodes.code}) = UPPER(${"TEST123"})`);
    console.log(caseInsensitiveCodes);
    
    // List all codes
    console.log("\nListing all redemption codes:");
    const allCodes = await db.select().from(redemptionCodes);
    console.log(allCodes);
    
  } catch (error) {
    console.error("Error debuggging redemption code:", error);
  } finally {
    await client.end();
  }
}

debugRedemptionCode();