/**
 * Simple direct deployment for Pickle+
 * 
 * This script prepares the server for production deployment
 * by creating necessary files without the full build process.
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing minimal deployment files...');

// Create production.js file
const productionContent = `
// This file sets NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the server
import './server/index.js';
`;

// Write production.js file
fs.writeFileSync('production.js', productionContent);
console.log('✅ Created production.js');

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
  <script>
    // Redirect to the development URL after 5 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  </script>
</body>
</html>
`;

// Write index.html file to public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtmlContent);
console.log('✅ Created minimal index.html for static serving');

console.log('\n✅ Deployment preparation complete!\n');
console.log('To deploy:');
console.log('1. Click the Deploy button in Replit');
console.log('2. Use these settings:');
console.log('   - Build Command: npm install');
console.log('   - Run Command: npx tsx production.js');
console.log('3. Click Deploy');
console.log('');
console.log('The server will start on port 8080 in production mode');