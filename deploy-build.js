/**
 * Framework 5.2 Deployment Build Script
 * This script properly separates server and client code to avoid Node.js modules in browser builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Framework 5.2 build process...');

try {
  // Step 1: Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist');
  fs.mkdirSync('dist/public');
  
  // Step 2: Build only the client with Vite (no server code)
  console.log('🔨 Building client with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 3: Build server separately with esbuild - excluding @neondatabase and other problematic packages
  console.log('🔨 Building server with esbuild...');
  execSync(
    'npx esbuild server/index.ts --platform=node --bundle --external:@neondatabase/serverless --external:pg --external:ws --external:drizzle-orm --external:postgres --outfile=dist/index.js',
    { stdio: 'inherit' }
  );
  
  // Step 4: Copy package.json for production dependencies
  console.log('📋 Copying package.json for dependencies...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Keep only necessary fields for production
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    engines: { node: '>=18' },
    dependencies: packageJson.dependencies,
    scripts: {
      start: 'node prod-server.js'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  
  // Step 5: Copy production entry point
  fs.copyFileSync('prod-server.js', 'dist/prod-server.js');
  
  console.log('✅ Build completed successfully. Ready for deployment!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}