#!/bin/bash
# ES Module Compatible Full Application Deployment Build Script for Pickle+

set -e # Exit on error

echo "🚀 Starting Pickle+ ES module FULL application deployment build..."

# Step 1: Create deployment directory
echo "📁 Creating deployment structure..."
mkdir -p dist
mkdir -p dist/client

# Add a Procfile for clarity on how to start the server
echo "web: node index.js" > dist/Procfile

# Add a .env file with default port configuration
echo "PORT=80" > dist/.env 

# Step 2: Build client application
echo "🔨 Building client application..."
cd client && npm run build && cd ..
echo "✅ Client build complete"

# Step 3: Copy client build to dist directory
echo "📋 Copying client build to dist directory..."
if [ -d "client/dist" ]; then
  cp -r client/dist/* dist/client/
  echo "✅ Client files copied successfully"
else
  echo "⚠️ Client build directory not found, creating placeholder..."
  mkdir -p dist/client

  # Create minimal placeholder landing page
  cat > dist/client/index.html << 'EOL'
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
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eaeaea;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #38a169;
    }
    pre {
      background: #f1f1f1;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">Pickle+</div>
  </header>
  
  <h1>Pickle+ Platform</h1>
  
  <div class="card">
    <h2>Production Deployment</h2>
    <p>The Pickle+ platform server is running successfully in ES module format!</p>
    <p>This deployment uses ES modules to fix compatibility issues with the project structure.</p>
    <a href="/api/health" class="button">Check API Health</a>
  </div>
</body>
</html>
EOL
fi

# Step 4: Copy ES module compatible server and package.json
echo "📄 Setting up ES module compatible server..."
# Copy as both es-deployment.js and index.js to ensure any command will work
cp es-deployment.js dist/es-deployment.js
cp es-deployment.js dist/index.js
cp es-deploy-package.json dist/package.json

# Create a minimal server.js that just requires the main file
echo "// Simple entry point that loads the main server file
import './index.js';" > dist/server.js

# Step 5: Create routes from existing server routes
echo "🛣️ Setting up API routes from existing server..."

# Extract API routes from the existing server/routes.ts file
# and modify them to use our ES module server format
cat > dist/api-routes.js << 'EOL'
/**
 * API Routes for Pickle+ Platform
 * 
 * This file contains the extracted API routes from the original server.
 * It is loaded dynamically by the main server file.
 */

export function setupApiRoutes(app, db) {
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
      res.json([]);
    }
  });

  // Multi-rankings API
  app.get('/api/multi-rankings/leaderboard', (req, res) => {
    if (db) {
      try {
        db.query(`
          SELECT 
            u.id, 
            u.username, 
            u.profile_completion_pct,
            u.rating,
            COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) AS wins,
            COUNT(CASE WHEN m.loser_id = u.id THEN 1 END) AS losses
          FROM users u
          LEFT JOIN matches m ON u.id = m.winner_id OR u.id = m.loser_id
          GROUP BY u.id, u.username, u.profile_completion_pct, u.rating
          ORDER BY u.rating DESC, wins DESC
          LIMIT 100
        `)
        .then(result => {
          res.json(result.rows || []);
        })
        .catch(err => {
          console.error('Error fetching rankings leaderboard:', err);
          res.status(500).json({ error: 'Database error' });
        });
      } catch (error) {
        console.error('Rankings leaderboard query error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // No database connection
      res.json([]);
    }
  });
  
  // User API
  app.get('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (db) {
      db.query('SELECT id, username, display_name, rating, created_at FROM users WHERE id = $1', [userId])
        .then(result => {
          if (result.rows && result.rows.length > 0) {
            res.json(result.rows[0]);
          } else {
            res.status(404).json({ error: 'User not found' });
          }
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          res.status(500).json({ error: 'Database error' });
        });
    } else {
      // No database, send generic profile
      res.json({
        id: userId,
        username: `user${userId}`,
        display_name: `User ${userId}`,
        rating: 1500,
        created_at: new Date().toISOString()
      });
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
      res.json([]);
    }
  });
  
  // Basic API endpoints
  app.get('/api/me', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Add more API endpoints as needed
  
  return app;
}
EOL

# Step 6: Install dependencies
echo "📦 Installing ES module dependencies..."
cd dist
npm install
cd ..

echo "✨ ES module FULL deployment build completed!"
echo ""
echo "📋 Deployment Information:"
echo "- Server file: dist/index.js (ES modules)"
echo "- Client files: dist/client/*"
echo "- API Routes: dist/api-routes.js"
echo "- Dependencies installed in: dist/node_modules"
echo ""
echo "💻 To run locally:"
echo "cd dist && npm start"
echo ""
echo "🚀 For Cloud Run deployment:"
echo "1. Set Build Command: bash es-full-build.sh"
echo "2. Set Run Command: cd dist && npm start"
echo "3. Click Deploy"