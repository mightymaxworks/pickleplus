#!/usr/bin/env node

/**
 * Pickle+ Build and Deploy Script
 * 
 * This script:
 * 1. Builds the client app
 * 2. Copies client files to where the production server can find them
 * 3. Creates a production-ready server.js file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Pickle+ build and deploy process...');

// Step 1: Build the client app
console.log('\n📦 Building client application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error);
  process.exit(1);
}

// Step 2: Ensure all paths exist
console.log('\n📂 Setting up deployment directories...');
const clientDistDir = path.join(__dirname, 'client', 'dist');
const distDir = path.join(__dirname, 'dist');
const distPublicDir = path.join(distDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created directory: ${distDir}`);
}

if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
  console.log(`Created directory: ${distPublicDir}`);
}

// Step 3: Copy client files to both possible locations
console.log('\n🔄 Copying client files...');

if (!fs.existsSync(clientDistDir)) {
  console.error(`❌ Error: Client dist directory not found at ${clientDistDir}`);
  console.log('Make sure the client build succeeded');
  process.exit(1);
}

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

// Copy to dist/public for the production server
copyFilesRecursively(clientDistDir, distPublicDir);
console.log(`✅ Client files copied to ${distPublicDir}`);

// Step 4: Create a simple deployment instruction file
const deployInstructionsPath = path.join(__dirname, 'DEPLOYMENT.md');
const deployInstructions = `# Pickle+ Deployment Instructions

This project has been prepared for deployment with the build-deploy.js script.

## Deployment Settings

When deploying on Replit:

1. For the **Build Command**, use:
   \`\`\`
   node build-deploy.js
   \`\`\`

2. For the **Run Command**, use:
   \`\`\`
   NODE_ENV=production node server.js
   \`\`\`

## Environment Variables

Make sure to set these environment variables in Replit Secrets:

- \`NODE_ENV\`: Set to \`production\`
- \`PORT\`: Set to \`5000\` (required for Replit)
- \`DATABASE_URL\`: Your PostgreSQL database connection string
- \`SESSION_SECRET\`: A secure random string for session encryption

## Troubleshooting

If you encounter issues:
1. Check that client files were properly built and copied
2. Verify all environment variables are set correctly
3. Check server logs for specific error messages
`;

fs.writeFileSync(deployInstructionsPath, deployInstructions);
console.log(`✅ Created deployment instructions in ${deployInstructionsPath}`);

console.log('\n🎉 Build and deploy preparation complete!');
console.log('\nTo deploy:');
console.log('1. Click "Deploy" in the Replit sidebar');
console.log('2. Set Build Command: node build-deploy.js');
console.log('3. Set Run Command: NODE_ENV=production node server.js');
console.log('4. Click "Deploy"');