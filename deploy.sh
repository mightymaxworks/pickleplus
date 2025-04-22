#!/bin/bash

# Simplified deployment script for Pickle+ platform
# Author: Expert Software Developer
# Date: April 22, 2025

echo "📦 Preparing Pickle+ Platform for deployment..."

# Check if the production.js file exists
if [ ! -f production.js ]; then
  echo "❌ production.js file not found. Please create this file first."
  exit 1
fi

# Success message
echo "✅ Deployment preparation complete!"
echo ""
echo "To deploy:"
echo "  1. Click Deploy button in Replit"
echo "  2. Use these settings:"
echo "     - Build Command: npm install"
echo "     - Run Command: npx tsx production.js"
echo "  3. Click Deploy"
echo ""
echo "This will start the server on port 8080 in production mode."