#!/bin/bash
# Direct Build Script for Pickle+
# This creates a deployment directly in the root folder

set -e # Exit on error

echo "🚀 Starting Direct Build for Pickle+ Deployment..."

# Step 1: Create the ES module server file
echo "📄 Creating ES module server file..."
cat > prod-server.js << 'EOL'
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
EOL

# Step 2: Create the public directory and index.html
echo "📁 Creating public directory..."
mkdir -p public

echo "📝 Creating enhanced client interface..."
cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    :root {
      --pickle-green: #38a169;
      --pickle-light: #f0fff4;
    }
    .bg-pickle-green { background-color: var(--pickle-green); }
    .text-pickle-green { color: var(--pickle-green); }
    .border-pickle-green { border-color: var(--pickle-green); }
    .hover-pickle-green:hover { background-color: var(--pickle-green); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm py-3">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <div class="flex items-center">
        <div class="text-2xl font-bold text-pickle-green">Pickle+</div>
      </div>
      <div class="flex space-x-6">
        <a href="/" class="text-gray-700 hover:text-pickle-green font-medium">Home</a>
        <a href="/matches" class="text-gray-700 hover:text-pickle-green font-medium">Matches</a>
        <a href="/leaderboard" class="text-gray-700 hover:text-pickle-green font-medium">Leaderboard</a>
        <a href="/tournaments" class="text-gray-700 hover:text-pickle-green font-medium">Tournaments</a>
      </div>
      <div>
        <a href="/profile" class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-pickle-green text-white flex items-center justify-center font-semibold">
            U
          </div>
          <span class="text-gray-700 font-medium" id="username">User</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h1 class="text-3xl font-bold text-pickle-green mb-2">Welcome to Pickle+</h1>
      <p class="text-gray-600">The premier platform for pickleball players to track matches, join tournaments, and connect with the community.</p>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Leaderboard Card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Leaderboard</h2>
          <a href="/leaderboard" class="text-sm text-pickle-green hover:underline">View all</a>
        </div>
        <div class="space-y-3" id="leaderboard-container">
          <p class="text-gray-500 text-center py-4">Loading leaderboard data...</p>
        </div>
      </div>
      
      <!-- Recent Matches Card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Recent Matches</h2>
          <a href="/matches" class="text-sm text-pickle-green hover:underline">View all</a>
        </div>
        <div class="space-y-3" id="matches-container">
          <p class="text-gray-500 text-center py-4">Loading match data...</p>
        </div>
      </div>
      
      <!-- Upcoming Tournaments Card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Tournaments</h2>
          <a href="/tournaments" class="text-sm text-pickle-green hover:underline">View all</a>
        </div>
        <div class="space-y-3" id="tournaments-container">
          <p class="text-gray-500 text-center py-4">Loading tournament data...</p>
        </div>
      </div>
    </div>
    
    <!-- Status Section -->
    <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold mb-4">System Status</h2>
      <div id="status-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-gray-50 p-4 rounded border">
          <div class="text-sm font-medium text-gray-500">API Status</div>
          <div id="api-status" class="mt-1 font-semibold">Checking...</div>
        </div>
        <div class="bg-gray-50 p-4 rounded border">
          <div class="text-sm font-medium text-gray-500">Database</div>
          <div id="db-status" class="mt-1 font-semibold">Checking...</div>
        </div>
        <div class="bg-gray-50 p-4 rounded border">
          <div class="text-sm font-medium text-gray-500">Port</div>
          <div id="port-status" class="mt-1 font-semibold">Checking...</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-white mt-12 py-8 border-t">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <div>
          <h3 class="text-xl font-bold text-pickle-green">Pickle+</h3>
          <p class="text-gray-600 mt-2">The platform for pickleball enthusiasts</p>
        </div>
        <div class="mt-4 md:mt-0">
          <div class="flex space-x-6">
            <a href="/" class="text-gray-600 hover:text-pickle-green">Home</a>
            <a href="/matches" class="text-gray-600 hover:text-pickle-green">Matches</a>
            <a href="/leaderboard" class="text-gray-600 hover:text-pickle-green">Leaderboard</a>
            <a href="/api/health" class="text-gray-600 hover:text-pickle-green">API Health</a>
          </div>
        </div>
      </div>
      <div class="mt-8 border-t border-gray-200 pt-4 text-gray-500 text-sm">
        &copy; 2025 Pickle+. All rights reserved.
      </div>
    </div>
  </footer>

  <script>
    // Fetch user data
    fetch('/api/auth/current-user')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Not authenticated');
      })
      .then(userData => {
        document.getElementById('username').textContent = userData.username || 'User';
      })
      .catch(error => {
        console.log('User not authenticated:', error);
      });
    
    // Fetch leaderboard data
    fetch('/api/leaderboard')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('leaderboard-container');
        if (data && data.length > 0) {
          container.innerHTML = '';
          data.slice(0, 5).forEach(player => {
            container.innerHTML += `
              <div class="flex justify-between items-center border-b border-gray-100 py-2">
                <span class="font-medium">${player.name}</span>
                <span class="bg-gray-100 px-2 py-1 rounded text-sm">${player.wins}-${player.losses}</span>
              </div>
            `;
          });
        } else {
          container.innerHTML = '<p class="text-gray-500 text-center py-4">No leaderboard data available</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching leaderboard:', error);
        document.getElementById('leaderboard-container').innerHTML = 
          '<p class="text-red-500 text-center py-4">Error loading leaderboard</p>';
      });
      
    // Fetch match history
    fetch('/api/match/history')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('matches-container');
        if (data && data.length > 0) {
          container.innerHTML = '';
          data.slice(0, 5).forEach(match => {
            const date = new Date(match.created_at).toLocaleDateString();
            container.innerHTML += `
              <div class="border-b border-gray-100 py-2">
                <div class="flex justify-between">
                  <span class="font-medium">${match.winner_username}</span>
                  <span class="font-medium">${match.winner_score}</span>
                </div>
                <div class="flex justify-between text-gray-500">
                  <span>${match.loser_username}</span>
                  <span>${match.loser_score}</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">${date}</div>
              </div>
            `;
          });
        } else {
          container.innerHTML = '<p class="text-gray-500 text-center py-4">No match data available</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching matches:', error);
        document.getElementById('matches-container').innerHTML = 
          '<p class="text-red-500 text-center py-4">Error loading matches</p>';
      });
      
    // Fetch tournaments
    fetch('/api/tournaments')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('tournaments-container');
        if (data && data.length > 0) {
          container.innerHTML = '';
          data.slice(0, 3).forEach(tournament => {
            const startDate = new Date(tournament.start_date).toLocaleDateString();
            container.innerHTML += `
              <div class="border-b border-gray-100 py-2">
                <div class="font-medium">${tournament.name}</div>
                <div class="text-sm text-gray-600">${tournament.location}</div>
                <div class="flex justify-between mt-1">
                  <span class="text-xs text-gray-400">${startDate}</span>
                  <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">${tournament.participant_count} players</span>
                </div>
              </div>
            `;
          });
        } else {
          container.innerHTML = '<p class="text-gray-500 text-center py-4">No tournaments available</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching tournaments:', error);
        document.getElementById('tournaments-container').innerHTML = 
          '<p class="text-red-500 text-center py-4">Error loading tournaments</p>';
      });

    // Check API health
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('API Health:', data);
        document.getElementById('api-status').textContent = 'Connected';
        document.getElementById('api-status').classList.add('text-green-600');
        
        document.getElementById('db-status').textContent = data.database === 'connected' ? 'Connected' : 'Not Connected';
        document.getElementById('db-status').classList.add(data.database === 'connected' ? 'text-green-600' : 'text-yellow-600');
        
        document.getElementById('port-status').textContent = data.port;
        document.getElementById('port-status').classList.add('text-green-600');
      })
      .catch(error => {
        console.error('Error checking API health:', error);
        document.getElementById('api-status').textContent = 'Error';
        document.getElementById('api-status').classList.add('text-red-600');
      });
  </script>
</body>
</html>
EOL

# Step 3: Create a package.json file
echo "📄 Creating package.json file..."
cat > package.json.deployment << 'EOL'
{
  "name": "pickle-plus",
  "version": "1.0.0",
  "description": "Pickle+ Platform Production Deployment",
  "type": "module",
  "main": "prod-server.js",
  "scripts": {
    "start": "node prod-server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "express": "^4.18.2",
    "express-session": "^1.18.0",
    "ws": "^8.14.2"
  }
}
EOL

# Step 4: Create a Procfile for Cloud Run
echo "📄 Creating Procfile..."
echo "web: node prod-server.js" > Procfile

# Step 5: Create .env file
echo "📄 Creating .env file..."
echo "PORT=80" > .env

echo "✨ Direct build completed successfully!"
echo ""
echo "📋 Deployment Information:"
echo "- All files created in the root directory"
echo "- Server: prod-server.js"
echo "- Client: public/index.html"
echo "- Package: package.json.deployment"
echo ""
echo "💻 To test locally:"
echo "node prod-server.js"
echo ""
echo "🚀 For Replit Deployment:"
echo "1. Build Command: bash direct-build.sh"
echo "2. Run Command: node prod-server.js"
echo "3. Click Deploy"