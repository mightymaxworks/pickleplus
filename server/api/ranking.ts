/**
 * Ranking API Endpoints
 * 
 * This file implements API routes for the Ranking system
 */
import { Router } from "express";
import { db } from "../db";
import { 
  rankingTransactions, 
  rankingTierHistory, 
  users 
} from "@shared/schema"; 
import { eq, desc, and, sql } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router = Router();

// Tier thresholds for the ranking system
const TIER_THRESHOLDS = {
  'Bronze': 0,
  'Silver': 250,
  'Gold': 750,
  'Platinum': 1500,
  'Diamond': 2500,
  'Master': 3500,
  'Grandmaster': 5000
};

/**
 * Get a user's ranking points and tier
 */
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    // First check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get the sum of all ranking transactions for this user
    const result = await db
      .select({ 
        rankingPoints: sql<number>`COALESCE(SUM(${rankingTransactions.amount}), 0)`.as('rankingPoints') 
      })
      .from(rankingTransactions)
      .where(eq(rankingTransactions.userId, userId));
    
    const rankingPoints = result[0]?.rankingPoints || 0;
    
    // Calculate tier based on ranking points
    let tier = 'Bronze';
    for (const [tierName, threshold] of Object.entries(TIER_THRESHOLDS)) {
      if (rankingPoints >= threshold) {
        tier = tierName;
      } else {
        break;
      }
    }
    
    return res.status(200).json({ userId, rankingPoints, tier });
  } catch (error) {
    console.error("Error fetching user ranking:", error);
    return res.status(500).json({ error: "Failed to fetch user ranking" });
  }
});

/**
 * Get a user's tier information
 */
router.get("/:userId/tier", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    // First check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get the sum of all ranking transactions for this user
    const result = await db
      .select({ 
        rankingPoints: sql<number>`COALESCE(SUM(${rankingTransactions.amount}), 0)`.as('rankingPoints') 
      })
      .from(rankingTransactions)
      .where(eq(rankingTransactions.userId, userId));
    
    const rankingPoints = result[0]?.rankingPoints || 0;
    
    // Calculate tier based on ranking points
    let tier = 'Bronze';
    let nextTier = 'Silver';
    let currentTierThreshold = 0;
    let nextTierThreshold = 250;
    
    const tierEntries = Object.entries(TIER_THRESHOLDS);
    for (let i = 0; i < tierEntries.length; i++) {
      const [tierName, threshold] = tierEntries[i];
      if (rankingPoints >= threshold) {
        tier = tierName;
        currentTierThreshold = threshold;
        
        // Set next tier if not at the max tier
        if (i < tierEntries.length - 1) {
          nextTier = tierEntries[i+1][0];
          nextTierThreshold = tierEntries[i+1][1];
        } else {
          nextTier = tierName; // Already at max tier
          nextTierThreshold = threshold;
        }
      } else {
        break;
      }
    }
    
    // Calculate points needed and progress
    const pointsNeeded = nextTierThreshold - rankingPoints;
    const progress = tier === nextTier ? 100 : 
      ((rankingPoints - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100;
    
    return res.status(200).json({ 
      userId, 
      rankingPoints, 
      tier,
      currentTierThreshold,
      nextTier,
      nextTierThreshold,
      pointsNeeded,
      progress: Math.min(Math.max(progress, 0), 100) // Ensure progress is between 0-100
    });
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return res.status(500).json({ error: "Failed to fetch user tier" });
  }
});

/**
 * Get a user's ranking transactions with pagination
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
    const transactions = await db.query.rankingTransactions.findMany({
      where: eq(rankingTransactions.userId, userId),
      orderBy: [desc(rankingTransactions.timestamp)],
      limit,
      offset
    });
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(rankingTransactions)
      .where(eq(rankingTransactions.userId, userId));
    
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
    console.error("Error fetching user ranking transactions:", error);
    return res.status(500).json({ error: "Failed to fetch user ranking transactions" });
  }
});

/**
 * Get a user's tier history with pagination
 */
router.get("/:userId/tier-history", async (req, res) => {
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
    
    // Get paginated tier history
    const tierHistory = await db.query.rankingTierHistory.findMany({
      where: eq(rankingTierHistory.userId, userId),
      orderBy: [desc(rankingTierHistory.timestamp)],
      limit,
      offset
    });
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(rankingTierHistory)
      .where(eq(rankingTierHistory.userId, userId));
    
    const total = countResult[0]?.count || 0;
    
    return res.status(200).json({
      tierHistory,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error("Error fetching user tier history:", error);
    return res.status(500).json({ error: "Failed to fetch user tier history" });
  }
});

/**
 * Award ranking points to a user (protected route)
 */
router.post("/award", isAuthenticated, async (req, res) => {
  try {
    const { userId, amount, source, matchId, tournamentId, metadata } = req.body;
    
    if (!userId || !amount || !source) {
      return res.status(400).json({ error: "Missing required fields (userId, amount, source)" });
    }
    
    // Check if amount is a valid number
    if (isNaN(amount)) {
      return res.status(400).json({ error: "Amount must be a number" });
    }
    
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get current ranking points to check for tier changes
    const result = await db
      .select({ 
        rankingPoints: sql<number>`COALESCE(SUM(${rankingTransactions.amount}), 0)`.as('rankingPoints') 
      })
      .from(rankingTransactions)
      .where(eq(rankingTransactions.userId, userId));
    
    const currentPoints = result[0]?.rankingPoints || 0;
    const newPoints = currentPoints + amount;
    
    // Insert ranking transaction
    const [transaction] = await db
      .insert(rankingTransactions)
      .values({
        userId,
        amount,
        source,
        matchId: matchId || null,
        tournamentId: tournamentId || null,
        metadata: metadata || null
      })
      .returning();
    
    // Check for tier change and record if needed
    const currentTier = getTierFromPoints(currentPoints);
    const newTier = getTierFromPoints(newPoints);
    
    if (currentTier !== newTier) {
      // Record tier change
      await db
        .insert(rankingTierHistory)
        .values({
          userId,
          oldTier: currentTier,
          newTier: newTier,
          rankingPoints: newPoints
        });
    }
    
    return res.status(201).json({
      transaction,
      oldTier: currentTier,
      newTier,
      tierChanged: currentTier !== newTier
    });
  } catch (error) {
    console.error("Error awarding ranking points:", error);
    return res.status(500).json({ error: "Failed to award ranking points" });
  }
});

/**
 * Helper function to get tier from points
 */
function getTierFromPoints(points: number): string {
  let tier = 'Bronze';
  for (const [tierName, threshold] of Object.entries(TIER_THRESHOLDS)) {
    if (points >= threshold) {
      tier = tierName;
    } else {
      break;
    }
  }
  return tier;
}

export default router;