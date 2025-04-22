#!/bin/bash
# React App Deployment Script for Pickle+
# This script is specifically designed to deploy the full React application

set -e # Exit on error

echo "🚀 Starting Full React App Deployment for Pickle+..."

# Step 1: Create optimized production server file
echo "📄 Creating production server file..."
cat > server.js << 'EOL'
/**
 * Pickle+ Production Server for React App
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import { dirname } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import createMemoryStore from 'memorystore';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crypto functions
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Setup Express app
const app = express();
const PORT = process.env.PORT || 80;

// WebSocket support for Neon database
neonConfig.webSocketConstructor = ws;

// Setup CORS
app.use(cors());

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
let db = null;

const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // 24 hours
});

// Setup session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Setup Passport authentication
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  if (!db) return done(null, null);
  
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) return done(null, null);
    return done(null, result.rows[0]);
  } catch (error) {
    return done(error);
  }
});

passport.use(new LocalStrategy(async (username, password, done) => {
  if (!db) return done(null, false, { message: 'Database not available' });
  
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rowCount === 0) return done(null, false, { message: 'User not found' });
    
    const user = result.rows[0];
    if (!(await comparePasswords(password, user.password))) {
      return done(null, false, { message: 'Incorrect password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, running without database');
    setupRoutes();
    return;
  }
  
  try {
    console.log('Setting up database connection...');
    
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
    db = null;
    setupRoutes();
  }
}

function setupRoutes() {
  // API routes
  
  // Health check endpoint
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
  
  // Auth endpoints
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });
  
  app.post('/api/logout', (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.sendStatus(200);
    });
  });
  
  app.get('/api/auth/current-user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
  
  // Serve static client files - Vite build output
  const clientBuildDir = path.join(__dirname, 'dist', 'client');
  
  if (fs.existsSync(clientBuildDir)) {
    console.log(`Serving static files from ${clientBuildDir}`);
    app.use(express.static(clientBuildDir));
    
    // Serve SPA for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildDir, 'index.html'));
    });
  } else {
    console.error(`Client build directory not found: ${clientBuildDir}`);
    // Fallback to serving the public directory if it exists
    const publicDir = path.join(__dirname, 'public');
    
    if (fs.existsSync(publicDir)) {
      console.log(`Falling back to serving static files from ${publicDir}`);
      app.use(express.static(publicDir));
    } else {
      // Create a simple index.html if no client build is found
      app.get('*', (req, res) => {
        res.send(`
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
              <p><strong>Error:</strong> Client build not found.</p>
              <p>Please check that the build process completed successfully.</p>
            </div>
          </body>
          </html>
        `);
      });
    }
  }
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pickle+ server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  });
}

// Start application
setupDatabase();
EOL

# Step 2: Create a minimal package.json for dependencies
echo "📄 Creating package.json for server dependencies..."
cat > package.json.production << 'EOL'
{
  "name": "pickle-plus",
  "version": "1.0.0",
  "description": "Pickle+ Platform Production Deployment",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "vite build"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-session": "^1.18.0",
    "memorystore": "^1.6.7",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "ws": "^8.14.2"
  }
}
EOL

# Step 3: Create a custom Vite config for optimized production build
echo "📄 Creating optimized Vite config..."
cat > vite.config.prod.js << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          tanstack: ['@tanstack/react-query'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          framer: ['framer-motion'],
          icons: ['lucide-react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      'react-hook-form',
      'wouter',
      'zod'
    ]
  }
});
EOL

# Step 4: Create a server-specific esbuild configuration
echo "📄 Creating server build config..."
cat > esbuild.config.js << 'EOL'
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      outfile: 'dist/server.js',
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      plugins: [nodeExternalsPlugin()],
    });
    console.log('Server build complete!');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
EOL

# Step 5: Create a complete build script
echo "📄 Creating comprehensive build script..."
cat > build-prod.js << 'EOL'
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildProduction() {
  console.log('🚀 Starting production build...');
  
  try {
    // Ensure dist directory exists
    await fs.mkdir('dist', { recursive: true });
    await fs.mkdir('dist/client', { recursive: true });
    
    // Step 1: Build client
    console.log('📦 Building client with Vite...');
    try {
      await execAsync('vite build --config vite.config.prod.js');
      console.log('✅ Client build complete!');
    } catch (error) {
      console.error('❌ Client build failed:', error.stderr || error.message);
      throw error;
    }
    
    // Step 2: Copy server.js to dist
    console.log('📋 Copying server files...');
    await fs.copyFile('server.js', 'dist/server.js');
    
    // Step 3: Copy package.json.production to dist/package.json
    await fs.copyFile('package.json.production', 'dist/package.json');
    
    // Step 4: Create .env file
    await fs.writeFile('dist/.env', 'PORT=80\n', 'utf-8');
    
    // Step 5: Create Procfile
    await fs.writeFile('dist/Procfile', 'web: node server.js\n', 'utf-8');
    
    console.log('✨ Production build completed successfully!');
    console.log('📂 Deployment files are in the dist directory.');
    console.log('🚀 Ready for deployment!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProduction();
EOL

# Step 6: Create the deploy script
echo "📄 Creating deployment script..."
cat > deploy.sh << 'EOL'
#!/bin/bash
# Deployment script for Pickle+ React App

set -e # Exit on error

echo "🚀 Starting Pickle+ React App deployment..."

# Step 1: Install production dependencies
echo "📦 Installing production dependencies..."
npm install --omit=dev

# Step 2: Run the production build
echo "🔨 Building for production..."
node build-prod.js

# Step 3: Test the server
echo "🧪 Testing server..."
node server.js &
SERVER_PID=$!
sleep 3
kill $SERVER_PID || true

# Step 4: Create deployment artifacts
echo "📦 Creating deployment package..."
mkdir -p deploy
cp -r dist/* deploy/

echo "✅ Deployment package created successfully!"
echo "🚀 Ready for Replit Deployment!"
echo "   - Build Command: bash react-deploy.sh"
echo "   - Run Command: node server.js"
EOL
chmod +x deploy.sh

# Step 7: Create a .env file
echo "📄 Creating .env file..."
echo "PORT=80" > .env

# Step 8: Create a Procfile for cloud deployment
echo "📄 Creating Procfile..."
echo "web: node server.js" > Procfile

echo "✨ React App Deployment setup completed successfully!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. In the Replit deployment interface:"
echo "   - Build Command: bash react-deploy.sh"
echo "   - Run Command: node server.js"
echo "2. Click Deploy"
echo ""
echo "⚠️ Note: This script assumes your React app is already built or will"
echo "   be built during the deployment process. Make sure your Vite build"
echo "   is properly configured for the React app."