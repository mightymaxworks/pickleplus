#!/usr/bin/env node

/**
 * PKL-278651-DEPLOY-0002-PREP
 * Deployment Preparation Script
 * 
 * This script prepares the environment for building the application for production deployment.
 * It should be run before the main build process.
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

// Set to production mode
process.env.NODE_ENV = 'production';

console.log('📋 Preparing build environment...');

// Ensure .env file exists with production settings
const envTemplate = path.join(rootDir, '.env.example');
const envFile = path.join(rootDir, '.env');

if (!fs.existsSync(envFile)) {
  console.log('Creating .env file from template...');
  
  let envContent = fs.readFileSync(envTemplate, 'utf8');
  
  // Set production-specific environment variables
  envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=production');
  envContent = envContent.replace(/LOG_LEVEL=.*/, 'LOG_LEVEL=info');
  
  fs.writeFileSync(envFile, envContent);
  console.log('✅ Created .env file with production settings');
}

// Create dist directory if it doesn't exist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Check if the config directory exists with production config
const configDir = path.join(rootDir, 'config');
if (!fs.existsSync(path.join(configDir, 'production.js'))) {
  console.warn('⚠️ Warning: Production configuration file missing');
  console.log('Using default configuration...');
}

// Create a build metadata file
const buildMetadata = {
  version: '0.9.0', // Should be pulled from package.json
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  framework: 'Framework5.3',
};

fs.writeFileSync(
  path.join(distDir, 'build-metadata.json'),
  JSON.stringify(buildMetadata, null, 2)
);
console.log('✅ Created build metadata file');

console.log('✅ Build environment preparation complete');