import { Request, Response, Express } from 'express';
import { createServer, Server } from 'http';

export function registerMockRoutes(app: Express): Server {
  // This data represents what would normally be stored in a database
  // MOCK DATA
  
  // User data
  const users: Record<number, any> = {
    1: {
      id: 1,
      username: 'PickleballPro',
      email: 'pickleballpro@example.com',
      isAdmin: false,
      isFoundingMember: true,
      created: '2025-01-01T00:00:00Z',
      profileImageUrl: 'https://ui-avatars.com/api/?name=Pickleball+Pro',
      bio: 'Professional pickleball player with 5+ years of experience',
      location: 'Phoenix, AZ',
      rating: 4.5
    }
  };
  
  // XP data
  const xpData: Record<number, any> = {
    1: {
      totalXP: 1250,
      level: 5,
      nextLevelXP: 1500,
      previousLevelXP: 1000,
      nextLevelDelta: 250,
      progress: 0.75,
      transactions: [
        {
          id: 1,
          userId: 1,
          amount: 25,
          reason: 'Match completion',
          source: 'match',
          timestamp: '2025-04-07T14:30:00Z'
        },
        {
          id: 2,
          userId: 1,
          amount: 30,
          reason: 'Tournament participation',
          source: 'tournament',
          timestamp: '2025-04-05T10:15:00Z'
        },
        {
          id: 3,
          userId: 1,
          amount: 15,
          reason: 'Match completion',
          source: 'match',
          timestamp: '2025-04-03T16:45:00Z'
        }
      ]
    }
  };
  
  // Ranking data
  const rankingData: Record<number, any> = {
    1: {
      tier: 'Gold',
      points: 520,
      nextTier: 'Platinum',
      nextTierPoints: 750,
      previousTier: 'Silver',
      previousTierPoints: 250,
      progress: 0.54,
      transactions: [
        {
          id: 1,
          userId: 1,
          amount: 10,
          reason: 'Match victory',
          source: 'match',
          timestamp: '2025-04-07T14:30:00Z'
        },
        {
          id: 2,
          userId: 1,
          amount: 25,
          reason: 'Tournament placement',
          source: 'tournament',
          timestamp: '2025-04-05T10:15:00Z'
        },
        {
          id: 3,
          userId: 1,
          amount: 5,
          reason: 'Match victory',
          source: 'match',
          timestamp: '2025-04-03T16:45:00Z'
        }
      ]
    }
  };
  
  // Match stats data
  const matchStats = {
    totalMatches: 12,
    wins: 8,
    losses: 4,
    winRate: 67,
    recentXP: [
      { amount: 25, timestamp: new Date('2025-04-07T14:30:00Z') },
      { amount: 30, timestamp: new Date('2025-04-05T10:15:00Z') },
      { amount: 15, timestamp: new Date('2025-04-03T16:45:00Z') }
    ],
    recentRanking: [
      { amount: 10, timestamp: new Date('2025-04-07T14:30:00Z') },
      { amount: 25, timestamp: new Date('2025-04-05T10:15:00Z') },
      { amount: 5, timestamp: new Date('2025-04-03T16:45:00Z') }
    ],
    recentMatches: [
      { date: new Date('2025-04-07T14:30:00Z'), opponent: 'JaneDoe', result: 'W', score: '11-8' },
      { date: new Date('2025-04-05T10:15:00Z'), opponent: 'BobSmith', result: 'W', score: '11-5' },
      { date: new Date('2025-04-03T16:45:00Z'), opponent: 'AlexJohnson', result: 'L', score: '9-11' }
    ]
  };

  // ROUTES
  
  // Authentication routes
  app.get('/api/auth/current-user', (req: Request, res: Response) => {
    // Always return user 1 for demo purposes
    res.json(users[1]);
  });
  
  // XP routes
  app.get('/api/xp/total', (req: Request, res: Response) => {
    // Return XP summary for user 1
    const { totalXP, level, nextLevelXP, previousLevelXP, nextLevelDelta, progress } = xpData[1];
    res.json({ totalXP, level, nextLevelXP, previousLevelXP, nextLevelDelta, progress });
  });
  
  app.get('/api/xp/total/:userId', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (!xpData[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { totalXP, level, nextLevelXP, previousLevelXP, nextLevelDelta, progress } = xpData[userId];
    res.json({ totalXP, level, nextLevelXP, previousLevelXP, nextLevelDelta, progress });
  });
  
  app.get('/api/xp/transactions', (req: Request, res: Response) => {
    // Return XP transactions for user 1
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = xpData[1].transactions;
    const total = transactions.length;
    
    res.json({
      transactions: transactions.slice(offset, offset + limit),
      pagination: { total, limit, offset }
    });
  });
  
  app.get('/api/xp/:userId/transactions', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (!xpData[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = xpData[userId].transactions;
    const total = transactions.length;
    
    res.json({
      transactions: transactions.slice(offset, offset + limit),
      pagination: { total, limit, offset }
    });
  });
  
  // Ranking routes
  app.get('/api/ranking', (req: Request, res: Response) => {
    // Return ranking summary for user 1
    const { tier, points, nextTier, nextTierPoints, previousTier, previousTierPoints, progress } = rankingData[1];
    res.json({ tier, points, nextTier, nextTierPoints, previousTier, previousTierPoints, progress });
  });
  
  app.get('/api/ranking/:userId', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (!rankingData[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { tier, points, nextTier, nextTierPoints, previousTier, previousTierPoints, progress } = rankingData[userId];
    res.json({ tier, points, nextTier, nextTierPoints, previousTier, previousTierPoints, progress });
  });
  
  app.get('/api/ranking/transactions', (req: Request, res: Response) => {
    // Return ranking transactions for user 1
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = rankingData[1].transactions;
    const total = transactions.length;
    
    res.json({
      transactions: transactions.slice(offset, offset + limit),
      pagination: { total, limit, offset }
    });
  });
  
  app.get('/api/ranking/:userId/transactions', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (!rankingData[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = rankingData[userId].transactions;
    const total = transactions.length;
    
    res.json({
      transactions: transactions.slice(offset, offset + limit),
      pagination: { total, limit, offset }
    });
  });
  
  // Match routes
  app.get('/api/match/stats', (req: Request, res: Response) => {
    // Return match stats for current user
    res.json(matchStats);
  });
  
  // Get recent matches
  app.get('/api/match/recent', (req: Request, res: Response) => {
    // If we have any stored matches in the mock data, return them
    // We'll create default matches if none exist
    const userMatches = [];
    
    // Add a default recent match for testing
    userMatches.push({
      id: 1001,
      date: new Date().toISOString(),
      formatType: 'singles',
      scoringSystem: 'traditional',
      pointsToWin: 11,
      matchType: 'casual',
      eventTier: 'local',
      players: [
        {
          userId: 1, // Current user
          score: "11",
          isWinner: true
        },
        {
          userId: 6, // Random opponent
          score: "4",
          isWinner: false
        }
      ],
      gameScores: [
        {
          playerOneScore: 11,
          playerTwoScore: 4
        }
      ],
      playerNames: {
        1: {
          displayName: "Pickleball Pro",
          username: "PickleballPro"
        },
        6: {
          displayName: "Johnny",
          username: "johnny_pickle"
        }
      },
      validationStatus: 'validated'
    });
    
    // Return the matches
    res.json(userMatches);
  });
  
  app.post('/api/matches', (req: Request, res: Response) => {
    const matchData = req.body;
    
    // Generate a random match ID
    const matchId = Math.floor(Math.random() * 1000) + 1;
    
    // Get player data
    const playerOneId = matchData.players[0].userId;
    const playerTwoId = matchData.players[1].userId;
    
    // Determine who is the winner and calculate XP and ranking rewards
    const playerOneIsWinner = matchData.players[0].isWinner;
    const isTournament = matchData.matchType === 'tournament';
    const isCloseMatch = Math.abs(matchData.players[0].score - matchData.players[1].score) <= 2;
    
    // Calculate XP rewards
    const playerOneXP = {
      amount: playerOneIsWinner ? 25 : 15,
      breakdown: {
        dailyMatchNumber: 1,
        baseAmount: playerOneIsWinner ? 20 : 15,
        cooldownReduction: false,
        cooldownAmount: null,
        tournamentMultiplier: isTournament ? 5 : null,
        victoryBonus: playerOneIsWinner ? 3 : null,
        winStreakBonus: playerOneIsWinner ? 2 : null,
        closeMatchBonus: isCloseMatch ? 3 : null,
        skillBonus: null,
        foundingMemberBonus: users[playerOneId].isFoundingMember ? 2 : null,
        weeklyCapReached: false
      }
    };
    
    const playerTwoXP = {
      amount: playerOneIsWinner ? 15 : 25,
      breakdown: {
        dailyMatchNumber: 1,
        baseAmount: playerOneIsWinner ? 15 : 20,
        cooldownReduction: false,
        cooldownAmount: null,
        tournamentMultiplier: isTournament ? 5 : null,
        victoryBonus: !playerOneIsWinner ? 3 : null,
        winStreakBonus: !playerOneIsWinner ? 2 : null,
        closeMatchBonus: isCloseMatch ? 3 : null,
        skillBonus: null,
        foundingMemberBonus: users[playerTwoId] ? (users[playerTwoId].isFoundingMember ? 2 : null) : null,
        weeklyCapReached: false
      }
    };
    
    // Calculate ranking rewards
    const playerOneRanking = {
      points: playerOneIsWinner ? 10 : 3,
      previousTier: rankingData[playerOneId].tier,
      newTier: playerOneIsWinner ? 'Platinum' : rankingData[playerOneId].tier,
      tierChanged: playerOneIsWinner
    };
    
    const playerTwoRanking = {
      points: playerOneIsWinner ? 3 : 10,
      previousTier: rankingData[playerTwoId] ? rankingData[playerTwoId].tier : 'Bronze',
      newTier: playerOneIsWinner ? (rankingData[playerTwoId] ? rankingData[playerTwoId].tier : 'Bronze') : 'Silver',
      tierChanged: !playerOneIsWinner
    };
    
    // Construct response
    const response = {
      match: {
        id: matchId,
        matchType: matchData.matchType,
        matchDate: matchData.matchDate || new Date().toISOString(),
        players: matchData.players
      },
      rewards: {
        playerOne: {
          userId: playerOneId,
          xp: playerOneXP,
          ranking: playerOneRanking
        },
        playerTwo: {
          userId: playerTwoId,
          xp: playerTwoXP,
          ranking: playerTwoRanking
        }
      }
    };
    
    res.json(response);
  });
  
  // User routes
  app.get('/api/users/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (!users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[userId]);
  });
  
  app.get('/api/users/search', (req: Request, res: Response) => {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Filter users by username (case-insensitive)
    const results = Object.values(users)
      .filter(user => user.username.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    
    res.json(results);
  });
  
  // Match validation endpoint
  app.post('/api/match/validate/:matchId', (req: Request, res: Response) => {
    const matchId = parseInt(req.params.matchId);
    const { status, notes } = req.body;
    
    // Simulate validation success
    res.json({
      id: matchId,
      status: status,
      validated: true,
      message: "Match validated successfully"
    });
  });
  
  /**
   * PKL-278651-HIST-0001-BL: Match history endpoint with filtering and pagination
   */
  app.get('/api/match/history', (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const matchType = req.query.matchType as string;
    const formatType = req.query.formatType as string;
    const validationStatus = req.query.validationStatus as string;
    const location = req.query.location as string;
    const sortBy = req.query.sortBy as string || 'date';
    const sortDirection = req.query.sortDirection as string || 'desc';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    console.log('Match history request:', {
      page, limit, userId, matchType, formatType, validationStatus,
      location, sortBy, sortDirection, startDate, endDate
    });
    
    // Generate example matches
    const matches = [];
    const totalCount = 23; // Example total count
    
    // Create example match history data
    for (let i = 0; i < Math.min(limit, 10); i++) {
      const matchDate = new Date();
      matchDate.setDate(matchDate.getDate() - i * 3); // Space matches out by 3 days
      
      // Skip this match if it doesn't match the date filters
      if (startDate && matchDate < startDate) continue;
      if (endDate && matchDate > endDate) continue;
      
      // For demo purposes, alternate match types
      const currentMatchType = i % 3 === 0 ? 'tournament' : (i % 2 === 0 ? 'competitive' : 'casual');
      if (matchType && matchType !== 'all' && currentMatchType !== matchType) continue;
      
      // For demo purposes, alternate format types
      const currentFormatType = i % 2 === 0 ? 'singles' : 'doubles';
      if (formatType && formatType !== 'all' && currentFormatType !== formatType) continue;
      
      // For demo purposes, alternate validation status
      const currentValidationStatus = i % 2 === 0 ? 'validated' : 'pending';
      if (validationStatus && validationStatus !== 'all' && currentValidationStatus !== validationStatus) continue;
      
      // Simple match object similar to RecordedMatch
      matches.push({
        id: 1001 + i,
        date: matchDate.toISOString(),
        formatType: currentFormatType,
        scoringSystem: 'traditional',
        pointsToWin: 11,
        matchType: currentMatchType,
        eventTier: i % 4 === 0 ? 'regional' : 'local',
        players: [
          {
            userId: 1,
            score: Math.floor(Math.random() * 5) + 7, // Random score between 7-11
            isWinner: i % 2 === 0
          },
          {
            userId: 6 + i % 3, // Different opponents
            score: Math.floor(Math.random() * 6) + 2, // Random score between 2-7
            isWinner: i % 2 !== 0
          }
        ],
        gameScores: [
          {
            playerOneScore: 11,
            playerTwoScore: 4
          }
        ],
        playerNames: {
          1: {
            displayName: "Pickleball Pro",
            username: "PickleballPro",
            avatarInitials: "PP"
          },
          6: {
            displayName: "Johnny Pickleball",
            username: "johnny_pickle",
            avatarInitials: "JP"
          },
          7: {
            displayName: "Sarah Spike",
            username: "sarah_spike",
            avatarInitials: "SS"
          },
          8: {
            displayName: "Michael Volley",
            username: "mike_volley",
            avatarInitials: "MV"
          }
        },
        validationStatus: currentValidationStatus,
        location: i % 3 === 0 ? "Pickleball Paradise" : (i % 2 === 0 ? "Community Center" : "Local Club")
      });
    }
    
    // Sort matches based on request
    if (sortBy === 'date') {
      matches.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'score') {
      matches.sort((a, b) => {
        const scoreA = parseInt(a.players[0].score as string);
        const scoreB = parseInt(b.players[0].score as string);
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      });
    }
    
    // Return paginated results
    return res.json({
      matches,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}