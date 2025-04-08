/**
 * Match API Routes
 * 
 * This file implements API routes for match recording and integration
 * with the XP and ranking systems.
 */
import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  matches,
  users,
  xpTransactions,
  rankingTransactions
} from "@shared/schema";
import { eq, and, desc, gt, sql } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import MatchRewardService from "../services/MatchRewardService";

const router = Router();

/**
 * Record a new match with XP and ranking rewards
 */
router.post("/record", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { 
      formatType, scoringSystem, pointsToWin,
      players, gameScores, location, notes
    } = req.body;
    
    // Validate basic match format
    if (!formatType || !Array.isArray(players) || players.length < 2) {
      return res.status(400).json({ error: "Invalid match data format" });
    }
    
    // Ensure current user is one of the players
    const currentUserPlaying = players.some(p => p.userId === req.user?.id);
    if (!currentUserPlaying) {
      return res.status(400).json({ error: "Current user must be one of the players" });
    }
    
    // Prepare match data
    const playerOne = players.find(p => p.userId === req.user?.id);
    const playerTwo = players.find(p => p.userId !== req.user?.id);
    
    if (!playerOne || !playerTwo) {
      return res.status(400).json({ error: "Invalid player data" });
    }
    
    // Create match data object with defaults
    const today = new Date();
    const matchData = {
      playerOneId: playerOne.userId,
      playerTwoId: playerTwo.userId,
      playerOnePartnerId: playerOne.partnerId || null,
      playerTwoPartnerId: playerTwo.partnerId || null,
      scorePlayerOne: String(playerOne.score),
      scorePlayerTwo: String(playerTwo.score),
      winnerId: playerOne.isWinner ? playerOne.userId : playerTwo.userId,
      formatType,
      scoringSystem: scoringSystem || "traditional",
      pointsToWin: pointsToWin || 11,
      division: req.body.division || "open",
      matchType: req.body.matchType || "casual",
      eventTier: req.body.eventTier || "local",
      gameScores: typeof gameScores === 'string' ? gameScores : JSON.stringify(gameScores || []),
      location,
      notes,
      matchDate: today
    };
    
    // Format validation
    if (formatType === "doubles" && (!playerOne.partnerId || !playerTwo.partnerId)) {
      return res.status(400).json({ error: "Doubles matches require partner IDs" });
    }
    
    // Insert the match record using db.insert
    const [match] = await db.insert(matches)
      .values(matchData)
      .returning();
    
    if (!match) {
      return res.status(500).json({ error: "Failed to create match" });
    }
    
    // Calculate and record XP and ranking rewards for both players
    const rewards = await calculateMatchRewards(match);
    
    // Get player names for the response
    const [playerOneData] = await db.select({
        username: users.username,
        displayName: users.displayName,
        avatarInitials: users.avatarInitials
      })
      .from(users)
      .where(eq(users.id, playerOne.userId))
      .limit(1);
    
    const [playerTwoData] = await db.select({
        username: users.username,
        displayName: users.displayName,
        avatarInitials: users.avatarInitials
      })
      .from(users)
      .where(eq(users.id, playerTwo.userId))
      .limit(1);
    
    let playerOnePartnerData = null;
    let playerTwoPartnerData = null;
    
    if (formatType === "doubles") {
      if (playerOne.partnerId) {
        [playerOnePartnerData] = await db.select({
            username: users.username,
            displayName: users.displayName,
            avatarInitials: users.avatarInitials
          })
          .from(users)
          .where(eq(users.id, playerOne.partnerId))
          .limit(1);
      }
      
      if (playerTwo.partnerId) {
        [playerTwoPartnerData] = await db.select({
            username: users.username,
            displayName: users.displayName,
            avatarInitials: users.avatarInitials
          })
          .from(users)
          .where(eq(users.id, playerTwo.partnerId))
          .limit(1);
      }
    }
    
    // Return match data with player info
    return res.status(201).json({
      match: {
        ...match,
        players: {
          playerOne: playerOneData,
          playerTwo: playerTwoData,
          playerOnePartner: playerOnePartnerData,
          playerTwoPartner: playerTwoPartnerData
        }
      },
      rewards
    });
  } catch (error: any) {
    console.error("Error recording match:", error);
    return res.status(500).json({ error: error.message || "Failed to record match" });
  }
});

/**
 * Get recent matches for the current user
 */
router.get("/recent", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    
    // Get matches where the user is playerOne or playerTwo
    const recentMatches = await db
      .select()
      .from(matches)
      .where(
        sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`
      )
      .orderBy(desc(matches.matchDate))
      .limit(limit)
      .offset(offset);
    
    // Get count of total matches
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(matches)
      .where(sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`);
    
    const total = countResult[0]?.count || 0;
    
    return res.status(200).json({
      matches: recentMatches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error: any) {
    console.error("Error fetching recent matches:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch recent matches" });
  }
});

/**
 * Get match statistics for the current user
 */
router.get("/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    // Get total matches
    const totalCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(matches)
      .where(sql`${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId}`);
    
    const totalMatches = totalCountResult[0]?.count || 0;
    
    // Get wins
    const winsCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(matches)
      .where(eq(matches.winnerId, userId));
    
    const wins = winsCountResult[0]?.count || 0;
    
    // Calculate win rate
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    
    // Get recent XP and ranking transactions related to matches
    const recentXP = await db.select()
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          sql`${xpTransactions.matchId} IS NOT NULL`
        )
      )
      .orderBy(desc(xpTransactions.timestamp))
      .limit(5);
    
    const recentRanking = await db.select()
      .from(rankingTransactions)
      .where(
        and(
          eq(rankingTransactions.userId, userId),
          sql`${rankingTransactions.matchId} IS NOT NULL`
        )
      )
      .orderBy(desc(rankingTransactions.timestamp))
      .limit(5);
    
    return res.status(200).json({
      totalMatches,
      wins,
      losses: totalMatches - wins,
      winRate: Math.round(winRate),
      recentXP,
      recentRanking
    });
  } catch (error: any) {
    console.error("Error fetching match stats:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch match statistics" });
  }
});

/**
 * Helper function to calculate and record rewards for all players in a match
 * 
 * @param match The recorded match
 * @returns Object containing reward information for all players
 */
async function calculateMatchRewards(match: any) {
  const rewards: any = {
    playerOne: null,
    playerTwo: null
  };
  
  try {
    // Get user data for both players
    const [playerOne] = await db.select()
      .from(users)
      .where(eq(users.id, match.playerOneId))
      .limit(1);
    
    const [playerTwo] = await db.select()
      .from(users)
      .where(eq(users.id, match.playerTwoId))
      .limit(1);
    
    if (!playerOne || !playerTwo) {
      console.error("One or more players not found");
      return rewards;
    }
    
    // Calculate rewards for player one
    const xpResultPlayerOne = await MatchRewardService.calculateXP(match, playerOne);
    const rankingResultPlayerOne = await MatchRewardService.calculateRankingPoints(match, playerOne);
    
    // Calculate rewards for player two
    const xpResultPlayerTwo = await MatchRewardService.calculateXP(match, playerTwo);
    const rankingResultPlayerTwo = await MatchRewardService.calculateRankingPoints(match, playerTwo);
    
    // Record the rewards in the database
    const playerOneRewards = await MatchRewardService.recordRewards(
      match, 
      xpResultPlayerOne, 
      rankingResultPlayerOne
    );
    
    const playerTwoRewards = await MatchRewardService.recordRewards(
      match, 
      xpResultPlayerTwo, 
      rankingResultPlayerTwo
    );
    
    // Update match record with awarded points
    await db.update(matches)
      .set({
        xpAwarded: xpResultPlayerOne.totalXP + xpResultPlayerTwo.totalXP,
        pointsAwarded: rankingResultPlayerOne.points + rankingResultPlayerTwo.points
      })
      .where(eq(matches.id, match.id));
    
    // Set the rewards for response
    rewards.playerOne = {
      userId: playerOne.id,
      xp: {
        amount: xpResultPlayerOne.totalXP,
        breakdown: xpResultPlayerOne.breakdown
      },
      ranking: {
        points: rankingResultPlayerOne.points,
        previousTier: rankingResultPlayerOne.previousTier,
        newTier: rankingResultPlayerOne.newTier,
        tierChanged: rankingResultPlayerOne.tierChanged
      }
    };
    
    rewards.playerTwo = {
      userId: playerTwo.id,
      xp: {
        amount: xpResultPlayerTwo.totalXP,
        breakdown: xpResultPlayerTwo.breakdown
      },
      ranking: {
        points: rankingResultPlayerTwo.points,
        previousTier: rankingResultPlayerTwo.previousTier,
        newTier: rankingResultPlayerTwo.newTier,
        tierChanged: rankingResultPlayerTwo.tierChanged
      }
    };
  } catch (error) {
    console.error("Error calculating match rewards:", error);
  }
  
  return rewards;
}

export default router;