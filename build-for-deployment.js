#!/usr/bin/env node

/**
 * Pickle+ Complete Build Script for Deployment
 * 
 * This script runs the entire build process and ensures that all files
 * are in the correct locations for a successful Replit deployment.
 * 
 * To use this script with Replit deployment:
 * 1. Build Command: node build-for-deployment.js
 * 2. Run Command: NODE_ENV=production node dist/index.js
 * 
 * @framework Framework5.3
 * @version 1.0.1
 * @lastModified 2025-04-22
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting complete build process for deployment...');

try {
  // Step 1: Run main build
  console.log('\n📦 Building client with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('\n📦 Building server with esbuild...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 
    { stdio: 'inherit' });
  
  // Step 2: Run the fix-build-for-deployment.js script
  console.log('\n🔧 Running deployment fixes...');
  execSync('node scripts/fix-build-for-deployment.js', { stdio: 'inherit' });
  
  // Step 3: Verify the build
  const distPublicDir = path.join(__dirname, 'dist', 'public');
  if (fs.existsSync(path.join(distPublicDir, 'index.html'))) {
    console.log('\n✅ Complete build verified successfully!');
  } else {
    console.error('\n❌ Build verification failed: index.html not found in dist/public');
    process.exit(1);
  }
  
  console.log('\n🎉 Deployment build completed successfully!');
  console.log('\nFor Replit deployment:');
  console.log('1. Build Command: node build-for-deployment.js');
  console.log('2. Run Command: NODE_ENV=production node dist/index.js');
  console.log('3. Make sure to set these environment variables:');
  console.log('   - NODE_ENV=production');
  console.log('   - DATABASE_URL={your database url}');
  console.log('   - SESSION_SECRET={a secure random string}');
  
} catch (error) {
  console.error('\n❌ Build process failed:', error);
  process.exit(1);
}