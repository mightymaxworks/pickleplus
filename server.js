/**
 * Pickle+ Production Server for React App
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import { dirname } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import createMemoryStore from 'memorystore';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crypto functions
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Setup Express app
const app = express();
const PORT = process.env.PORT || 80;

// WebSocket support for Neon database
neonConfig.webSocketConstructor = ws;

// Setup CORS
app.use(cors());

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
let db = null;

const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // 24 hours
});

// Setup session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Setup Passport authentication
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  if (!db) return done(null, null);
  
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) return done(null, null);
    return done(null, result.rows[0]);
  } catch (error) {
    return done(error);
  }
});

passport.use(new LocalStrategy(async (username, password, done) => {
  if (!db) return done(null, false, { message: 'Database not available' });
  
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) return done(null, false, { message: 'User not found' });
    
    const user = result.rows[0];
    if (!(await comparePasswords(password, user.password))) {
      return done(null, false, { message: 'Incorrect password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, running without database');
    setupRoutes();
    return;
  }
  
  try {
    console.log('Setting up database connection...');
    
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
    db = null;
    setupRoutes();
  }
}

function setupRoutes() {
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
  
  // Auth endpoints
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });
  
  app.post('/api/logout', (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.sendStatus(200);
    });
  });
  
  app.get('/api/auth/current-user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
  
  // Serve static client files - Vite build output
  const clientBuildDir = path.join(__dirname, 'dist', 'client');
  
  if (fs.existsSync(clientBuildDir)) {
    console.log(`Serving static files from ${clientBuildDir}`);
    app.use(express.static(clientBuildDir));
    
    // Serve SPA for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildDir, 'index.html'));
    });
  } else {
    console.error(`Client build directory not found: ${clientBuildDir}`);
    // Fallback to serving the public directory if it exists
    const publicDir = path.join(__dirname, 'public');
    
    if (fs.existsSync(publicDir)) {
      console.log(`Falling back to serving static files from ${publicDir}`);
      app.use(express.static(publicDir));
    } else {
      // Create a simple index.html if no client build is found
      app.get('*', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Pickle+ Platform</title>
            <style>
              body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              .error { color: #e53e3e; padding: 1rem; border: 1px solid #e53e3e; border-radius: 0.25rem; }
            </style>
          </head>
          <body>
            <h1>Pickle+ Platform</h1>
            <div class="error">
              <p><strong>Error:</strong> Client build not found.</p>
              <p>Please check that the build process completed successfully.</p>
            </div>
          </body>
          </html>
        `);
      });
    }
  }
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pickle+ server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  });
}

// Start application
setupDatabase();
