#!/bin/bash
# BUILD-AND-DEPLOY.SH
# Complete build and deployment script for Pickle+ that packages the actual client application

set -e  # Exit on error

echo "🥒 PICKLE+ BUILD AND DEPLOYMENT 🥒"
echo "=================================="
echo "Building and deploying the complete application with client"

# Step 1: Clean previous build artifacts
echo "Step 1: Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist

# Step 2: Build the client application
echo "Step 2: Building the client application..."
npm run build

# Step 3: Create server file with authentication fixes
echo "Step 3: Creating production server with authentication fixes..."
cat > dist/server.js << 'EOL'
/**
 * Pickle+ Production Server with Authentication Fixes
 */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const cors = require('cors');
const path = require('path');
const bcryptjs = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ConnectPgSimple = require('connect-pg-simple');
const ws = require('ws');

// Initialize the app
const app = express();
const port = process.env.PORT || 5000;

// Add global error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Database connection with retry mechanism
let db = null;
let pool = null;

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not defined in environment variables');
      return false;
    }
    
    // Create the pool
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000
    });
    
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful');
    
    // Create a simple schema definition
    const schema = {
      users: {
        id: { name: 'id' },
        username: { name: 'username' },
        password: { name: 'password' },
        email: { name: 'email' }
      }
    };
    
    db = drizzle({ client: pool, schema });
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Session store setup with fallback
async function setupSessionStore() {
  try {
    // Try to use PostgreSQL session store
    const PostgresSessionStore = ConnectPgSimple(session);
    const store = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true
    });
    
    console.log('PostgreSQL session store initialized');
    return store;
  } catch (error) {
    console.error('Error setting up PostgreSQL session store:', error);
    
    // Fall back to memory store
    console.log('Falling back to memory session store');
    const MemoryStore = session.MemoryStore;
    return new MemoryStore();
  }
}

// Authentication setup
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
      
      // Use direct SQL query to be more robust
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      
      if (!result || !result.rows || result.rows.length === 0) {
        console.log(`User with ID ${id} not found during deserialization`);
        return done(null, false);
      }
      
      const user = result.rows[0];
      done(null, user);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(null, false);
    }
  });

  // Configure local strategy
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
      
      // Compare password with bcrypt
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

// Set up API routes
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
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(200).json({ message: 'No active session to logout' });
      }
      
      req.logout((err) => {
        if (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        
        if (req.session) {
          req.session.destroy((err) => {
            if (err) {
              console.error('Error destroying session:', err);
              return res.status(500).json({ message: 'Error destroying session' });
            }
            
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logged out successfully' });
          });
        } else {
          res.clearCookie('connect.sid');
          return res.status(200).json({ message: 'Logged out successfully (no session)' });
        }
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
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = req.user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in current-user endpoint:', error);
      res.status(500).json({ message: 'Error retrieving current user' });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: db ? 'connected' : 'not connected',
      auth: passport ? 'initialized' : 'not initialized',
      environment: process.env.NODE_ENV
    });
  });
}

// Main function to start the server
async function startServer() {
  try {
    // Set up database
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
      console.log(`Database connection: ${dbConnected ? 'Successful' : 'Failed'}`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
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

# Ensure DATABASE_URL is available
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set! The application may not function correctly."
fi

# Start the application
echo "Starting Pickle+ application on port $PORT"
node server.js
EOL

chmod +x dist/start.sh

# Step 5: Update package.json
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
    "drizzle-orm": "^0.29.5",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "express-session": "^1.18.0",
    "connect-pg-simple": "^9.0.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "ws": "^8.14.2"
  }
}
EOL

# Step 6: Install dependencies
echo "Step 6: Installing dependencies..."
cd dist
npm install
cd ..

echo "🥒 PICKLE+ BUILD AND DEPLOYMENT COMPLETE 🥒"
echo "==========================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash build-and-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"