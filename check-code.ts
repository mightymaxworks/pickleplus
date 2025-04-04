import { client, db } from './server/db';
import { redemptionCodes } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkCode() {
  try {
    // Find the redemption code DINK2025
    const code = await db.select().from(redemptionCodes).where(eq(redemptionCodes.code, 'DINK2025'));
    console.log('Code found:', code);
  } catch (error) {
    console.error('Error checking code:', error);
  } finally {
    await client.end();
  }
}

checkCode();
