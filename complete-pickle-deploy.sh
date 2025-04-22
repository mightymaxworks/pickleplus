#!/bin/bash
# COMPLETE-PICKLE-DEPLOY.SH
# A comprehensive deployment script that includes ALL functionality

echo "🥒 PICKLE+ COMPLETE DEPLOYMENT SCRIPT 🥒"
echo "==========================================="
echo "This script deploys the FULL Pickle+ application with all functionality"

# Step 1: Ensure we have the right directory structure
mkdir -p dist
mkdir -p dist/public
mkdir -p dist/uploads

# Step 2: Copy server files
echo "Step 2: Copying server files..."
cp -r server dist/
cp -r shared dist/

# Step 3: Build the client application
echo "Step 3: Building the client application..."
npm run build

# Step 4: Copy client build to dist
echo "Step 4: Copying client build..."
mkdir -p dist/client/dist
cp -r client/dist/* dist/client/dist/

# Step 5: Copy public assets
echo "Step 5: Copying public assets..."
cp -r public/* dist/public/
cp -r uploads/* dist/uploads/ 2>/dev/null || echo "No uploads to copy"

# Step 6: Create production server file
echo "Step 6: Creating production server file..."
cat > dist/index.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import ws from 'ws';
import fs from 'fs';
import { registerRoutes } from './server/routes.js';

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

// Static file serving
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Register all API routes from server/routes.js
const httpServer = registerRoutes(app);

// Handle client-side routing - send index.html for any non-API route not handled
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🥒 Pickle+ server running on port ${PORT}`);
});
EOF

# Step 7: Create package.json for production
echo "Step 7: Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.8.1",
    "@paralleldrive/cuid2": "^2.2.2",
    "bcryptjs": "^2.4.3",
    "connect-pg-simple": "^9.0.1",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.29.4",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.18.0",
    "memorystore": "^1.6.7",
    "multer": "^1.4.5-lts.1",
    "node-cache": "^5.1.2",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "qrcode": "^1.5.3",
    "stripe": "^13.10.0",
    "ws": "^8.16.0",
    "zod": "^3.22.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Step 8: Create .env file for production
echo "Step 8: Creating production .env file..."
if [ -f ".env" ]; then
  cp .env dist/.env
  echo "Copied existing .env file to dist directory"
else
  cat > dist/.env << 'EOF'
NODE_ENV=production
PORT=8080
SESSION_SECRET=pickle-plus-production-secret
EOF
  echo "Created new .env file in dist directory"
fi

# Step 9: Prepare CommonJS to ESM compatibility
echo "Step 9: Preparing ESM compatibility..."
# Find require statements and adjust imports for ESM compatibility
find dist/server -type f -name "*.js" -exec sed -i 's/const \(.*\) = require(\(.*\))/import \1 from \2/g' {} \;
find dist/server -type f -name "*.js" -exec sed -i 's/module.exports/export default/g' {} \;

# Step 10: Create .gitignore
echo "Step 10: Creating .gitignore..."
cat > dist/.gitignore << 'EOF'
node_modules
npm-debug.log
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF

echo "🥒 PICKLE+ COMPLETE DEPLOYMENT READY 🥒"
echo "==========================================="
echo "To deploy to Replit:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash complete-pickle-deploy.sh"
echo "3. Set the Run Command to: cd dist && npm start"
echo "4. Set the Deploy Directory to: dist"
echo "5. Click Deploy"
echo "Your COMPLETE Pickle+ application will be deployed with ALL functionality!"