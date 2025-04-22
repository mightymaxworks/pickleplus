/**
 * Pickle+ Production Server
 * This file provides a simplified production deployment that serves your built client application
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database connection if available
let db = null;
let dbConnected = false;
try {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Store pool for use in routes
    db = pool;
    
    // Test database connection
    db.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Database connected successfully');
        dbConnected = true;
      }
    });
  } else {
    console.log('No DATABASE_URL found, skipping database initialization');
  }
} catch (error) {
  console.error('Error initializing database:', error.message);
}

// Middleware
app.use(express.json());

// Serve static files
const clientDistDir = path.join(__dirname, 'client', 'dist');
const publicDir = path.join(__dirname, 'public');

// Check if we have a client/dist directory to serve
if (fs.existsSync(clientDistDir)) {
  console.log(`Serving client build from ${clientDistDir}`);
  app.use(express.static(clientDistDir));
} else if (fs.existsSync(publicDir)) {
  console.log(`Serving public directory from ${publicDir}`);
  app.use(express.static(publicDir));
} else {
  console.log('No static files found to serve');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: dbConnected ? 'connected' : 'not connected',
    server: 'Pickle+ App Server',
    time: new Date().toISOString()
  });
});

// Create placeholder API routes to mimic basic app functionality
app.get('/api/user', (req, res) => {
  res.json({
    id: 1,
    username: 'demo',
    firstName: 'Demo',
    lastName: 'User',
    profileCompletionPct: 85,
    email: 'demo@example.com'
  });
});

app.get('/api/matches/recent', (req, res) => {
  res.json([
    { id: 1, date: new Date().toISOString(), score: '11-9, 11-7', opponent: 'Player 1', result: 'win' },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString(), score: '9-11, 8-11', opponent: 'Player 2', result: 'loss' }
  ]);
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  // Try to serve index.html from client/dist first
  const clientIndexPath = path.join(clientDistDir, 'index.html');
  const publicIndexPath = path.join(publicDir, 'index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    // Fall back to a generated page
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    :root {
      --primary: #38a169;
      --primary-dark: #2f855a;
      --background: #f7fafc;
      --card: #ffffff;
      --text: #2d3748;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--background);
      color: var(--text);
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2 { color: var(--primary); }
    .card {
      background-color: var(--card);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    .status-dot {
      width: 12px;
      height: 12px;
      background-color: ${dbConnected ? '#38a169' : '#e53e3e'};
      border-radius: 50%;
      margin-right: 8px;
    }
    code {
      background-color: #f1f1f1;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>Pickle+ Platform</h1>
  
  <div class="card">
    <h2>Application Status</h2>
    <div class="status">
      <div class="status-dot"></div>
      <div>Server: Running</div>
    </div>
    <div class="status">
      <div class="status-dot" style="background-color: ${dbConnected ? '#38a169' : '#e53e3e'};"></div>
      <div>Database: ${dbConnected ? 'Connected' : 'Not Connected'}</div>
    </div>
    <p>The server is running on port ${PORT}.</p>
    <p>Environment: ${process.env.NODE_ENV || 'production'}</p>
  </div>
  
  <div class="card">
    <h2>Available Endpoints</h2>
    <ul>
      <li><code>/api/health</code> - Server health check</li>
      <li><code>/api/user</code> - Sample user data</li>
      <li><code>/api/matches/recent</code> - Sample match data</li>
    </ul>
  </div>
  
  <div class="card">
    <h2>Next Steps</h2>
    <p>To deploy the full application:</p>
    <ol>
      <li>Build the client application (<code>cd client && npm run build</code>)</li>
      <li>Ensure the static files are being served correctly</li>
      <li>Connect to the database by setting the <code>DATABASE_URL</code> environment variable</li>
    </ol>
  </div>
  
  <script>
    // Check the health endpoint
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('Health check:', data);
      })
      .catch(error => {
        console.error('Error checking health:', error);
      });
  </script>
</body>
</html>
    `);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Production Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database: ${dbConnected ? 'Connected' : 'Not connected'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});