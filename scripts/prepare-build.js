/**
 * PKL-278651-BUILD-0001-PROD
 * Build Preparation Script
 * 
 * This script prepares the environment for building the application for production.
 * It handles:
 * - Setting environment variables
 * - Separating client and server dependencies
 * - Creating necessary directories
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we're running in production mode
process.env.NODE_ENV = 'production';

console.log('🚀 Preparing build environment...');

// Create dist directory if it doesn't exist
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Create client and server build directories
const clientDistDir = path.resolve(distDir, 'client');
const serverDistDir = path.resolve(distDir, 'server');

if (!fs.existsSync(clientDistDir)) {
  fs.mkdirSync(clientDistDir, { recursive: true });
}

if (!fs.existsSync(serverDistDir)) {
  fs.mkdirSync(serverDistDir, { recursive: true });
}

// Create a temporary directory for build artifacts
const tempDir = path.resolve(__dirname, '../.build-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Identify server-only dependencies
// This is important to prevent client-side bundling of server dependencies
console.log('Identifying server-only dependencies...');
const serverOnlyDeps = [
  '@neondatabase/serverless',
  'drizzle-orm',
  'ws',
  'express',
  'express-session',
  'passport',
  'connect-pg-simple'
];

// Write server dependencies to a temporary file for reference during build
fs.writeFileSync(
  path.resolve(tempDir, 'server-dependencies.json'),
  JSON.stringify(serverOnlyDeps, null, 2)
);

console.log('✅ Build environment prepared successfully');
console.log('📋 Server-only dependencies identified:', serverOnlyDeps.length);
console.log('Next step: Run the build scripts for client and server');

// Exit with success
process.exit(0);