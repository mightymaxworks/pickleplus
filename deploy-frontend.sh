#!/bin/bash
# Deployment script for building and serving the React frontend

echo "🚀 Starting Pickle+ frontend deployment..."

# Step 1: Build the client
echo "📦 Building the React frontend..."
cd client
npm run build
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
  echo "❌ Frontend build failed with exit code $BUILD_RESULT"
  exit 1
fi

echo "✅ Frontend build completed successfully"

# Step 2: Set up server to serve the frontend
echo "🔧 Setting up server configuration..."
cp frontend-deploy.js index.js
cp frontend-package.json package.json
npm install

echo "✅ Server configuration complete"

echo "🚀 Deployment preparation complete!"
echo ""
echo "To deploy:"
echo "1. Set the Build Command to: bash deploy-frontend.sh"
echo "2. Set the Run Command to: npm start"
echo "3. Click Deploy"