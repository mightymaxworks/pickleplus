/**
 * Framework 5.2 Deployment Build Script
 * This script builds the client and server for deployment.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Pickle+ Deployment Build Script${colors.reset}`);
console.log('-----------------------------------');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  console.log(`${colors.yellow}Creating dist directory...${colors.reset}`);
  fs.mkdirSync('dist');
}

// Build client
try {
  console.log(`${colors.yellow}Building client...${colors.reset}`);
  execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });
  console.log(`${colors.green}Client build successful!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Client build failed:${colors.reset}`, error);
  process.exit(1);
}

// Copy necessary server files to dist
console.log(`${colors.yellow}Copying server files...${colors.reset}`);

// Create production.js in dist
const productionContent = `
// This file sets NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the server
import './server/index.js';
`;

fs.writeFileSync('dist/production.js', productionContent);
console.log(`${colors.green}Created dist/production.js${colors.reset}`);

// Create a new package.json for production
const packageJson = {
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.8.1",
    "express": "^4.18.2",
    "drizzle-orm": "^0.29.0",
    "ws": "^8.13.0"
  },
  "scripts": {
    "start": "node production.js"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
console.log(`${colors.green}Created dist/package.json${colors.reset}`);

console.log(`${colors.green}Build complete!${colors.reset}`);
console.log('');
console.log(`${colors.cyan}To deploy:${colors.reset}`);
console.log('  1. Click Deploy button in Replit');
console.log('  2. Use these settings:');
console.log('     - Build Command: node deploy-build.js');
console.log('     - Run Command: npm start');
console.log('     - Deploy Directory: dist');
console.log('  3. Click Deploy');