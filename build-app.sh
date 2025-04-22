#!/bin/bash
# Production App Deployment for Pickle+

set -e # Exit on error

echo "🚀 Starting Pickle+ app deployment..."

# Step 1: Create necessary directories
echo "📁 Creating directories..."
mkdir -p public
mkdir -p client/dist

# Step 2: Try to build the client if possible
if [ -d "client" ] && [ -f "client/package.json" ]; then
  echo "🔨 Building client application..."
  cd client
  
  # Check if we have necessary dependencies
  if ! grep -q "build" package.json; then
    echo "⚠️ No build script found in client/package.json"
  else
    echo "📦 Installing client dependencies..."
    npm install --production=false
    
    echo "🛠️ Building client..."
    npm run build
    
    echo "✅ Client build complete"
  fi
  
  cd ..
else
  echo "⚠️ No client directory or package.json found, skipping build"
fi

# Step 3: Copy any public assets if available
if [ -d "client/public" ]; then
  echo "📂 Copying public assets from client/public..."
  cp -r client/public/* public/
fi

# Step 4: Set up server
echo "🔧 Setting up server..."
cp app-deploy.js index.js
cp app-package.json package.json
npm install

echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 To run the server:"
echo "npm start"