#!/bin/bash
# ES Module Vite Build Script for Pickle+

set -e # Exit on error

echo "🚀 Starting Pickle+ ES module deployment with Vite build..."

# Step 1: Create dist and client directories
echo "📁 Creating deployment structure..."
mkdir -p dist

# Add a Procfile for clarity on how to start the server
echo "web: node index.js" > dist/Procfile

# Add a .env file with default port configuration
echo "PORT=80" > dist/.env 

# Step 2: Run vite build for the client
echo "🔨 Building client application with Vite..."
cd client && npm run build
echo "✅ Client build complete"

# Step 3: Copy built client to deployment directory
echo "📋 Copying built client to deployment directory..."
mkdir -p dist/client
cp -r dist/* dist/client/
cd ..
echo "✅ Client files copied successfully"

# Step 4: Copy ES module compatible server and package.json
echo "📄 Setting up ES module compatible server..."
cp es-deployment.js dist/index.js
cp es-deploy-package.json dist/package.json

# Create API routes file
echo "🛣️ Setting up API routes..."
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
      res.json([
        { id: 1, winner_id: 1, loser_id: 2, winner_username: 'Player 1', loser_username: 'Player 2', winner_score: 11, loser_score: 5, created_at: new Date().toISOString() },
        { id: 2, winner_id: 3, loser_id: 1, winner_username: 'Player 3', loser_username: 'Player 1', winner_score: 11, loser_score: 9, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, winner_id: 1, loser_id: 4, winner_username: 'Player 1', loser_username: 'Player 4', winner_score: 11, loser_score: 7, created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);
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
      res.json([
        { id: 1, username: 'Player 1', rating: 1650, profile_completion_pct: 95, wins: 8, losses: 2 },
        { id: 2, username: 'Player 2', rating: 1580, profile_completion_pct: 85, wins: 6, losses: 3 },
        { id: 3, username: 'Player 3', rating: 1540, profile_completion_pct: 75, wins: 5, losses: 4 },
        { id: 4, username: 'Player 4', rating: 1510, profile_completion_pct: 90, wins: 4, losses: 4 },
        { id: 5, username: 'Player 5', rating: 1490, profile_completion_pct: 70, wins: 3, losses: 5 }
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
  
  return app;
}
EOL

# Step 5: Install dependencies
echo "📦 Installing ES module dependencies..."
cd dist
npm install
cd ..

echo "✨ ES module Vite deployment build completed!"
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
echo "1. Set Build Command: bash es-vite-build.sh"
echo "2. Set Run Command: cd dist && node index.js"
echo "3. Click Deploy"