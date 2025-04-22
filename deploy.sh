#!/bin/bash

# Framework 5.2 Simple Deployment Script
# This script handles both client and server build correctly

echo "🚀 Starting Framework 5.2 deployment build..."

# Clean existing build artifacts
if [ -d "dist" ]; then
  echo "🧹 Cleaning dist directory..."
  rm -rf dist
fi

mkdir -p dist/public

# Build client with special deployment config
echo "🔨 Building client with deployment config..."
npx vite build --config vite.deploy.config.js

# Build server separately (only essentials)
echo "🔨 Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --outfile=dist/index.js

# Fix port in the server code for Cloud Run (8080)
echo "🔧 Setting port to 8080 for Cloud Run..."
sed -i 's/const port = process.env.PORT || 5000/const port = process.env.PORT || 8080/' dist/index.js

echo "✅ Build complete! Use these settings in Replit deployment:"
echo "   - Build Command: ./deploy.sh" 
echo "   - Run Command: node dist/index.js"
echo "   - Deploy Directory: dist"