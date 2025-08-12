/**
 * Match routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

/**
 * Register match routes with the Express application
 * @param app Express application
 */
export function registerMatchRoutes(app: express.Express): void {
  console.log("[API] Registering Match API routes");
  
  // Match creation endpoint for recording new matches
  app.post('/api/matches', isAuthenticated, async (req, res) => {
    try {
      console.log('[Match Creation] Recording new match with data:', req.body);
      
      const { 
        playerOneId, 
        playerTwoId, 
        playerOnePartnerId,
        playerTwoPartnerId,
        games, 
        matchType, 
        formatType,
        notes,
        tournamentId,
        scheduledDate
      } = req.body;
      
      if (!playerTwoId || !games || games.length === 0) {
        return res.status(400).json({ error: 'Missing required match data' });
      }

      // Calculate overall winner based on games won
      let playerOneGamesWon = 0;
      let playerTwoGamesWon = 0;
      
      games.forEach((game: any) => {
        if (game.playerOneScore > game.playerTwoScore) {
          playerOneGamesWon++;
        } else {
          playerTwoGamesWon++;
        }
      });
      
      const winnerId = playerOneGamesWon > playerTwoGamesWon ? (playerOneId || (req.user as any)?.id) : playerTwoId;
      
      // Format scores for storage
      const scoreString = games.map((game: any) => 
        `${game.playerOneScore}-${game.playerTwoScore}`
      ).join(', ');
      
      const newMatch = await storage.createMatch({
        playerOneId: playerOneId || (req.user as any)?.id,
        playerTwoId,
        playerOnePartnerId: playerOnePartnerId || null,
        playerTwoPartnerId: playerTwoPartnerId || null,
        scorePlayerOne: scoreString,
        scorePlayerTwo: scoreString, // Same string, winner determined by winnerId
        winnerId,
        matchType: matchType || 'casual',
        formatType: formatType || 'singles',
        status: 'completed',
        notes: notes || null,
        tournamentId: tournamentId || null,
        scheduledDate: scheduledDate || null
      });

      console.log('[Match Creation] Match created successfully:', newMatch.id);
      res.status(201).json({ success: true, match: newMatch });
    } catch (error) {
      console.error('[Match Creation] Error:', error);
      res.status(500).json({ error: 'Failed to create match', details: (error as Error).message });
    }
  });
  
  // Sample match route - returns JSON data properly
  app.get('/api/matches', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      matches: [
        { id: 1, player1: 'Alice', player2: 'Bob', score: '11-9, 11-7' },
        { id: 2, player1: 'Charlie', player2: 'Diana', score: '11-5, 8-11, 11-6' }
      ],
      total: 2,
      timestamp: new Date().toISOString()
    });
  });
  
  // Rankings leaderboard route - returns JSON data properly
  app.get('/api/rankings/leaderboard', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      leaderboard: [
        { rank: 1, player: 'Alice', rating: 4.5, wins: 25, losses: 5 },
        { rank: 2, player: 'Bob', rating: 4.2, wins: 22, losses: 8 },
        { rank: 3, player: 'Charlie', rating: 4.0, wins: 20, losses: 10 }
      ],
      timestamp: new Date().toISOString()
    });
  });
}