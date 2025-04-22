#!/bin/bash
# FULL-APP-DEPLOY.SH
# Complete deployment script for Pickle+ with robust error handling
# Addresses port configuration, authentication, and database issues

set -e  # Exit on error

echo "🥒 PICKLE+ FULL APPLICATION DEPLOYMENT 🥒"
echo "========================================="
echo "Creating a complete deployment with all functionality"

# Step 1: Clean previous build artifacts
echo "Step 1: Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist/client

# Step 2: Build the client application
echo "Step 2: Building the client application..."
npm run build

# Step 3: Copy client files to dist directory
echo "Step 3: Copying client files to dist directory..."
cp -r client/dist/* dist/client/

# Step 4: Generate server files
echo "Step 4: Generating server files with error handling..."
node full-app-deploy.cjs

# Step 5: Installing dependencies in dist folder
echo "Step 5: Installing dependencies in dist folder..."
cd dist
npm install
cd ..

echo "🥒 PICKLE+ FULL APPLICATION DEPLOYMENT PREPARED 🥒"
echo "=================================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash full-app-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Make sure DATABASE_URL is set in the environment variables"
echo "5. Click Deploy"
echo ""
echo "This deployment creates a complete version of the application"
echo "with robust error handling for database and authentication issues."