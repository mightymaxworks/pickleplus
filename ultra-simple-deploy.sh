#!/bin/bash
# ULTRA-SIMPLE-DEPLOY.SH
# Ultra-simplified deployment script for Pickle+ that avoids database errors
# This script creates a minimal server that serves the built client and handles basic routes

set -e  # Exit on error

echo "🥒 PICKLE+ ULTRA-SIMPLIFIED DEPLOYMENT 🥒"
echo "========================================="
echo "Creating ultra-minimal deployment that avoids database errors"

# Step 1: Clean previous build artifacts
echo "Step 1: Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist/client dist/public

# Step 2: Build the client application
echo "Step 2: Building the client application..."
npm run build

# Step 3: Copy client files to dist directory
echo "Step 3: Copying client files to dist directory..."
cp -r client/dist/* dist/client/

# Step 4: Create and set up .env file for production
echo "Step 4: Setting up environment variables..."
cat > dist/.env << 'EOF'
NODE_ENV=production
PORT=5000
EOF

# Step 5: Create production-ready package.json with minimal dependencies
echo "Step 5: Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-minimal",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Step 6: Create a simple startup script that handles PORT environment variable
echo "Step 6: Creating startup script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash
# Ensure the PORT environment variable is correctly set for production
export NODE_ENV=production

# Set PORT to 5000 if not already set
if [ -z "$PORT" ]; then
  export PORT=5000
  echo "Setting PORT to default value: 5000"
else
  echo "Using provided PORT: $PORT"
fi

# Start the application
echo "Starting application with NODE_ENV=$NODE_ENV and PORT=$PORT"
node index.js
EOF

chmod +x dist/start.sh

# Step 7: Copy the ultra-simplified server to dist folder
echo "Step 7: Creating ultra-simplified server..."
cp simplified-server.cjs dist/index.js

# Step 8: Installing dependencies in dist folder
echo "Step 8: Installing dependencies in dist folder..."
cd dist
npm install
cd ..

echo "🥒 PICKLE+ ULTRA-SIMPLIFIED DEPLOYMENT PREPARED 🥒"
echo "=================================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash ultra-simple-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Click Deploy"
echo ""
echo "This deployment creates a minimal server that avoids database errors"
echo "by providing a simplified implementation of the authentication endpoints."