#!/bin/bash
# precision-deploy.sh
# This deployment script specifically targets the actual Pickle+ application structure
# It's designed to deploy the exact application we're seeing in development

set -e # Exit on any error

echo "Starting Pickle+ Precision Deployment..."

# Create deployment directory
mkdir -p dist
mkdir -p dist/client

# Create production server file
cat > dist/server.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import cors from 'cors';
import { WebSocketServer } from 'ws';

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
  secret: process.env.SESSION_SECRET || 'pickle-plus-development-secret',
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
try {
  if (process.env.DATABASE_URL) {
    console.log("Setting up database connection...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool });
    console.log("Database connection established");
  } else {
    console.warn("DATABASE_URL not set, database features will not be available");
  }
} catch (error) {
  console.error("Error connecting to database:", error.message);
}

// API routes - Health check and ping
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth routes - Current user
app.get('/api/auth/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// API catch-all for all other routes (will have proper implementations later)
app.all('/api/*', (req, res) => {
  res.status(200).json({ 
    message: 'This endpoint is a placeholder - real API will be integrated soon',
    path: req.path,
    method: req.method
  });
});

// Static file serving (production build)
app.use(express.static(path.join(__dirname, 'client')));

// Handle client-side routing - send index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
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

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ server running on port ${PORT}`);
});
EOF

# Create package.json for production
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.8.1",
    "connect-pg-simple": "^9.0.1",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.29.4",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.18.0",
    "memorystore": "^1.6.7",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "ws": "^8.16.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Build the client
echo "Building the client application..."
npm run build

# Copy the build artifacts to the dist/client directory
echo "Copying build artifacts..."
cp -r dist-client/* dist/client/

echo "Pickle+ precision deployment prepared successfully!"
echo "To deploy, upload the dist directory to your hosting service."
echo "Done!"