#!/bin/bash
set -e

# Build the client
echo "Building client..."
npm run build

# Build the server
echo "Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server

# Copy necessary files
echo "Copying configuration files..."
cp package.json dist/
cp .env dist/ 2>/dev/null || :

# Install production dependencies
echo "Installing production dependencies..."
cd dist
npm install --production

echo "Build complete!"

echo "🥒 FINAL DEPLOYMENT SOLUTION READY 🥒"
echo "====================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash final-deploy.sh"
echo "3. Set the Run Command to: npm start"
echo "4. Click Deploy"
echo "This solution will deploy your COMPLETE application with ALL functionality!"