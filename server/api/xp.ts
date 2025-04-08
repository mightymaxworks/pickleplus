/**
 * XP API Endpoints
 * 
 * This file implements API routes for the XP transaction system
 */
import { Router } from "express";
import { db } from "../db";
import { xpTransactions, users } from "@shared/schema"; 
import { eq, desc, and, sql } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router = Router();

/**
 * Get a user's total XP
 */
router.get("/total/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    // First check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get the sum of all XP transactions for this user
    const result = await db
      .select({ 
        totalXP: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`.as('totalXP') 
      })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));
    
    const totalXP = result[0]?.totalXP || 0;
    
    return res.status(200).json({ userId, totalXP });
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return res.status(500).json({ error: "Failed to fetch user XP" });
  }
});

/**
 * Get a user's XP transactions with pagination
 */
router.get("/:userId/transactions", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    
    // First check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get paginated transactions
    const transactions = await db.query.xpTransactions.findMany({
      where: eq(xpTransactions.userId, userId),
      orderBy: [desc(xpTransactions.timestamp)],
      limit,
      offset
    });
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));
    
    const total = countResult[0]?.count || 0;
    
    return res.status(200).json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error("Error fetching user XP transactions:", error);
    return res.status(500).json({ error: "Failed to fetch user XP transactions" });
  }
});

/**
 * Award XP to a user (protected route)
 */
router.post("/award", isAuthenticated, async (req, res) => {
  try {
    const { userId, amount, source, matchId, tournamentId, achievementId, metadata } = req.body;
    
    if (!userId || !amount || !source) {
      return res.status(400).json({ error: "Missing required fields (userId, amount, source)" });
    }
    
    // Check if amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Insert XP transaction
    const [transaction] = await db
      .insert(xpTransactions)
      .values({
        userId,
        amount,
        source,
        matchId: matchId || null,
        tournamentId: tournamentId || null,
        achievementId: achievementId || null,
        metadata: metadata || null
      })
      .returning();
    
    return res.status(201).json(transaction);
  } catch (error) {
    console.error("Error awarding XP:", error);
    return res.status(500).json({ error: "Failed to award XP" });
  }
});

export default router;