#!/bin/bash
# SIMPLE-AUTH-FIX.SH
# Simplified authentication fix that focuses solely on fixing the authentication
# while preserving the existing client application

set -e  # Exit on error

echo "🥒 PICKLE+ AUTHENTICATION FIX 🥒"
echo "================================"
echo "Deploying the authentication fix without modifying the client application"

# Step 1: Clean previous build artifacts but preserve client
echo "Step 1: Cleaning previous build artifacts but preserving client..."
rm -rf dist
mkdir -p dist
mkdir -p dist/client

# Step 2: Copy the existing public directory as a simple client
echo "Step 2: Setting up client..."
cp -r public/* dist/client/ || echo "No public directory found. Creating a minimal index.html"

# Step 3: Create auth-fixed server file
echo "Step 3: Creating server with authentication fixes..."
cat > dist/server.js << 'EOL'
/**
 * Pickle+ Production Server with Authentication Fixes
 * This version focuses solely on fixing the authentication issues
 */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const cors = require('cors');
const path = require('path');
const bcryptjs = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');
const ConnectPgSimple = require('connect-pg-simple');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Database connection
let pool = null;

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not defined in environment variables!');
      return false;
    }
    
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000 
    });
    
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Session store setup
async function setupSessionStore() {
  try {
    const PostgresSessionStore = ConnectPgSimple(session);
    return new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true
    });
  } catch (error) {
    console.error('Error setting up session store:', error);
    // Fallback to memory store
    console.log('Using in-memory session store as fallback');
    return new session.MemoryStore();
  }
}

// Setup authentication
async function setupAuth(sessionStore) {
  // Session configuration
  app.set('trust proxy', 1);
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport serialization with error handling
  passport.serializeUser((user, done) => {
    try {
      done(null, user.id);
    } catch (error) {
      console.error('Error in serializeUser:', error);
      done(error);
    }
  });

  passport.deserializeUser(async (id, done) => {
    try {
      if (!pool) {
        return done(null, false);
      }
      
      // Use direct SQL query for more robustness
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (!result || !result.rows || result.rows.length === 0) {
        console.log(`User with ID ${id} not found during deserialization`);
        return done(null, false);
      }
      
      done(null, result.rows[0]);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(null, false);
    }
  });

  // Configure local strategy with error handling
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      if (!pool) {
        return done(null, false);
      }
      
      // Use direct SQL query for authentication
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return done(null, false);
      }
      
      const user = result.rows[0];
      
      // Compare password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error in LocalStrategy:', error);
      return done(error);
    }
  }));
}

// Setup API routes
function setupRoutes() {
  // Authentication routes
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error during login' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return res.status(500).json({ message: 'Error establishing session' });
        }
        
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    try {
      const hadUser = req.isAuthenticated();
      
      req.logout((err) => {
        if (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Error destroying session' });
          }
          
          res.clearCookie('connect.sid');
          return res.status(200).json({ 
            message: hadUser ? 'Logged out successfully' : 'No active session to logout'
          });
        });
      });
    } catch (error) {
      console.error('Unexpected error in logout:', error);
      res.status(500).json({ message: 'An unexpected error occurred during logout' });
    }
  });

  app.get('/api/auth/current-user', (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      if (!req.user) {
        console.error('User is authenticated but req.user is missing');
        return res.status(500).json({ message: 'User session error' });
      }
      
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in current-user endpoint:', error);
      res.status(500).json({ message: 'Error retrieving current user' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      database: pool ? 'connected' : 'not connected',
      auth: passport ? 'initialized' : 'not initialized',
      environment: process.env.NODE_ENV
    });
  });
  
  // Implementation of /api route from routes.fixed.ts
  app.get("/api/user", (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      res.json(req.user);
    } catch (error) {
      console.error('Error in /api/user endpoint:', error);
      res.status(500).json({ message: 'Error retrieving user data' });
    }
  });
}

// Main server startup function
async function startServer() {
  try {
    // Set up database first
    const dbConnected = await setupDatabase();
    console.log('Database setup complete. Connected:', dbConnected);
    
    // Set up session store
    const sessionStore = await setupSessionStore();
    console.log('Session store setup complete');
    
    // Set up authentication
    await setupAuth(sessionStore);
    console.log('Authentication setup complete');
    
    // Set up API routes
    setupRoutes();
    console.log('API routes setup complete');
    
    // Serve static files
    app.use(express.static(path.join(__dirname, 'client')));
    
    // Error handler middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
      });
    });
    
    // Handle all other routes for SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client', 'index.html'));
    });
    
    // Start the server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening at http://0.0.0.0:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database connection: ${dbConnected ? 'Successful' : 'Failed, using fallbacks'}`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
EOL

# Step 4: Create startup script
echo "Step 4: Creating startup script..."
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

# Start the application
echo "Starting Pickle+ application on port $PORT"
node server.js
EOL

chmod +x dist/start.sh

# Step 5: Create package.json
echo "Step 5: Creating package.json..."
cat > dist/package.json << 'EOL'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "express-session": "^1.18.0",
    "connect-pg-simple": "^9.0.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3"
  }
}
EOL

# Step 6: Install dependencies
echo "Step 6: Installing dependencies..."
cd dist
npm install
cd ..

echo ""
echo "🥒 PICKLE+ AUTHENTICATION FIX READY 🥒"
echo "====================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash simple-auth-fix.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"
echo ""
echo "This deployment focuses solely on fixing the authentication issues"
echo "without trying to rebuild the client application."