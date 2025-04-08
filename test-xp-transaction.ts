/**
 * Test file to create XP transactions for testing
 * Run with: npx tsx test-xp-transaction.ts
 */
import { db } from "./server/db";
import { xpTransactions } from "./shared/schema";

async function createTestXpTransaction() {
  try {
    console.log("Creating test XP transaction...");
    
    const [transaction] = await db
      .insert(xpTransactions)
      .values({
        userId: 1,
        amount: 50,
        source: "Test transaction",
        metadata: { test: true }
      })
      .returning();
    
    console.log("Transaction created:", transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
  } finally {
    process.exit(0);
  }
}

createTestXpTransaction();