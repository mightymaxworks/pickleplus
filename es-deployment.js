/**
 * ES Module Compatible Production Server for Pickle+
 * 
 * This file provides a production-ready server that:
 * 1. Uses ES modules (import/export) for compatibility
 * 2. Serves the React frontend
 * 3. Provides API endpoints
 * 4. Connects to the database
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
const PORT = process.env.PORT || 8080;

// Setup CORS
app.use((req, res, next) => {
  const allowedOrigins = ['https://pickle-plus.replit.app', 'https://pickle-plus.app'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
let sessionStore = null;

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, running without database');
    setupMemorySession();
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
      
      // Setup session with PostgreSQL
      try {
        const pgConnect = await import('connect-pg-simple');
        const connectPg = pgConnect.default;
        const PostgresSessionStore = connectPg(session);
        
        sessionStore = new PostgresSessionStore({
          conObject: {
            connectionString: process.env.DATABASE_URL,
          },
          createTableIfMissing: true
        });
        
        console.log('PostgreSQL session store configured');
        setupSession(sessionStore);
      } catch (sessionError) {
        console.error('Failed to configure PostgreSQL session store:', sessionError.message);
        await setupMemorySession();
      }
    } catch (dbError) {
      console.error('Database connection test failed:', dbError.message);
      console.log('Will continue to serve app without database functionality');
      db = null;
      await setupMemorySession();
    }
  } catch (error) {
    console.error('Database setup error:', error.message);
    console.log('Continuing without database connection');
    await setupMemorySession();
  }
}

async function setupMemorySession() {
  try {
    const memorystore = await import('memorystore');
    const MemoryStore = memorystore.default(session);
    
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    console.log('Using memory session store');
    setupSession(sessionStore);
  } catch (error) {
    console.error('Failed to create memory store:', error.message);
    // Continue without session support
    setupRoutes();
  }
}

function setupSession(store) {
  app.use(session({
    store: store,
    secret: process.env.SESSION_SECRET || 'pickle-plus-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  setupRoutes();
}

function setupRoutes() {
  // Serve static files
  const clientDistDir = path.join(__dirname, 'client', 'dist');
  if (fs.existsSync(clientDistDir)) {
    console.log(`Serving static files from ${clientDistDir}`);
    app.use(express.static(clientDistDir));
  }
  
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
  
  // Example leaderboard endpoint
  app.get('/api/leaderboard', (req, res) => {
    res.json([
      { id: 1, name: 'Player 1', wins: 10, losses: 2 },
      { id: 2, name: 'Player 2', wins: 8, losses: 4 },
      { id: 3, name: 'Player 3', wins: 7, losses: 5 }
    ]);
  });
  
  // Serve SPA for all other routes
  app.get('*', (req, res) => {
    const indexPath = path.join(clientDistDir, 'index.html');
    
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