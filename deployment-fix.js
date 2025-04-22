#!/usr/bin/env node

/**
 * PKL-278651-DEPLOY-0005-FIX
 * Deployment Fix Script for Pickle+
 * 
 * This script makes the necessary adjustments to ensure proper deployment on Replit
 * without modifying core configuration files.
 * 
 * Run this after building but before deploying:
 * 1. npm run build
 * 2. node deployment-fix.js
 * 3. Deploy with Replit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing deployment issues...');

// Create a directory to store client static files where the server can find them
const distPublicDir = path.join(__dirname, 'dist', 'public');
const clientDistDir = path.join(__dirname, 'client', 'dist');

console.log(`Looking for client files in: ${clientDistDir}`);

// Ensure the target directory exists
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
  console.log(`Created directory: ${distPublicDir}`);
}

// Check if client dist directory exists
if (!fs.existsSync(clientDistDir)) {
  console.error(`Error: Client dist directory not found at ${clientDistDir}`);
  console.log('Make sure to run "npm run build" first to build the client');
  process.exit(1);
}

// Copy client files to the location where server will look for them
console.log('Copying client files to the correct location...');

// Function to copy files recursively
function copyFilesRecursively(sourceDir, targetDir) {
  // Read all files/directories from source
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  // Process each file/directory
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    // If it's a directory, create it and copy its contents
    if (entry.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyFilesRecursively(sourcePath, targetPath);
    } 
    // If it's a file, copy it
    else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Copy all files from client/dist to dist/public
copyFilesRecursively(clientDistDir, distPublicDir);

console.log('✅ Successfully copied client files');

// Create a helpful deployment README
const deploymentReadmePath = path.join(__dirname, 'dist', 'DEPLOYMENT.md');
const readmeContent = `# Pickle+ Deployment

This build has been prepared with the deployment-fix.js script to ensure 
proper static file serving in production.

## Deployment Configuration

When deploying on Replit, use these settings:

- **Build Command**: \`npm run build && node deployment-fix.js\`
- **Run Command**: \`NODE_ENV=production node dist/index.js\`
- **Deploy Directory**: \`dist\`

## Required Environment Variables

Make sure to set these environment variables in Replit Secrets:

- \`NODE_ENV\`: Set to \`production\`
- \`PORT\`: Set to \`5000\` (required for Replit)
- \`DATABASE_URL\`: Your PostgreSQL database connection string
- \`SESSION_SECRET\`: A secure random string for session encryption

## Troubleshooting

If the application displays a blank screen:
1. Check that the static files were correctly copied to \`dist/public\`
2. Verify all environment variables are set correctly
3. Check the application logs for specific error messages
`;

fs.writeFileSync(deploymentReadmePath, readmeContent);
console.log('✅ Created deployment guide in dist/DEPLOYMENT.md');

console.log('🚀 Deployment fix complete! You can now deploy the application.');
console.log('    Make sure to set up the required environment variables in Replit.');