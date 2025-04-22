#!/bin/bash
# Simple deployment script for Pickle+

set -e # Exit immediately if a command fails

echo "🚀 Starting simplified Pickle+ deployment..."

# Step 1: Ensure we have the client build files
echo "📂 Checking for client build files..."
mkdir -p public

# Step 2: Copy static assets from client if available
if [ -d "client/public" ]; then
  echo "🔄 Copying static assets from client/public..."
  cp -r client/public/* public/
fi

# Step 3: Create a simple index.html if not already present
if [ ! -f "public/index.html" ]; then
  echo "📝 Creating a basic index.html..."
  cat > public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #38a169; }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      background-color: #f7fafc;
    }
  </style>
</head>
<body>
  <h1>Pickle+ Platform</h1>
  <div class="card">
    <h2>Welcome to Pickle+</h2>
    <p>This is a simplified deployment of the Pickle+ platform.</p>
    <p>The server is running and ready to handle requests.</p>
    <p><a href="/api/health">Check API Health</a></p>
  </div>
</body>
</html>
EOL
fi

# Step 4: Set up a simplified package.json and deploy script
echo "📦 Setting up simplified deployment..."
cp simple-deploy.js index.js
cp package.json.simple package.json
npm install

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 To run the server:"
echo "npm start"