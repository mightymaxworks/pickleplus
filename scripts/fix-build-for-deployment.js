#!/usr/bin/env node

/**
 * PKL-278651-DEPLOY-0004-FIX
 * Fixes Build Output for Deployment
 * 
 * This script makes critical adjustments to the build output to ensure
 * proper deployment on Replit. It should be run after the main build process.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const clientDistDir = path.join(rootDir, 'client', 'dist');

console.log('🔧 Fixing build output for deployment...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory does not exist. Build may have failed.');
  process.exit(1);
}

// Ensure client/dist directory exists
if (!fs.existsSync(clientDistDir)) {
  console.error('❌ Error: client/dist directory does not exist. Client build may have failed.');
  process.exit(1);
}

// Fix #1: Copy client build artifacts to the proper location
console.log('Copying client build artifacts...');
const copyClientFiles = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyClientFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Create public directory inside dist
const publicDir = path.join(distDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy client/dist contents to dist/public
copyClientFiles(clientDistDir, publicDir);
console.log('✅ Copied client build files to dist/public');

// Fix #2: Ensure server can find the client files
// Create a configuration file for the server
const serverConfig = {
  clientPath: path.relative(distDir, publicDir),
  port: process.env.PORT || 5000,
  productionMode: true,
  staticAssetPath: 'public',
};

fs.writeFileSync(
  path.join(distDir, 'server-config.json'),
  JSON.stringify(serverConfig, null, 2)
);
console.log('✅ Created server configuration file');

// Fix #3: Create a basic server-side index.html for fallback
const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #2c3e50; margin-bottom: 10px; }
    p { color: #7f8c8d; max-width: 600px; }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #09f;
      animation: spin 1s linear infinite;
      margin: 20px 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <h1>Pickle+</h1>
  <div class="spinner"></div>
  <p>Loading your pickleball community platform...</p>
  <script>
    // Attempt to load the real application
    window.addEventListener('DOMContentLoaded', () => {
      // Check if the API is available
      fetch('/api/health')
        .then(response => response.json())
        .then(data => {
          console.log('API health check:', data);
          // Reload the page if the API is available but the app didn't load
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch(error => {
          console.error('API health check failed:', error);
        });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'fallback.html'), fallbackHtml);
console.log('✅ Created fallback HTML page');

// Fix #4: Update package.json in dist
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  // Create a simplified version for deployment
  const deployPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    engines: packageJson.engines || { "node": ">=18.0.0" },
    dependencies: packageJson.dependencies,
    scripts: {
      "start": "NODE_ENV=production node index.js"
    }
  };
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(deployPackageJson, null, 2)
  );
  console.log('✅ Created deployment package.json');
} catch (error) {
  console.warn('⚠️ Warning: Could not create deployment package.json', error);
}

console.log('✅ Build output fixing complete!');