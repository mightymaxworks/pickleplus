#!/bin/bash
# STATIC-SITE-DEPLOY.SH
# Static site deployment for Pickle+
# This script creates a static version of the application that can be deployed without database connection

set -e  # Exit on error

echo "🥒 PICKLE+ STATIC SITE DEPLOYMENT 🥒"
echo "==================================="
echo "Creating a static site deployment that doesn't require database connections"

# Step 1: Clean previous build artifacts
echo "Step 1: Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist/public

# Step 2: Build the client application
echo "Step 2: Building the client application..."
npm run build

# Step 3: Copy client files to dist/public directory
echo "Step 3: Copying client files to dist/public directory..."
cp -r client/dist/* dist/public/

# Step 4: Create basic server file
echo "Step 4: Creating static server file..."
cat > dist/index.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    type: 'static',
    timestamp: new Date() 
  });
});

// Handle all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
EOF

# Step 5: Create package.json
echo "Step 5: Creating package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-static",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Step 6: Create startup script
echo "Step 6: Creating startup script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=5000
node index.js
EOF

chmod +x dist/start.sh

# Step 7: Install dependencies
echo "Step 7: Installing dependencies..."
cd dist
npm install
cd ..

echo "🥒 PICKLE+ STATIC SITE DEPLOYMENT READY 🥒"
echo "========================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash static-site-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Click Deploy"
echo ""
echo "This deployment creates a static site version of the application"
echo "that doesn't require any database connections to operate."