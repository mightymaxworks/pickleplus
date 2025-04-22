/**
 * Pickle+ Production Server
 * This file provides a simplified production deployment
 * that connects to the database and serves essential features
 */

const express = require('express');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

// Initialize Express
const app = express();
app.use(express.json());

// Database connection
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found - database features will not work');
}

let pool = null;
let db = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log('Database connection initialized');
    
    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Database connection test failed:', err);
      } else {
        console.log('Database connection successful. Server time:', res.rows[0].now);
      }
    });
  }
} catch (error) {
  console.error('Failed to initialize database:', error);
}

// Session setup
if (pool) {
  app.use(session({
    store: new pgSession({
      pool,
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));
  console.log('Session middleware configured with database store');
} else {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
    resave: false,
    saveUninitialized: false
  }));
  console.log('Session middleware configured with memory store (fallback)');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: !!pool ? 'connected' : 'not_connected',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Simple API route to test database if connected
app.get('/api/db-test', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      status: 'ok', 
      db_time: result.rows[0].time,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database query failed',
      error: error.message
    });
  }
});

// Static file serving - this folder would contain your built frontend
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));

// Fallback route - serves index.html for all other routes
app.get('*', (req, res) => {
  // Simple landing page in case the static files aren't available
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pickle+ Platform</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f8fa;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 30px;
          margin-top: 50px;
        }
        h1 {
          color: #38a169;
          margin-top: 0;
        }
        .details {
          background-color: #f0fff4;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .api-section {
          margin-top: 30px;
        }
        .api-url {
          background-color: #f0f4ff;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pickle+ Platform</h1>
        
        <p>The Pickle+ Platform has been successfully deployed! This page serves as a temporary landing page.</p>
        
        <div class="details">
          <h2>Deployment Information:</h2>
          <ul>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'Not set'}</li>
            <li><strong>Server Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Database Connection:</strong> ${pool ? 'Initialized' : 'Not connected'}</li>
          </ul>
        </div>
        
        <div class="api-section">
          <h2>API Health Check:</h2>
          <p>You can check the API status at:</p>
          <div class="api-url">/api/health</div>
          <p>Test the database connection:</p>
          <div class="api-url">/api/db-test</div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Pickle+ Platform</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Set the port - use the PORT environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Production Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${pool ? 'Connected' : 'Not connected'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});