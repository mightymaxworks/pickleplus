#!/bin/bash

# Pickle+ Build and Deploy Script
# Author: Expert Software Developer
# Date: April 22, 2025

echo "🚀 Starting Pickle+ build and deployment process..."

# Step 1: Build the client
echo "📦 Building client application..."
npx vite build --outDir dist/public

# Exit if the build failed
if [ $? -ne 0 ]; then
  echo "❌ Client build failed"
  exit 1
fi

echo "✅ Client build successful!"

# Step 2: Create server files in dist
echo "📦 Setting up server files..."

# Create server directory
mkdir -p dist/server

# Copy server files
cp -r server dist/

# Create production entry point
cat > dist/production.js << 'EOF'
// This file sets NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the server
import './server/index.js';
EOF

# Create package.json for production
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.8.1",
    "express": "^4.18.2",
    "drizzle-orm": "^0.29.0",
    "ws": "^8.13.0"
  },
  "scripts": {
    "start": "node production.js"
  }
}
EOF

echo "✅ Server setup complete!"

# Step 3: Instructions for deployment
echo ""
echo "🚀 DEPLOYMENT INSTRUCTIONS:"
echo "  1. Click Deploy button in Replit"
echo "  2. Use these deployment settings:"
echo "     - Build Command: ./build.sh"
echo "     - Run Command: npm start"
echo "     - Deploy Directory: dist"
echo "  3. Click Deploy"
echo ""
echo "This will build the client and start the server on port 8080 in production mode."