/**
 * Match routes for the application
 */
import express from 'express';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register match routes with the Express application
 * @param app Express application
 */
export function registerMatchRoutes(app: express.Express): void {
  console.log("[API] Registering Match API routes");
  
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