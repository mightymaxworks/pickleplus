/**
 * Full Application Deployment Script
 * This script prepares a complete deployment package for the entire Pickle+ application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Create production server file
function createProductionServer() {
  console.log("Creating production server with full functionality...");
  
  const serverCode = `
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcryptjs = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
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

// Standard middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Set up database connection with retry mechanism
let db = null;
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
    
    // Basic schema definition
    const schema = {
      users: {
        id: { name: 'id' },
        username: { name: 'username' },
        password: { name: 'password' }
      }
    };
    
    db = drizzle({ client: pool, schema });
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
    // Fallback to memory store if database connection fails
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
      if (!db) {
        return done(null, false);
      }
      
      // Custom query to get user by ID
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = result.rows[0];
      
      if (!user) {
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(null, false);
    }
  });

  // Configure local strategy with error handling
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      if (!db) {
        return done(null, false);
      }
      
      // Custom query to get user by username
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];
      
      if (!user) {
        return done(null, false);
      }
      
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
  // Authentication routes with error handling
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
      database: !!db ? 'connected' : 'not connected',
      auth: !!passport ? 'initialized' : 'not initialized',
      environment: process.env.NODE_ENV
    });
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
      console.log(\`Server listening at http://0.0.0.0:\${port}\`);
      console.log(\`Environment: \${process.env.NODE_ENV}\`);
      console.log(\`Database connection: \${dbConnected ? 'Successful' : 'Failed, using fallbacks'}\`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
`;

  try {
    fs.writeFileSync('./dist/index.js', serverCode);
    console.log("✅ Created production server file with full functionality");
    return true;
  } catch (error) {
    console.error("❌ Failed to create production server file:", error);
    return false;
  }
}

// Create startup script
function createStartupScript() {
  console.log("Creating startup script...");
  
  const scriptContent = `#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

# Ensure DATABASE_URL is available
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set! The application may not function correctly."
fi

# Start the application with error handling
echo "Starting Pickle+ application on port $PORT"
node index.js
`;

  try {
    fs.writeFileSync('./dist/start.sh', scriptContent);
    fs.chmodSync('./dist/start.sh', 0o755); // Make executable
    console.log("✅ Created startup script");
    return true;
  } catch (error) {
    console.error("❌ Failed to create startup script:", error);
    return false;
  }
}

// Create package.json
function createPackageJson() {
  console.log("Creating package.json...");
  
  const packageJson = {
    "name": "pickle-plus-production",
    "version": "1.0.0",
    "engines": {
      "node": ">=18.0.0"
    },
    "scripts": {
      "start": "NODE_ENV=production node index.js"
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
  };

  try {
    fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
    console.log("✅ Created package.json");
    return true;
  } catch (error) {
    console.error("❌ Failed to create package.json:", error);
    return false;
  }
}

// Create environment file
function createEnvFile() {
  console.log("Creating .env file...");
  
  const envContent = `NODE_ENV=production
PORT=5000
SESSION_SECRET=pickle-plus-production-secret
# DATABASE_URL will be provided by Replit environment variables
`;

  try {
    fs.writeFileSync('./dist/.env', envContent);
    console.log("✅ Created .env file");
    return true;
  } catch (error) {
    console.error("❌ Failed to create .env file:", error);
    return false;
  }
}

// Run the deployment setup
function runDeployment() {
  try {
    createProductionServer();
    createStartupScript();
    createPackageJson();
    createEnvFile();
    
    console.log("✅ Deployment files created successfully!");
    console.log("The next steps are:");
    console.log("1. Run 'npm run build' to build the client application");
    console.log("2. Copy the client files to the dist/client directory");
    console.log("3. Install dependencies in the dist directory");
    
    return true;
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    return false;
  }
}

runDeployment();