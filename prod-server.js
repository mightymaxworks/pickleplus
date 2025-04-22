/**
 * Pickle+ Production Server
 * 
 * This server provides a production-ready environment that:
 * 1. Serves the React frontend
 * 2. Provides API endpoints
 * 3. Handles database connections properly
 * 4. Uses the correct port and host configuration for Cloud Run
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Database connection
let db = null;
if (process.env.DATABASE_URL) {
  try {
    // Only require database modules if DATABASE_URL is available
    const { Pool } = require('@neondatabase/serverless');
    const { drizzle } = require('drizzle-orm/neon-serverless');

    // Set up database connection
    console.log('Setting up database connection...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool });
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    console.log('Continuing without database connection');
  }
}

// Middleware
app.use(express.json());

// Serve static files from client/dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: db ? 'connected' : 'not connected',
    server: 'Pickle+ Production',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoint for database status
app.get('/api/db-status', async (req, res) => {
  if (!db) {
    return res.status(503).json({ 
      status: 'not_connected',
      message: 'Database connection not available',
      time: new Date().toISOString()
    });
  }

  try {
    // Simple query to check if the database is responding
    const result = await db.execute('SELECT NOW()');
    
    res.json({
      status: 'connected',
      time: new Date().toISOString(),
      server_time: result.rows ? result.rows[0].now : 'unknown'
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message,
      time: new Date().toISOString()
    });
  }
});

// For all other requests, serve the React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback if the index.html file is not found
    res.status(404).send(`
      <html>
        <head>
          <title>Pickle+ Platform</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 650px; margin: 0 auto; padding: 2rem; }
            .card { background: #f8f9fa; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #38a169; }
            .error { background: #fed7d7; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Pickle+ Platform</h1>
            <div class="error">
              <strong>Error:</strong> Frontend build files not found. The application may not have been built correctly.
            </div>
            <p>Server is running and healthy. API endpoints are available at:</p>
            <ul>
              <li><code>/api/health</code> - Server health status</li>
              <li><code>/api/db-status</code> - Database connection status</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  console.log(`Current time: ${new Date().toISOString()}`);
});