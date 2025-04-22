#!/bin/bash
# DEPLOY-FOOLPROOF.SH
# A simplified and reliable deployment script for the Pickle+ application

set -e  # Exit on error

echo "🥒 PICKLE+ RELIABLE DEPLOYMENT 🥒"
echo "================================="
echo "Deploying the Pickle+ application with a simplified approach"

# Step 1: Create distribution directory
echo "Step 1: Creating dist directory..."
mkdir -p dist

# Step 2: Copy essential server code into a CJS file
echo "Step 2: Creating production server file..."
cat > dist/server.js << 'EOL'
/**
 * Pickle+ Production Server
 * A simplified server that handles authentication and serves the client app
 */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcryptjs = require('bcryptjs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('@neondatabase/serverless');
const MemoryStore = require('memorystore')(session);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Replit uses port 5000 for deployment

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Initialize database connection
let db = null;

async function initDatabase() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set!');
      return false;
    }
    
    // Create database pool
    db = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000 
    });
    
    // Test connection
    const client = await db.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Setup authentication
function setupAuthentication() {
  // Session configuration with fallback to MemoryStore
  const store = new MemoryStore({
    checkPeriod: 86400000 // 24 hours
  });
  
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'pickle-plus-secret-key',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false,
      httpOnly: true
    }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // User serialization
  passport.serializeUser((user, done) => {
    try {
      done(null, user.id);
    } catch (error) {
      console.error('Error in serializeUser:', error);
      done(error);
    }
  });
  
  // User deserialization with robust error handling
  passport.deserializeUser(async (id, done) => {
    try {
      if (!db) {
        console.error('Database not available during deserializeUser');
        return done(null, false);
      }
      
      // Use direct SQL query for reliability
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      
      if (!result || !result.rows || result.rows.length === 0) {
        console.log(`No user found with ID ${id} during deserialization`);
        return done(null, false);
      }
      
      done(null, result.rows[0]);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(null, false);
    }
  });
  
  // Configure LocalStrategy for authentication
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      if (!db) {
        console.error('Database not available during local authentication');
        return done(null, false);
      }
      
      // Use direct SQL query for authentication
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (!result || !result.rows || result.rows.length === 0) {
        return done(null, false, { message: 'Invalid username' });
      }
      
      const user = result.rows[0];
      
      // Compare password
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

// Setup essential API routes
function setupRoutes() {
  // Login endpoint
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error('Error in req.login:', err);
          return res.status(500).json({ message: 'Error establishing session' });
        }
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  // Support both routes for login for compatibility
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error('Error in req.login:', err);
          return res.status(500).json({ message: 'Error establishing session' });
        }
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  // Logout endpoint
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
          res.status(200).json({ message: 'Logged out successfully' });
        });
      });
    } catch (error) {
      console.error('Unexpected error in logout:', error);
      res.status(500).json({ message: 'An unexpected error occurred during logout' });
    }
  });
  
  // Support both routes for logout for compatibility
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
          res.status(200).json({ message: 'Logged out successfully' });
        });
      });
    } catch (error) {
      console.error('Unexpected error in logout:', error);
      res.status(500).json({ message: 'An unexpected error occurred during logout' });
    }
  });
  
  // Current user endpoint
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
  
  // User info endpoint
  app.get('/api/me', (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in /api/me endpoint:', error);
      res.status(500).json({ message: 'Error retrieving user info' });
    }
  });
  
  // User profile endpoint
  app.get('/api/profile', (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in profile endpoint:', error);
      res.status(500).json({ message: 'Error retrieving profile data' });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = db ? 'connected' : 'not connected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'production',
      application: 'Pickle+'
    });
  });
  
  // Add a fallback API route for unimplemented endpoints
  app.use('/api/*', (req, res) => {
    res.status(501).json({
      message: 'API endpoint not yet implemented in production deployment',
      requestedEndpoint: req.originalUrl
    });
  });
}

// Main function to start the server
async function startServer() {
  try {
    console.log('Starting Pickle+ server...');
    
    // Initialize database
    const dbConnected = await initDatabase();
    console.log('Database initialization complete. Connected:', dbConnected);
    
    // Setup authentication
    setupAuthentication();
    console.log('Authentication setup complete');
    
    // Setup API routes
    setupRoutes();
    console.log('API routes setup complete');
    
    // Serve static assets
    const clientPath = path.join(__dirname, 'client');
    app.use(express.static(clientPath));
    console.log('Serving static files from:', clientPath);
    
    // All other routes should return the main index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    });
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🥒 Pickle+ server running on http://0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`Database connection: ${dbConnected ? 'Successful' : 'Failed'}`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
EOL

# Step 3: Create index.html for client
echo "Step 3: Creating client app directory and files..."
mkdir -p dist/client

cat > dist/client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    .logo {
      width: 150px;
      height: auto;
      margin-bottom: 20px;
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #09f;
      animation: spin 1s linear infinite;
      margin: 20px 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }
    p {
      color: #7f8c8d;
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <h1>Pickle+</h1>
      <div class="spinner"></div>
      <p>Loading your pickleball community platform...</p>
    </div>
  </div>
  <script>
    // This script will be replaced by the React app when it loads
    window.addEventListener('DOMContentLoaded', () => {
      console.log('Pickle+ application loading...');
      
      // Check if the API is available
      fetch('/api/health')
        .then(response => response.json())
        .then(data => {
          console.log('API health check:', data);
        })
        .catch(error => {
          console.error('API health check failed:', error);
        });
    });
  </script>
</body>
</html>
EOL

# Step 4: Build the application source code
echo "Step 4: Building the application..."
npm run build

# Step 5: Copy the build to the client directory
echo "Step 5: Copying the build to the client directory..."
if [ -d "client/dist" ]; then
  cp -r client/dist/* dist/client/
  echo "✅ Successfully copied client build"
else
  echo "⚠️ Client build not found in client/dist"
  
  # Create a placeholder logo for the loading screen
  cat > dist/client/pickle-logo.svg << 'EOL'
<svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="70" fill="#4CAF50" stroke="#2E7D32" stroke-width="5"/>
  <circle cx="75" cy="75" r="50" fill="#2E7D32" stroke="#1B5E20" stroke-width="3"/>
  <rect x="70" y="25" width="10" height="100" rx="5" fill="#1B5E20"/>
  <rect x="25" y="80" width="10" height="100" rx="5" transform="rotate(-90 25 80)" fill="#1B5E20"/>
</svg>
EOL
fi

# Step 6: Create start script
echo "Step 6: Creating start script..."
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

echo "Starting Pickle+ application on port $PORT"
node server.js
EOL

chmod +x dist/start.sh

# Step 7: Create package.json for dependencies
echo "Step 7: Creating package.json..."
cat > dist/package.json << 'EOL'
{
  "name": "pickle-plus",
  "version": "1.0.0",
  "description": "Pickle+ - A gamified pickleball platform",
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
    "express-session": "^1.18.0",
    "memorystore": "^1.6.7",
    "cors": "^2.8.5",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3"
  }
}
EOL

# Step 8: Install dependencies
echo "Step 8: Installing dependencies..."
cd dist
npm install
cd ..

echo ""
echo "🥒 PICKLE+ DEPLOYMENT READY 🥒"
echo "=============================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash deploy-foolproof.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"
echo ""
echo "This deployment uses a simplified approach for maximum reliability."