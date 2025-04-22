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
