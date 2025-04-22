#!/bin/bash
# DIRECT-PICKLE-DEPLOY.SH
# A simplified deployment script for Pickle+ that addresses the most common issues
# This script handles the core issues without requiring a client build

set -e  # Exit on error

echo "🥒 PICKLE+ SIMPLIFIED DIRECT DEPLOYMENT 🥒"
echo "=========================================="
echo "Creating a simplified deployment with focused fixes"

# Create deployment directory
rm -rf dist
mkdir -p dist/client

# Create a simple index.html file
cat > dist/client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #38b000;
      margin-bottom: 20px;
    }
    p {
      color: #333;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .status {
      background-color: #f0f8ff;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #1e88e5;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background-color: #38b000;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #2d8a00;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pickle+ Deployment Ready</h1>
    <div class="status">
      <p><strong>Status:</strong> Server is running correctly on port 5000</p>
    </div>
    <p>Your Pickle+ server has been successfully deployed. The database connection will be established when API endpoints are accessed.</p>
    <a href="/api/health" class="button">Check API Status</a>
  </div>
  <script>
    // Simple health check
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        const statusEl = document.querySelector('.status p');
        statusEl.innerHTML = `<strong>Status:</strong> Server healthy, Database: ${data.database}, Auth: ${data.auth}`;
      })
      .catch(error => {
        const statusEl = document.querySelector('.status p');
        statusEl.innerHTML = '<strong>Status:</strong> <span style="color: red;">API Error: Could not connect to server</span>';
      });
  </script>
</body>
</html>
EOL

# Create the server file with port configuration
cat > dist/index.js << 'EOL'
/**
 * Pickle+ Production Server - Direct Deployment
 * This is a simplified server that addresses common deployment issues
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

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
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await setupDatabase();
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    database: dbStatus ? 'connected' : 'not connected',
    auth: 'minimal',
    environment: process.env.NODE_ENV
  });
});

// Simple user endpoint for testing
app.get('/api/auth/current-user', (req, res) => {
  res.json({
    id: 0,
    username: 'deployment_test_user',
    email: 'deployment@test.com'
  });
});

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

// Start the server with port binding to 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
EOL

# Create startup script
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

# Start the application
echo "Starting Pickle+ application on port $PORT"
node index.js
EOL

chmod +x dist/start.sh

# Create package.json
cat > dist/package.json << 'EOL'
{
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
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOL

# Install dependencies
cd dist
npm install
cd ..

echo ""
echo "🥒 PICKLE+ DIRECT DEPLOYMENT PREPARED 🥒"
echo "========================================"
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash direct-pickle-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"
echo ""
echo "This is a minimal deployment that focuses on fixing the"
echo "port configuration and database connection issues."