#!/bin/bash
# ES Module Compatible Deployment Build Script for Pickle+

set -e # Exit on error

echo "🚀 Starting Pickle+ ES module deployment build..."

# Step 1: Create deployment directory
echo "📁 Creating deployment structure..."
mkdir -p dist
mkdir -p dist/client/dist

# Add a Procfile for clarity on how to start the server
echo "web: node index.js" > dist/Procfile

# Add a .env file with default port configuration
echo "PORT=80" > dist/.env 

# Step 2: Create client test file
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
    <p>The Pickle+ platform server is running successfully in ES module format!</p>
    <p>This deployment uses ES modules to fix compatibility issues with the project structure.</p>
    <a href="/api/health" class="button">Check API Health</a>
  </div>
</body>
</html>
EOL

# Step 3: Copy ES module compatible server and package.json
echo "📄 Setting up ES module compatible server..."
# Copy as both es-deployment.js and index.js to ensure any command will work
cp es-deployment.js dist/es-deployment.js
cp es-deployment.js dist/index.js
cp es-deploy-package.json dist/package.json

# Create a minimal server.js that just requires the main file
echo "// Simple entry point that loads the main server file
import './index.js';" > dist/server.js

# Step 4: Install dependencies
echo "📦 Installing ES module dependencies..."
cd dist
npm install
cd ..

echo "✨ ES module deployment build completed!"
echo ""
echo "📋 Deployment Information:"
echo "- Server file: dist/index.js (ES modules)"
echo "- Client files: dist/client/dist/index.html"
echo "- Dependencies installed in: dist/node_modules"
echo ""
echo "💻 To run locally:"
echo "cd dist && npm start"
echo ""
echo "🚀 For Cloud Run deployment:"
echo "1. Set Build Command: bash es-build.sh"
echo "2. Set Run Command: cd dist && npm start"
echo "3. Click Deploy"