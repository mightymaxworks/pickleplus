#!/bin/bash
# Full deployment build script for Pickle+
# This script builds a complete production deployment with client and server

set -e # Exit on error

echo "🚀 Starting Pickle+ full deployment build..."

# Step 1: Install server dependencies
echo "📦 Installing server dependencies..."
npm install --no-save express @neondatabase/serverless ws

# Step 2: Build the client application
echo "🔨 Building React frontend..."
if [ -d "client" ] && [ -f "client/package.json" ]; then
  echo "📂 Client directory found, building..."
  
  # Navigate to client directory
  cd client
  
  # Install client dependencies
  echo "📦 Installing client dependencies..."
  npm install --production=false
  
  # Build the client
  echo "🛠️ Running client build..."
  npm run build
  
  # Check if build succeeded
  if [ -d "dist" ]; then
    echo "✅ Client build completed successfully"
  else
    echo "❌ Client build failed - dist directory not found"
  fi
  
  # Return to root directory
  cd ..
else
  echo "⚠️ Client directory or package.json not found, skipping client build"
fi

# Step 3: Create a clean deployment directory
echo "📁 Creating deployment structure..."
mkdir -p dist
mkdir -p dist/client

# Step 4: Copy client build files if they exist
if [ -d "client/dist" ]; then
  echo "📂 Copying client build files..."
  mkdir -p dist/client/dist
  cp -r client/dist/* dist/client/dist/
fi

# Step 5: Copy production server file
echo "📄 Setting up server file..."
cp full-deploy.js dist/index.js
cp full-deploy-package.json dist/package.json

# Step 6: Install production dependencies in the dist directory
echo "📦 Installing production dependencies..."
cd dist
npm install --production
cd ..

echo "✨ Full deployment build completed!"
echo ""
echo "📋 Deployment Information:"
echo "- Server file: dist/index.js"
echo "- Client files: dist/client/dist/"
echo "- Dependencies installed in: dist/node_modules"
echo ""
echo "💻 To run locally:"
echo "cd dist && npm start"
echo ""
echo "🚀 For Cloud Run deployment:"
echo "1. Set Build Command: bash build-full.sh"
echo "2. Set Run Command: cd dist && npm start"
echo "3. Click Deploy"