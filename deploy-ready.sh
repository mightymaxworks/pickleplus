#!/bin/bash
# Deployment preparation script for Pickle+
# This script creates a deployment-ready version without building the client

set -e # Exit on error

echo "🚀 Preparing Pickle+ for deployment..."

# Set up directories
echo "📁 Creating deployment structure..."
mkdir -p dist
mkdir -p dist/client/dist

# Create a simple HTML file for testing API connectivity
echo "📝 Creating fallback client files for testing..."
cat > dist/client/dist/index.html << 'EOL'
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
      padding: 2rem;
      line-height: 1.6;
      background-color: #f8fafb;
      color: #333;
    }
    h1, h2 { color: #38a169; }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 2rem;
      margin: 2rem 0;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .button {
      display: inline-block;
      background-color: #38a169;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 1rem;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eaeaea;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #38a169;
    }
    pre {
      background: #f1f1f1;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">Pickle+</div>
  </header>
  
  <h1>Pickle+ Platform</h1>
  
  <div class="card">
    <h2>Production Deployment</h2>
    <p>The Pickle+ platform server is running successfully in the cloud!</p>
    <p>This deployment provides the backend API functionality while a simple frontend is shown for testing.</p>
    <a href="/api/health" class="button">Check API Health</a>
  </div>
  
  <div class="card">
    <h2>API Endpoints</h2>
    <p>The following API endpoints are available:</p>
    <ul>
      <li><a href="/api/health">/api/health</a> - Health check</li>
      <li><a href="/api/leaderboard">/api/leaderboard</a> - Leaderboard data</li>
      <li><a href="/api/auth/current-user">/api/auth/current-user</a> - Current user (requires authentication)</li>
    </ul>
  </div>
</body>
</html>
EOL

# Copy server file and package.json
echo "📄 Setting up server file..."
cp full-deploy.js dist/index.js
cp full-deploy-package.json dist/package.json

# Install production dependencies
echo "📦 Installing production dependencies..."
cd dist
npm install --production
cd ..

echo "✨ Deployment preparation completed!"
echo ""
echo "📋 Deployment Information:"
echo "- Server file: dist/index.js"
echo "- Client files: dist/client/dist/index.html"
echo "- Dependencies installed in: dist/node_modules"
echo ""
echo "💻 To run locally:"
echo "cd dist && npm start"
echo ""
echo "🚀 For Cloud Run deployment:"
echo "1. Set Build Command: bash deploy-ready.sh"
echo "2. Set Run Command: cd dist && npm start"
echo "3. Click Deploy"