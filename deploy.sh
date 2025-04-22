#!/bin/bash

# Simplified deployment script for Pickle+ platform
# Author: Expert Software Developer
# Date: April 22, 2025

echo "📦 Preparing Pickle+ Platform for deployment..."

# Check if the production.js file exists
if [ ! -f production.js ]; then
  echo "❌ production.js file not found. Creating it now..."
  cat > production.js << 'EOF'
/**
 * Production startup file
 * 
 * This file sets the NODE_ENV to 'production' before starting the server.
 * Use this as the entry point for deployment.
 */

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the server using ES modules (since package.json has "type": "module")
import './server/index.js';
EOF
  echo "✅ production.js file created successfully."
fi

# Verify the server/index.ts file has the correct port logic
if ! grep -q "process.env.NODE_ENV === 'production' ? 8080 : 5000" server/index.ts; then
  echo "⚠️ Port configuration in server/index.ts may need review."
  echo "   For proper deployment, make sure it uses port 8080 in production and 5000 in development."
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