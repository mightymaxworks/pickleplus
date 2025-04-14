import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { matches } from "@shared/schema";
import { db, client } from "./db";
import { eq, and, or, sql, desc } from "drizzle-orm";

// Import API route modules
import xpRoutes from "./api/xp";
import rankingRoutes from "./api/ranking";
import matchRoutes from "./api/match";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Register API route modules
  app.use('/api/xp', xpRoutes);
  app.use('/api/ranking', rankingRoutes);
  app.use('/api/match', matchRoutes);
  
  // Match recording
  app.post("/api/match/record", isAuthenticated, async (req: Request, res: Response) => {
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
        matchDate: today,
        // Set mandatory columns
        pointsAwarded: 0,
        xpAwarded: 0
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
      
      // Get player names for the response
      const playerOneData = await storage.getUser(playerOne.userId);
      const playerTwoData = await storage.getUser(playerTwo.userId);
      let playerOnePartnerData = null;
      let playerTwoPartnerData = null;
      
      if (formatType === "doubles") {
        if (playerOne.partnerId) playerOnePartnerData = await storage.getUser(playerOne.partnerId);
        if (playerTwo.partnerId) playerTwoPartnerData = await storage.getUser(playerTwo.partnerId);
      }
      
      // Generate the player names mapping
      const playerNames = {};
      
      if (playerOneData) {
        playerNames[playerOneData.id] = {
          displayName: playerOneData.displayName || playerOneData.username,
          username: playerOneData.username,
          avatarInitials: playerOneData.avatarInitials || undefined
        };
      }
      
      if (playerTwoData) {
        playerNames[playerTwoData.id] = {
          displayName: playerTwoData.displayName || playerTwoData.username,
          username: playerTwoData.username,
          avatarInitials: playerTwoData.avatarInitials || undefined
        };
      }
      
      if (playerOnePartnerData) {
        playerNames[playerOnePartnerData.id] = {
          displayName: playerOnePartnerData.displayName || playerOnePartnerData.username,
          username: playerOnePartnerData.username,
          avatarInitials: playerOnePartnerData.avatarInitials || undefined
        };
      }
      
      if (playerTwoPartnerData) {
        playerNames[playerTwoPartnerData.id] = {
          displayName: playerTwoPartnerData.displayName || playerTwoPartnerData.username,
          username: playerTwoPartnerData.username,
          avatarInitials: playerTwoPartnerData.avatarInitials || undefined
        };
      }
      
      // Combine match data with player information
      const recordedMatch = {
        ...match,
        playerNames,
        formatType,
        scoringSystem,
        pointsToWin,
        players,
        gameScores: typeof match.gameScores === 'string' ? JSON.parse(match.gameScores) : match.gameScores
      };
      
      res.status(201).json(recordedMatch);
      
    } catch (error) {
      console.error("[Match API] Error recording match:", error);
      res.status(500).json({ error: "Server error recording match" });
    }
  });
  
  // Get recent matches
  app.get("/api/match/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      // Execute the query to get recent matches with explicit column selection
      const recentMatches = await db.select({
        id: matches.id,
        playerOneId: matches.playerOneId,
        playerTwoId: matches.playerTwoId,
        playerOnePartnerId: matches.playerOnePartnerId,
        playerTwoPartnerId: matches.playerTwoPartnerId,
        winnerId: matches.winnerId,
        scorePlayerOne: matches.scorePlayerOne,
        scorePlayerTwo: matches.scorePlayerTwo,
        formatType: matches.formatType,
        scoringSystem: matches.scoringSystem,
        pointsToWin: matches.pointsToWin,
        matchDate: matches.matchDate,
        location: matches.location,
        notes: matches.notes,
        gameScores: matches.gameScores
      })
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, userId),
            eq(matches.playerTwoId, userId),
            eq(matches.playerOnePartnerId, userId),
            eq(matches.playerTwoPartnerId, userId)
          )
        )
        .orderBy(desc(matches.matchDate))
        .limit(limit);
      
      // For each match, get the player names
      const matchesWithPlayerNames = await Promise.all(recentMatches.map(async (match) => {
        const playerIds = [
          match.playerOneId,
          match.playerTwoId,
          match.playerOnePartnerId,
          match.playerTwoPartnerId
        ].filter(Boolean) as number[];
        
        const playerNames = {};
        
        for (const id of playerIds) {
          const userData = await storage.getUser(id);
          if (userData) {
            playerNames[id] = {
              displayName: userData.displayName || userData.username,
              username: userData.username,
              avatarInitials: userData.avatarInitials || undefined
            };
          }
        }
        
        // Convert database fields to SDK format
        return {
          id: match.id,
          date: match.matchDate.toISOString(),
          formatType: match.formatType,
          scoringSystem: match.scoringSystem,
          pointsToWin: match.pointsToWin,
          players: [
            {
              userId: match.playerOneId,
              partnerId: match.playerOnePartnerId || undefined,
              score: parseInt(match.scorePlayerOne, 10),
              isWinner: match.winnerId === match.playerOneId
            },
            {
              userId: match.playerTwoId,
              partnerId: match.playerTwoPartnerId || undefined,
              score: parseInt(match.scorePlayerTwo, 10),
              isWinner: match.winnerId === match.playerTwoId
            }
          ],
          gameScores: typeof match.gameScores === 'string' ? 
            JSON.parse(match.gameScores || '[]') : 
            (match.gameScores || []),
          location: match.location,
          notes: match.notes,
          playerNames
        };
      }));
      
      res.json(matchesWithPlayerNames);
      
    } catch (error) {
      console.error("[Match API] Error getting recent matches:", error);
      res.status(500).json({ error: "Server error getting recent matches" });
    }
  });
  
  // Get match statistics
  app.get("/api/match/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : req.user.id;
      
      // Get total matches where user was involved - use individual column selections to avoid round_number
      const [matchCount] = await db.select({
        count: sql<number>`count(*)`
      }).from(matches)
        .where(
          or(
            eq(matches.playerOneId, userId),
            eq(matches.playerTwoId, userId),
            eq(matches.playerOnePartnerId, userId),
            eq(matches.playerTwoPartnerId, userId)
          )
        );
        
      // Get matches where the user won
      const [winsCount] = await db.select({
        count: sql<number>`count(*)`
      }).from(matches)
        .where(
          and(
            or(
              eq(matches.playerOneId, userId),
              eq(matches.playerTwoId, userId),
              eq(matches.playerOnePartnerId, userId),
              eq(matches.playerTwoPartnerId, userId)
            ),
            eq(matches.winnerId, userId)
          )
        );
      
      // Get a few recent matches for the overview - select only the columns we need
      const recentMatches = await db.select({
        id: matches.id,
        playerOneId: matches.playerOneId,
        playerTwoId: matches.playerTwoId,
        playerOnePartnerId: matches.playerOnePartnerId,
        playerTwoPartnerId: matches.playerTwoPartnerId,
        winnerId: matches.winnerId,
        scorePlayerOne: matches.scorePlayerOne,
        scorePlayerTwo: matches.scorePlayerTwo,
        formatType: matches.formatType,
        scoringSystem: matches.scoringSystem,
        pointsToWin: matches.pointsToWin,
        matchDate: matches.matchDate,
        location: matches.location,
        notes: matches.notes,
        gameScores: matches.gameScores
      })
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, userId),
            eq(matches.playerTwoId, userId),
            eq(matches.playerOnePartnerId, userId),
            eq(matches.playerTwoPartnerId, userId)
          )
        )
        .orderBy(desc(matches.matchDate))
        .limit(5);
      
      // Process the matches the same way as in the /api/match/recent endpoint
      const formattedRecentMatches = await Promise.all(recentMatches.map(async (match) => {
        const playerIds = [
          match.playerOneId,
          match.playerTwoId,
          match.playerOnePartnerId,
          match.playerTwoPartnerId
        ].filter(Boolean) as number[];
        
        const playerNames = {};
        
        for (const id of playerIds) {
          const userData = await storage.getUser(id);
          if (userData) {
            playerNames[id] = {
              displayName: userData.displayName || userData.username,
              username: userData.username,
              avatarInitials: userData.avatarInitials || undefined
            };
          }
        }
        
        return {
          id: match.id,
          date: match.matchDate.toISOString(),
          formatType: match.formatType,
          scoringSystem: match.scoringSystem,
          pointsToWin: match.pointsToWin,
          players: [
            {
              userId: match.playerOneId,
              partnerId: match.playerOnePartnerId || undefined,
              score: parseInt(match.scorePlayerOne, 10),
              isWinner: match.winnerId === match.playerOneId
            },
            {
              userId: match.playerTwoId,
              partnerId: match.playerTwoPartnerId || undefined,
              score: parseInt(match.scorePlayerTwo, 10),
              isWinner: match.winnerId === match.playerTwoId
            }
          ],
          gameScores: typeof match.gameScores === 'string' ? 
            JSON.parse(match.gameScores || '[]') : 
            (match.gameScores || []),
          location: match.location,
          notes: match.notes,
          playerNames
        };
      }));
      
      // Calculate win rate as a percentage
      const totalMatches = matchCount?.count || 0;
      const matchesWon = winsCount?.count || 0;
      const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
      
      // Return the stats
      res.json({
        totalMatches,
        matchesWon,
        matchesLost: totalMatches - matchesWon,
        winRate,
        recentMatches: formattedRecentMatches
      });
      
    } catch (error) {
      console.error("[Match API] Error getting match stats:", error);
      res.status(500).json({ error: "Server error getting match stats" });
    }
  });

  // Player search endpoint - Enhanced with more flexible search capabilities
  app.get("/api/player/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      console.log(`[Player API] Searching for players with query: "${query}"`);
      
      // Import schema and passport utilities
      const { users } = await import("@shared/schema");
      const { normalizePassportId } = await import("@shared/utils/passport-utils");
      
      // Improve search to include more fields and handle spaces better
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      // Special case for passport ID - check for PKL- prefix or raw format
      const isPassportIdSearch = query.toUpperCase().includes('PKL-') || 
                                (query.length >= 4 && /^[A-Z0-9-]+$/i.test(query));
      
      // Normalized search for passport IDs
      const normalizedQuery = normalizePassportId(query);
      
      const searchConditions = searchTerms.map(term => 
        or(
          sql`lower(${users.username}) like ${`%${term}%`}`,
          sql`lower(${users.displayName}) like ${`%${term}%`}`,
          sql`lower(${users.firstName}) like ${`%${term}%`}`,
          sql`lower(${users.lastName}) like ${`%${term}%`}`,
          // Much more flexible passport ID search using normalized form
          sql`replace(replace(upper(${users.passportId}), 'PKL-', ''), '-', '') like ${`%${normalizedQuery}%`}`
        )
      );
      
      // If multiple terms, try to match them all
      let whereClause;
      if (searchConditions.length > 1) {
        // Multiple terms - each term should match at least one field
        whereClause = and(...searchConditions);
      } else if (searchConditions.length === 1) {
        // Single term - direct match
        whereClause = searchConditions[0];
      }
      
      const players = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarInitials: users.avatarInitials,
        isFoundingMember: users.isFoundingMember,
        passportId: users.passportId
      })
      .from(users)
      .where(whereClause)
      .limit(15);
      
      console.log(`[Player API] Found ${players.length} matching players`);
      
      // Format the player data and include more information
      const formattedPlayers = players.map(player => ({
        id: player.id,
        username: player.username,
        displayName: player.displayName || player.username,
        fullName: player.firstName && player.lastName 
          ? `${player.firstName} ${player.lastName}`
          : null,
        avatarInitials: player.avatarInitials,
        isFoundingMember: player.isFoundingMember,
        passportId: player.passportId
      }));
      
      res.json(formattedPlayers);
      
    } catch (error) {
      console.error("[Player API] Error searching players:", error);
      res.status(500).json({ error: "Server error searching players" });
    }
  });

  // Create a simple HTTP server
  const httpServer = createServer(app);
  return httpServer;
}