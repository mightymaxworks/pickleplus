/**
 * Pickle+ Production Server - ES Module Version
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { dirname } from 'path';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Express app
const app = express();
const PORT = process.env.PORT || 80;

// Setup CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir));
  
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
      res.status(401).json({ message: "Not authenticated" });
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
              { id: 1, name: 'Player 1', wins: 10, losses: 2 },
              { id: 2, name: 'Player 2', wins: 8, losses: 4 },
              { id: 3, name: 'Player 3', wins: 7, losses: 5 }
            ]);
          }
        })
        .catch(err => {
          console.error('Error fetching leaderboard:', err);
          // Fall back to sample data on error
          res.json([
            { id: 1, name: 'Player 1', wins: 10, losses: 2 },
            { id: 2, name: 'Player 2', wins: 8, losses: 4 },
            { id: 3, name: 'Player 3', wins: 7, losses: 5 }
          ]);
        });
      } catch (error) {
        console.error('Leaderboard query error:', error);
        res.json([
          { id: 1, name: 'Player 1', wins: 10, losses: 2 },
          { id: 2, name: 'Player 2', wins: 8, losses: 4 },
          { id: 3, name: 'Player 3', wins: 7, losses: 5 }
        ]);
      }
    } else {
      // No database connection, use sample data
      res.json([
        { id: 1, name: 'Player 1', wins: 10, losses: 2 },
        { id: 2, name: 'Player 2', wins: 8, losses: 4 },
        { id: 3, name: 'Player 3', wins: 7, losses: 5 }
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
      // No database connection
      res.json([
        { id: 1, winner_id: 1, loser_id: 2, winner_username: 'Player 1', loser_username: 'Player 2', winner_score: 11, loser_score: 5, created_at: new Date().toISOString() },
        { id: 2, winner_id: 3, loser_id: 1, winner_username: 'Player 3', loser_username: 'Player 1', winner_score: 11, loser_score: 9, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, winner_id: 1, loser_id: 4, winner_username: 'Player 1', loser_username: 'Player 4', winner_score: 11, loser_score: 7, created_at: new Date(Date.now() - 172800000).toISOString() }
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
      // No database connection
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      res.json([
        { 
          id: 1, 
          name: 'Pickle+ Championship', 
          description: 'The premier tournament for Pickle+ players',
          start_date: tomorrow.toISOString(),
          end_date: nextWeek.toISOString(),
          location: 'City Sports Center',
          format: 'Double Elimination',
          participant_count: 16
        },
        {
          id: 2,
          name: 'Regional Qualifier',
          description: 'Qualify for the national championship',
          start_date: nextWeek.toISOString(),
          end_date: new Date(nextWeek.getTime() + 86400000*2).toISOString(),
          location: 'Community Park Courts',
          format: 'Round Robin',
          participant_count: 12
        }
      ]);
    }
  });
  
  // Serve SPA for all other routes
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fall back to a simple HTML page
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      background-color: #f8fafb;
      color: #333;
    }
    h1, h2 { color: #38a169; }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 2rem;
      margin: 2rem 0;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .button {
      display: inline-block;
      background-color: #38a169;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <h1>Pickle+ Platform</h1>
  
  <div class="card">
    <h2>Production Server Running</h2>
    <p>The server is running correctly, but client files were not found.</p>
    <p>Current server port: ${PORT}</p>
    <p>Database status: ${db ? 'Connected' : 'Not connected'}</p>
    <a href="/api/health" class="button">Check API Health</a>
  </div>
</body>
</html>
      `);
    }
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pickle+ server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  });
}

// Start application
setupDatabase();
