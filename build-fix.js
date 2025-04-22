#!/usr/bin/env node

/**
 * Pickle+ Build Fix Script
 * 
 * This script properly fixes the build issue by creating the necessary folder structure
 * and ensures vite builds to the correct location.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing build configuration...');

// 1. Check current vite.config.ts
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

// 2. Create dist/public directory
const distPublicDir = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
  console.log(`✅ Created dist/public directory`);
}

// 3. Check if the outDir is already set correctly
if (viteConfigContent.includes('outDir: path.resolve(import.meta.dirname, "dist/public")')) {
  console.log('✅ Vite config already has correct outDir path');
} else if (viteConfigContent.includes('outDir:')) {
  // Fix the outDir in vite.config.ts
  const updatedContent = viteConfigContent.replace(
    /outDir:.*?,/,
    'outDir: path.resolve(import.meta.dirname, "dist/public"),'
  );
  fs.writeFileSync(viteConfigPath, updatedContent);
  console.log('✅ Updated vite.config.ts with correct outDir path');
} else {
  console.log('⚠️ Could not find outDir in vite.config.ts. Manual update may be needed.');
}

// 4. Check server/vite.ts for static file serving
const serverVitePath = path.join(__dirname, 'server', 'vite.ts');
const serverViteContent = fs.readFileSync(serverVitePath, 'utf8');

// 5. Check if serveStatic function exists and is working correctly
if (serverViteContent.includes('serveStatic')) {
  console.log('✅ serveStatic function found in server/vite.ts');
} else {
  console.log('⚠️ serveStatic function not found in server/vite.ts. File may need manual update.');
}

// 6. Run a proper build
console.log('\n📦 Running optimized build...');
try {
  // Run vite build
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Client build successful');
  
  // Build server
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  console.log('✅ Server build successful');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// 7. Verify the build
if (fs.existsSync(path.join(distPublicDir, 'index.html'))) {
  console.log('✅ Verified client build was placed in correct location');
} else {
  console.error('❌ Client build not found in dist/public. Build may have failed or uses incorrect path.');
  process.exit(1);
}

console.log('\n🎉 Build configuration fixed and verified!');
console.log('\nFor deployment:');
console.log('1. Use build command: npm run build');
console.log('2. Use run command: NODE_ENV=production node dist/index.js');
console.log('3. Make sure to set environment variables:');
console.log('   - NODE_ENV=production');
console.log('   - DATABASE_URL=<your database url>');
console.log('   - SESSION_SECRET=<your session secret>');