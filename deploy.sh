#!/bin/bash
# Pickle+ Production Deployment Script
# This script builds and prepares the application for deployment

set -e # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Pickle+ full deployment process..."

# Step 1: Install production dependencies if needed
echo "📦 Installing necessary dependencies..."
npm install --no-save express

# Step 2: Run the build script
echo "🔨 Building the application..."
node build-prod.js

# Step 3: Prepare for deployment
echo "🔧 Preparing final deployment files..."
cd dist
npm install --production

echo "✅ Deployment preparation complete!"
echo ""
echo "🚀 Deployment instructions:"
echo "1. Set Build Command to: bash deploy.sh"
echo "2. Set Run Command to: npm --prefix dist start"

# Return to the root directory
cd ..