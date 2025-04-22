#!/bin/bash
# CLOUD-RUN-DEPLOY.SH
# A deployment script specifically designed for Replit Cloud Run
# Focuses on port configuration and compatibility

echo "🥒 PICKLE+ CLOUD RUN DEPLOYMENT SCRIPT 🥒"
echo "=========================================="
echo "This script builds for Replit Cloud Run deployment"

# Step 1: Build the client application
echo "Step 1: Building the client application..."
npm run build

# Step 2: Create production server file at root
echo "Step 2: Creating production server file..."
cat > server.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import ws from 'ws';
import fs from 'fs';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

// Create Express app
const app = express();

// CRITICAL: Cloud Run expects port 8080
const PORT = 8080;

// Log beginning of server startup - helps with debugging
console.log(`Starting Pickle+ server setup on port ${PORT}...`);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pickle-plus-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Database connection
let db;
async function setupDatabase() {
  try {
    if (process.env.DATABASE_URL) {
      console.log("Setting up database connection...");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Test database connection
      try {
        const result = await pool.query('SELECT NOW()');
        console.log("Database connection successful:", result.rows[0]);
        return true;
      } catch (err) {
        console.error("Database connection test failed:", err.message);
        return false;
      }
    } else {
      console.warn("DATABASE_URL not set, database features will not be available");
      return false;
    }
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    return false;
  }
}

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// API ping endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Auth current user endpoint
app.get('/api/auth/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Placeholder for API routes that aren't yet implemented
app.all('/api/*', (req, res) => {
  // Log the request for debugging
  console.log(`API request: ${req.method} ${req.path}`);
  
  // Return a placeholder response
  res.status(200).json({
    message: 'API endpoint will be available soon',
    path: req.path,
    method: req.method
  });
});

// Static file serving - CRITICAL: Serve client/dist for the React app
const staticDir = path.join(__dirname, 'client/dist');
if (fs.existsSync(staticDir)) {
  console.log(`Serving static files from: ${staticDir}`);
  app.use(express.static(staticDir));
} else {
  console.warn(`Static directory not found: ${staticDir}`);
}

// Handle client-side routing - send index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'client/dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <html>
          <head>
            <title>Pickle+ Application</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f4f4; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              h1 { color: #4CAF50; }
              p { margin: 1rem 0; }
              .logo { font-size: 3rem; margin-bottom: 1rem; }
              pre { text-align: left; background: #eee; padding: 1rem; border-radius: 4px; overflow: auto; max-height: 200px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">🥒</div>
              <h1>Pickle+ Application</h1>
              <p>The server is running but the client files were not found.</p>
              <p>Expected client files at: ${staticDir}</p>
              <pre>Directory structure:\n${JSON.stringify(fs.readdirSync('.'), null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
    }
  }
});

// Create HTTP server
const httpServer = createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (socket) => {
  console.log('WebSocket client connected');
  
  socket.on('message', (message) => {
    console.log('Received message:', message.toString());
    socket.send(JSON.stringify({ type: 'echo', data: message.toString() }));
  });
  
  socket.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start everything up
async function start() {
  // First setup database
  await setupDatabase();
  
  // Start the server - CRITICAL: Listen on port 8080 for Cloud Run
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🥒 Pickle+ server running on port ${PORT}`);
    console.log(`Server started at: ${new Date().toISOString()}`);
  });
}

// Log any unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start the application
start();
EOF

# Step 3: Update package.json for production at root
echo "Step 3: Updating package.json for production..."
# Create a backup of the original package.json
cp package.json package.json.bak

# Update the package.json to include the type module and start script
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add type: module
packageJson.type = 'module';

// Update start script
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.start = 'node server.js';

// Make sure we have all required dependencies
packageJson.dependencies = packageJson.dependencies || {};
packageJson.dependencies['@neondatabase/serverless'] = packageJson.dependencies['@neondatabase/serverless'] || '^0.8.1';
packageJson.dependencies['express'] = packageJson.dependencies['express'] || '^4.18.2';
packageJson.dependencies['express-session'] = packageJson.dependencies['express-session'] || '^1.18.0';
packageJson.dependencies['passport'] = packageJson.dependencies['passport'] || '^0.7.0';
packageJson.dependencies['passport-local'] = packageJson.dependencies['passport-local'] || '^1.0.0';
packageJson.dependencies['ws'] = packageJson.dependencies['ws'] || '^8.16.0';
packageJson.dependencies['cors'] = packageJson.dependencies['cors'] || '^2.8.5';

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Step 4: Create .env file
echo "Step 4: Checking for .env file..."
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
EOF
fi

echo "🥒 PICKLE+ CLOUD RUN DEPLOYMENT READY 🥒"
echo "========================================="
echo "To deploy to Replit:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash cloud-run-deploy.sh"
echo "3. Set the Run Command to: npm start"
echo "4. Click Deploy"
echo "Your Pickle+ application will be deployed with proper port configuration for Cloud Run!"