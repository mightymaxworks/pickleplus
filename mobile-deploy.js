/**
 * Mobile-friendly deployment script for Pickle+
 * 
 * This script creates a minimal environment for production deployment
 * with a simple approach that's more likely to work on mobile devices.
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing mobile-friendly deployment...');

// Create a production start file
const prodContent = `
// Simple production server
// This sets the environment to production and starts the server
process.env.NODE_ENV = 'production';
require('./server/index.js');
`;

fs.writeFileSync('prod-server.js', prodContent);
console.log('✅ Created prod-server.js');

// Create server/public directory if it doesn't exist
const publicDir = path.join('server', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`✅ Created ${publicDir} directory`);
}

// Create a minimal index.html for static serving
const indexHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Loading</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f7f8fa;
      color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .loading-container {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: white;
    }
    h1 {
      color: #38a169;
      margin-bottom: 1rem;
    }
    p {
      margin: 0.5rem 0;
    }
    .spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 5px solid rgba(56, 161, 105, 0.3);
      border-radius: 50%;
      border-top-color: #38a169;
      animation: spin 1s ease-in-out infinite;
      margin: 1rem 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <h1>Pickle+</h1>
    <div class="spinner"></div>
    <p>Loading the application...</p>
    <p>Please wait while we set things up.</p>
  </div>
</body>
</html>
`;

// Write index.html file to public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtmlContent);
console.log('✅ Created minimal index.html for static serving');

// Create a simple package.json for production
const packageJsonContent = `{
  "name": "pickle-plus",
  "version": "1.0.0",
  "description": "Pickle+ Platform",
  "main": "prod-server.js",
  "scripts": {
    "start": "node prod-server.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.39.1",
    "express": "^4.18.3",
    "ws": "^8.16.0"
  }
}`;

// Create a backup of the package.json if needed for production only
fs.writeFileSync('prod-package.json', packageJsonContent);
console.log('✅ Created prod-package.json for production dependencies');

console.log('\n✅ Mobile-friendly deployment preparation complete!\n');
console.log('To deploy, use THESE EXACT SETTINGS:');
console.log('1. Build Command: cp prod-package.json package.json && npm install');
console.log('2. Run Command: npm start');
console.log('3. Click Deploy');
console.log('\nThis approach is simpler and more likely to work on mobile devices.');