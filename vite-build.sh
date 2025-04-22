#!/bin/bash
# Vite Build Script for Pickle+
# This builds the client using Vite and creates a server to serve it

set -e # Exit on error

echo "🚀 Starting Vite Build for Pickle+ Deployment..."

# Step 1: Build the client using Vite
echo "📦 Building client with Vite..."
npm run build

# Step 2: Create the ES module server file that will serve the built client
echo "📄 Creating ES module server file..."
cat > prod-server.js << 'EOL'
/**
 * Pickle+ Production Server - Built Client Version
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { dirname } from 'path';
import cors from 'cors';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Express app
const app = express();
const PORT = process.env.PORT || 80;

// Setup CORS
app.use(cors());

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
let db = null;

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, running without database');
    setupRoutes();
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
    setupRoutes();
  }
}

function setupRoutes() {
  // Serve static client files from the Vite build
  const clientBuildDir = path.join(__dirname, 'dist', 'client');
  
  if (!fs.existsSync(clientBuildDir)) {
    console.error(`Client build directory not found: ${clientBuildDir}`);
    console.log('Creating placeholder client directory...');
    fs.mkdirSync(clientBuildDir, { recursive: true });
    
    // Create a placeholder index.html
    fs.writeFileSync(path.join(clientBuildDir, 'index.html'), `
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
          <p><strong>Error:</strong> Client build not found. Please check build configuration.</p>
        </div>
      </body>
      </html>
    `);
  }
  
  console.log(`Serving static files from ${clientBuildDir}`);
  app.use(express.static(clientBuildDir));
  
  // API routes
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
  
  // Here we add all the API routes needed for the application
  // Current user endpoint
  app.get('/api/auth/current-user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Serve the client for all other routes (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pickle+ server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
    console.log(`Static files served from: ${clientBuildDir}`);
  });
}

// Start application
setupDatabase();
EOL

# Step 3: Create a package.json file for deployment
echo "📄 Creating package.json file for deployment..."
cat > package.json.production << 'EOL'
{
  "name": "pickle-plus",
  "version": "1.0.0",
  "description": "Pickle+ Platform Production Deployment",
  "type": "module",
  "main": "prod-server.js",
  "scripts": {
    "start": "node prod-server.js",
    "build": "vite build"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-session": "^1.18.0",
    "ws": "^8.14.2"
  }
}
EOL

# Step 4: Create a deploy script for Replit
echo "📄 Creating deploy script..."
cat > deploy.sh << 'EOL'
#!/bin/bash
# Deploy script for Pickle+

set -e # Exit on error

echo "🚀 Starting Pickle+ deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🔨 Building client..."
npm run build

# Start server
echo "🚀 Starting server..."
node prod-server.js
EOL
chmod +x deploy.sh

# Step 5: Create a Procfile for cloud deployment
echo "📄 Creating Procfile..."
echo "web: node prod-server.js" > Procfile

# Step 6: Create .env file
echo "📄 Creating .env file..."
echo "PORT=80" > .env

echo "✨ Vite build script completed successfully!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Run the build: ./vite-build.sh"
echo "2. In Replit deployment interface:"
echo "   - Build Command: npm run build"
echo "   - Run Command: node prod-server.js"
echo "3. Click Deploy"