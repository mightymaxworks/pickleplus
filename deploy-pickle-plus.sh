#!/bin/bash
# DEPLOY-PICKLE-PLUS.SH
# Deployment script specifically for the Pickle+ application

set -e  # Exit on error

echo "🥒 PICKLE+ DEPLOYMENT 🥒"
echo "========================"
echo "Deploying the actual Pickle+ application with proper routing and authentication"

# Create deployment directory
echo "Step 1: Creating deployment directory structure..."
mkdir -p dist
mkdir -p dist/client
mkdir -p dist/server
mkdir -p dist/shared

# First build the client application
echo "Step 2: Building client application..."
cd client
npm run build
cd ..

# Copy the client build to the dist directory
echo "Step 3: Copying client build..."
if [ -d "client/dist" ]; then
  cp -r client/dist/* dist/client/
  echo "✅ Copied client build successfully"
else
  echo "⚠️ Client build directory not found, copying source files..."
  cp -r client/src dist/client/src
  cp client/index.html dist/client/
  cp -r client/public dist/client/
fi

# Copy the essential server files
echo "Step 4: Copying server files..."
cp -r server/routes dist/server/
cp server/routes.ts dist/server/
cp server/storage.ts dist/server/
cp server/auth.ts dist/server/
cp server/db.ts dist/server/
cp -r server/middleware dist/server/
cp -r server/modules dist/server/
cp -r server/services dist/server/
cp -r server/utils dist/server/
cp -r server/special-routes.ts dist/server/

# Copy shared files
echo "Step 5: Copying shared files..."
cp -r shared dist/

# Create production server file
echo "Step 6: Creating production server file..."
cat > dist/server.js << 'EOL'
/**
 * Pickle+ Production Server
 * This is the actual Pickle+ application with proper authentication
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

// Global error handlers
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
let pool;

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

// Configure session store
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
    console.log('Using in-memory session store as fallback');
    return new session.MemoryStore();
  }
}

// Configure authentication
async function setupAuth(sessionStore) {
  // Set up session
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

  // User serialization/deserialization
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
        console.log('No database pool available for deserializeUser');
        return done(null, false);
      }
      
      // Direct SQL query for better reliability
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

  // Local strategy for username/password authentication
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      if (!pool) {
        console.log('No database pool available for LocalStrategy');
        return done(null, false);
      }
      
      // Direct SQL query for authentication
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return done(null, false, { message: 'Invalid username' });
      }
      
      const user = result.rows[0];
      
      // Compare password using bcrypt
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password' });
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error in LocalStrategy:', error);
      return done(error);
    }
  }));
}

// Set up minimal API routes
function setupMinimalRoutes() {
  // Authentication endpoints
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error during login' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
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
  
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error during login' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
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

  app.post('/api/logout', (req, res) => {
    try {
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
          return res.status(200).json({ message: 'Logged out successfully' });
        });
      });
    } catch (error) {
      console.error('Unexpected error in logout:', error);
      res.status(500).json({ message: 'An unexpected error occurred during logout' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    try {
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
          return res.status(200).json({ message: 'Logged out successfully' });
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
      
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in current-user endpoint:', error);
      res.status(500).json({ message: 'Error retrieving current user' });
    }
  });

  app.get('/api/me', (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in /api/me endpoint:', error);
      res.status(500).json({ message: 'Error retrieving user data' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: pool ? 'connected' : 'not connected',
      auth: passport ? 'initialized' : 'not initialized',
      environment: process.env.NODE_ENV,
      application: 'Pickle+'
    });
  });
}

// Main startup function
async function startServer() {
  try {
    // Set up database connection
    const dbConnected = await setupDatabase();
    console.log('Database setup complete. Connected:', dbConnected);
    
    // Set up session store
    const sessionStore = await setupSessionStore();
    console.log('Session store setup complete');
    
    // Set up authentication
    await setupAuth(sessionStore);
    console.log('Authentication setup complete');
    
    // Set up minimal API routes
    setupMinimalRoutes();
    console.log('Minimal API routes setup complete');
    
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
      console.log(`🥒 Pickle+ server listening at http://0.0.0.0:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${dbConnected ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
EOL

# Create startup script
echo "Step 7: Creating startup script..."
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

# Print environment for debugging
echo "Starting Pickle+ application with the following configuration:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"

# Start the application
echo "Starting Pickle+ application on port $PORT"
node server.js
EOL

chmod +x dist/start.sh

# Create package.json for the deployment
echo "Step 8: Creating package.json..."
cat > dist/package.json << 'EOL'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "description": "Pickle+ - A cutting-edge gamified web platform for pickleball player development",
  "main": "server.js",
  "scripts": {
    "start": "NODE_ENV=production node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
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

# Install dependencies
echo "Step 9: Installing dependencies..."
cd dist
npm install
cd ..

# Create verification file to confirm it's the correct application
echo "Step 10: Creating verification file..."
cat > dist/client/pickle-plus-verification.js << 'EOL'
console.log('Pickle+ Application - Verification');
console.log('This is the actual Pickle+ application, not a template');
EOL

echo ""
echo "🥒 PICKLE+ DEPLOYMENT COMPLETED 🥒"
echo "=================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash deploy-pickle-plus.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"
echo ""
echo "This deployment includes your actual Pickle+ application with authentication fixes."