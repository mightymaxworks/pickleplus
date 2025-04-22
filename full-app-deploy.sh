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

# Step 2: Copy the public directory to the client directory in dist
echo "Step 2: Copying public directory to client directory in dist..."
if [ -d "public" ]; then
  cp -r public/* dist/client/
  echo "✅ Public directory copied successfully"
else
  echo "⚠️ Public directory not found, creating a minimal index.html"
  echo '<html><head><title>Pickle+</title></head><body><div id="root"></div></body></html>' > dist/client/index.html
fi

# Step 3: Generate server files
echo "Step 3: Generating server files with error handling..."
node full-app-deploy.cjs

# Step 4: Installing dependencies in dist folder
echo "Step 4: Installing dependencies in dist folder..."
cd dist
npm install
cd ..

# Create port configuration override
echo "Step 5: Ensuring proper port configuration..."
cat > dist/port-config.js << 'EOL'
// Override the port configuration to ensure we listen on port 5000
process.env.PORT = process.env.PORT || 5000;
EOL

# Update the start script to ensure port configuration
echo "Step 6: Updating start script..."
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Ensure environment variables are set
export NODE_ENV=production
export PORT=5000

# Start the application with proper port configuration
echo "Starting Pickle+ application on port $PORT"
node -r ./port-config.js index.js
EOL

chmod +x dist/start.sh

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