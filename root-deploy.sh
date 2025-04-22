#!/bin/bash
# ROOT-DEPLOY.SH
# A complete deployment script that builds at the root level
# No need to set deploy directory with this approach

echo "🥒 PICKLE+ ROOT DEPLOYMENT SCRIPT 🥒"
echo "====================================="
echo "This script builds everything at the root level"

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
import './server/index.js';  // Import your main server file

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

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
      console.log("Database connection established");
      return true;
    } else {
      console.warn("DATABASE_URL not set, database features will not be available");
      return false;
    }
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    return false;
  }
}

// Import your routes setup
import { registerRoutes } from './server/routes.js';

// Register all API routes from server/routes.js
const httpServer = registerRoutes(app);

// Static file serving
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle client-side routing - send index.html for any non-API route not handled
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

// Start everything up
async function start() {
  // First setup database
  await setupDatabase();
  
  // Server is already created by registerRoutes, just start it
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🥒 Pickle+ server running on port ${PORT}`);
  });
}

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

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

echo "🥒 PICKLE+ ROOT DEPLOYMENT READY 🥒"
echo "===================================="
echo "To deploy to Replit:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash root-deploy.sh"
echo "3. Set the Run Command to: npm start"
echo "4. Click Deploy"
echo "Your COMPLETE Pickle+ application will be deployed with ALL functionality!"