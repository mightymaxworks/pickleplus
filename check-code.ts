import { client, db } from './server/db';
import { redemptionCodes } from './shared/schema';
import { sql } from 'drizzle-orm';

async function checkCode() {
  try {
    // Find the redemption code DINK2025 using case-insensitive query
    const code = await db.select()
      .from(redemptionCodes)
      .where(sql`UPPER(${redemptionCodes.code}) = UPPER(${'DINK2025'})`);
    
    console.log('Code found:', code);
  } catch (error) {
    console.error('Error checking code:', error);
  } finally {
    await client.end();
  }
}

checkCode();
