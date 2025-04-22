#!/bin/bash
# SIMPLE-DEPLOY.SH
# The simplest possible deployment script for Pickle+

echo "🥒 PICKLE+ SIMPLE DEPLOYMENT 🥒"

# Build the app
npm run build

# Make sure the server is ready for production
node -e "
const fs = require('fs');
const path = require('path');

// Create production server file if it doesn't exist
const serverPath = path.join(process.cwd(), 'server.js');
if (!fs.existsSync(serverPath)) {
  console.log('Creating production server.js...');
  
  const serverContent = \`
const express = require('express');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

// Create app
const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());

// Database connection check
let db;
try {
  if (process.env.DATABASE_URL) {
    console.log('Connecting to database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.query('SELECT NOW()').then(res => {
      console.log('Database connected:', res.rows[0]);
    });
  }
} catch (err) {
  console.error('Database connection error:', err);
}

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// For any other request, send index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

// Create HTTP server
const httpServer = createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(\`🥒 Pickle+ server running on port \${PORT}\`);
});
\`;

  fs.writeFileSync(serverPath, serverContent);
  console.log('Production server.js created successfully');
}

// Update package.json if needed
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = require(packagePath);

// Make sure we have a start script
if (!packageJson.scripts || !packageJson.scripts.start || !packageJson.scripts.start.includes('server.js')) {
  console.log('Updating package.json start script...');
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.start = 'node server.js';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json');
}

console.log('Deployment preparation complete');
"

echo "🥒 DEPLOYMENT READY 🥒"
echo "To deploy on Replit:"
echo "1. Click Deploy"
echo "2. Use these settings:"
echo "   - Build Command: npm run build"
echo "   - Run Command: npm start"
echo "3. Click Deploy"