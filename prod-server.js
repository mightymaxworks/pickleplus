/**
 * Pickle+ Production Server - Enhanced Version
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { dirname } from 'path';
import cors from 'cors';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Express app
const app = express();
const PORT = process.env.PORT || 80;

// Setup CORS
app.use(cors());

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
let db = null;

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, running without database');
    setupRoutes();
    return;
  }
  
  try {
    console.log('Setting up database connection...');
    
    // Dynamic imports for ES modules compatibility
    const serverless = await import('@neondatabase/serverless');
    const { Pool, neonConfig } = serverless;
    
    // Import ws for WebSocket support
    try {
      const ws = await import('ws');
      neonConfig.webSocketConstructor = ws.default;
      console.log('Configured WebSocket for Neon database using ws package');
    } catch (wsError) {
      console.log('Could not load ws package, using default WebSocket implementation');
    }
    
    // Configure database pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    db = pool;
    
    // Test connection
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connection successful at:', result.rows[0].now);
      setupRoutes();
    } catch (dbError) {
      console.error('Database connection test failed:', dbError.message);
      console.log('Will continue to serve app without database functionality');
      db = null;
      setupRoutes();
    }
  } catch (error) {
    console.error('Database setup error:', error.message);
    console.log('Continuing without database connection');
    setupRoutes();
  }
}

function setupRoutes() {
  // Serve static client files from public directory
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir));
  
  // API routes
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = db ? 'connected' : 'not connected';
    
    res.json({
      status: 'ok',
      server: 'Pickle+ Production',
      environment: process.env.NODE_ENV || 'production',
      database: dbStatus,
      time: new Date().toISOString(),
      port: PORT
    });
  });
  
  // Current user endpoint
  app.get('/api/auth/current-user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      // Provide a sample user for display purposes
      res.json({
        id: 1, 
        username: "mightymax",
        email: "max@pickleball.com",
        firstName: "Mighty",
        lastName: "Max",
        profileImage: null,
        role: "player"
      });
    }
  });
  
  // Leaderboard endpoint
  app.get('/api/leaderboard', (req, res) => {
    if (db) {
      try {
        db.query(`
          SELECT 
            u.id, 
            u.username AS name, 
            COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) AS wins,
            COUNT(CASE WHEN m.loser_id = u.id THEN 1 END) AS losses
          FROM users u
          LEFT JOIN matches m ON u.id = m.winner_id OR u.id = m.loser_id
          GROUP BY u.id, u.username
          ORDER BY wins DESC
          LIMIT 10
        `)
        .then(result => {
          if (result.rows && result.rows.length > 0) {
            res.json(result.rows);
          } else {
            // Fall back to sample data if no results
            res.json([
              { id: 1, name: 'Mighty Max', wins: 10, losses: 2 },
              { id: 2, name: 'Pickleball Pro', wins: 8, losses: 4 },
              { id: 3, name: 'Dink Master', wins: 7, losses: 5 },
              { id: 4, name: 'Paddle Queen', wins: 6, losses: 3 },
              { id: 5, name: 'Court King', wins: 5, losses: 5 }
            ]);
          }
        })
        .catch(err => {
          console.error('Error fetching leaderboard:', err);
          // Fall back to sample data on error
          res.json([
            { id: 1, name: 'Mighty Max', wins: 10, losses: 2 },
            { id: 2, name: 'Pickleball Pro', wins: 8, losses: 4 },
            { id: 3, name: 'Dink Master', wins: 7, losses: 5 },
            { id: 4, name: 'Paddle Queen', wins: 6, losses: 3 },
            { id: 5, name: 'Court King', wins: 5, losses: 5 }
          ]);
        });
      } catch (error) {
        console.error('Leaderboard query error:', error);
        res.json([
          { id: 1, name: 'Mighty Max', wins: 10, losses: 2 },
          { id: 2, name: 'Pickleball Pro', wins: 8, losses: 4 },
          { id: 3, name: 'Dink Master', wins: 7, losses: 5 },
          { id: 4, name: 'Paddle Queen', wins: 6, losses: 3 },
          { id: 5, name: 'Court King', wins: 5, losses: 5 }
        ]);
      }
    } else {
      // No database connection, use sample data
      res.json([
        { id: 1, name: 'Mighty Max', wins: 10, losses: 2 },
        { id: 2, name: 'Pickleball Pro', wins: 8, losses: 4 },
        { id: 3, name: 'Dink Master', wins: 7, losses: 5 },
        { id: 4, name: 'Paddle Queen', wins: 6, losses: 3 },
        { id: 5, name: 'Court King', wins: 5, losses: 5 }
      ]);
    }
  });
  
  // Match history API
  app.get('/api/match/history', (req, res) => {
    if (db) {
      try {
        db.query(`
          SELECT 
            m.*,
            w.username as winner_username,
            l.username as loser_username
          FROM matches m
          JOIN users w ON m.winner_id = w.id
          JOIN users l ON m.loser_id = l.id
          ORDER BY m.created_at DESC
          LIMIT 50
        `)
        .then(result => {
          res.json(result.rows || []);
        })
        .catch(err => {
          console.error('Error fetching match history:', err);
          res.status(500).json({ error: 'Database error' });
        });
      } catch (error) {
        console.error('Match history query error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // No database connection, use sample data
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      res.json([
        { 
          id: 1, 
          winner_id: 1, 
          loser_id: 2, 
          winner_username: 'Mighty Max', 
          loser_username: 'Pickleball Pro', 
          winner_score: 11, 
          loser_score: 5, 
          created_at: now.toISOString(),
          location: "Downtown Courts",
          match_type: "Singles"
        },
        { 
          id: 2, 
          winner_id: 3, 
          loser_id: 1, 
          winner_username: 'Dink Master', 
          loser_username: 'Mighty Max', 
          winner_score: 11, 
          loser_score: 9, 
          created_at: yesterday.toISOString(),
          location: "Community Center",
          match_type: "Singles"
        },
        { 
          id: 3, 
          winner_id: 1, 
          loser_id: 4, 
          winner_username: 'Mighty Max', 
          loser_username: 'Paddle Queen', 
          winner_score: 11, 
          loser_score: 7, 
          created_at: twoDaysAgo.toISOString(),
          location: "Park Courts",
          match_type: "Singles"
        }
      ]);
    }
  });
  
  // Recent matches API
  app.get('/api/match/recent', (req, res) => {
    if (db) {
      try {
        db.query(`
          SELECT 
            m.*,
            w.username as winner_username,
            l.username as loser_username
          FROM matches m
          JOIN users w ON m.winner_id = w.id
          JOIN users l ON m.loser_id = l.id
          ORDER BY m.created_at DESC
          LIMIT 5
        `)
        .then(result => {
          res.json(result.rows || []);
        })
        .catch(err => {
          console.error('Error fetching recent matches:', err);
          res.status(500).json({ error: 'Database error' });
        });
      } catch (error) {
        console.error('Recent matches query error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // No database connection, use sample data
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      res.json([
        { 
          id: 1, 
          winner_id: 1, 
          loser_id: 2, 
          winner_username: 'Mighty Max', 
          loser_username: 'Pickleball Pro', 
          winner_score: 11, 
          loser_score: 5, 
          created_at: now.toISOString(),
          location: "Downtown Courts",
          match_type: "Singles"
        },
        { 
          id: 2, 
          winner_id: 3, 
          loser_id: 1, 
          winner_username: 'Dink Master', 
          loser_username: 'Mighty Max', 
          winner_score: 11, 
          loser_score: 9, 
          created_at: yesterday.toISOString(),
          location: "Community Center",
          match_type: "Singles"
        },
        { 
          id: 3, 
          winner_id: 1, 
          loser_id: 4, 
          winner_username: 'Mighty Max', 
          loser_username: 'Paddle Queen', 
          winner_score: 11, 
          loser_score: 7, 
          created_at: twoDaysAgo.toISOString(),
          location: "Park Courts",
          match_type: "Singles"
        }
      ]);
    }
  });
  
  // Tournament API
  app.get('/api/tournaments', (req, res) => {
    if (db) {
      try {
        db.query(`
          SELECT 
            t.*,
            COUNT(tp.player_id) as participant_count
          FROM tournaments t
          LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
          GROUP BY t.id
          ORDER BY t.start_date DESC
          LIMIT 20
        `)
        .then(result => {
          res.json(result.rows || []);
        })
        .catch(err => {
          console.error('Error fetching tournaments:', err);
          res.status(500).json({ error: 'Database error' });
        });
      } catch (error) {
        console.error('Tournaments query error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // No database connection, use sample data
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const twoWeeks = new Date(now);
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      
      res.json([
        { 
          id: 1, 
          name: 'Pickle+ Championship', 
          description: 'The premier tournament for Pickle+ players',
          start_date: tomorrow.toISOString(),
          end_date: nextWeek.toISOString(),
          location: 'City Sports Center',
          format: 'Double Elimination',
          participant_count: 16,
          registration_deadline: tomorrow.toISOString(),
          status: 'OPEN'
        },
        {
          id: 2,
          name: 'Regional Qualifier',
          description: 'Qualify for the national championship',
          start_date: nextWeek.toISOString(),
          end_date: new Date(nextWeek.getTime() + 86400000*2).toISOString(),
          location: 'Community Park Courts',
          format: 'Round Robin',
          participant_count: 12,
          registration_deadline: new Date(nextWeek.getTime() - 86400000*2).toISOString(),
          status: 'OPEN'
        },
        {
          id: 3,
          name: 'Pickleball Masters',
          description: 'Masters division tournament for 50+ players',
          start_date: twoWeeks.toISOString(),
          end_date: new Date(twoWeeks.getTime() + 86400000*2).toISOString(),
          location: 'Senior Center Courts',
          format: 'Swiss',
          participant_count: 8,
          registration_deadline: new Date(twoWeeks.getTime() - 86400000*3).toISOString(),
          status: 'OPEN'
        }
      ]);
    }
  });
  
  // User Rating Detail API
  app.get('/api/user/rating-detail', (req, res) => {
    res.json({
      current: 4.5,
      trend: 0.2,
      history: [
        { date: "2025-01-01", rating: 4.0 },
        { date: "2025-02-01", rating: 4.2 },
        { date: "2025-03-01", rating: 4.3 },
        { date: "2025-04-01", rating: 4.5 }
      ],
      confidence: "high",
      matches_count: 28
    });
  });
  
  // CourtIQ Performance API
  app.get('/api/courtiq/performance', (req, res) => {
    res.json({
      status: "available",
      player_id: 1,
      forehand: {
        accuracy: 85,
        power: 78,
        consistency: 82
      },
      backhand: {
        accuracy: 75,
        power: 70,
        consistency: 80
      },
      serve: {
        accuracy: 88,
        power: 72,
        consistency: 90
      },
      dink: {
        accuracy: 92,
        control: 88,
        placement: 85
      },
      mobility: {
        court_coverage: 80,
        reaction_time: 75,
        agility: 82
      },
      strategy: {
        shot_selection: 85,
        adaptability: 78,
        pattern_recognition: 80
      }
    });
  });
  
  // Serve SPA for all other routes
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    res.sendFile(indexPath);
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pickle+ server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
    console.log(`Static files served from: ${publicDir}`);
  });
}

// Start application
setupDatabase();
