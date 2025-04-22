/**
 * PKL-278651-BUILD-0002-PROD
 * Post-Build Script
 * 
 * This script runs after the build process to:
 * - Clean up temporary files
 * - Copy necessary files to the dist directory
 * - Validate the build artifacts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running post-build tasks...');

// Paths
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const tempDir = path.resolve(rootDir, '.build-temp');
const configDir = path.resolve(rootDir, 'config');
const distConfigDir = path.resolve(distDir, 'config');

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory not found. Build may have failed.');
  process.exit(1);
}

// Copy configuration files to dist
if (!fs.existsSync(distConfigDir)) {
  fs.mkdirSync(distConfigDir, { recursive: true });
}

console.log('📁 Copying configuration files...');
try {
  fs.copyFileSync(
    path.resolve(configDir, 'default.js'),
    path.resolve(distConfigDir, 'default.js')
  );
  
  fs.copyFileSync(
    path.resolve(configDir, 'production.js'),
    path.resolve(distConfigDir, 'production.js')
  );
  
  console.log('✅ Configuration files copied successfully');
} catch (err) {
  console.error('❌ Error copying configuration files:', err);
}

// Create a .env file in dist with production defaults
// NOTE: This is a template. Actual values should be provided during deployment.
console.log('📝 Creating production .env template...');
const envContent = `# Production environment variables
# This is a template. Replace with actual values during deployment.
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
SESSION_SECRET=replace-with-actual-secret-in-production
LOG_LEVEL=info
`;

fs.writeFileSync(path.resolve(distDir, '.env.template'), envContent);
console.log('✅ Production .env template created');

// Create a README file in the dist directory with deployment instructions
console.log('📝 Creating deployment README...');
const readmeContent = `# Pickle Plus Production Deployment

## Deployment Instructions

1. Ensure Node.js 18+ is installed on the server
2. Copy all files from this directory to your deployment server
3. Create a .env file based on .env.template with actual values
4. Install production dependencies: \`npm install --production\`
5. Start the application: \`node server/index.js\`

## Environment Variables

Make sure to set these environment variables:

- NODE_ENV=production
- PORT - The port to listen on (default: 8080)
- DATABASE_URL - PostgreSQL connection string
- SESSION_SECRET - Secret for session cookies

## Build Information

- Build Date: ${new Date().toISOString()}
- Framework Version: 5.3
`;

fs.writeFileSync(path.resolve(distDir, 'README.md'), readmeContent);
console.log('✅ Deployment README created');

// Clean up temporary build files
console.log('🧹 Cleaning up temporary files...');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('✅ Temporary files cleaned up');
}

// Validate build artifacts
console.log('🔍 Validating build artifacts...');
const requiredFiles = [
  'server/index.js',
  'client/index.html',
  'client/assets'
];

let buildValid = true;
for (const file of requiredFiles) {
  const filePath = path.resolve(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file not found: ${file}`);
    buildValid = false;
  }
}

if (buildValid) {
  console.log('✅ Build validation passed');
} else {
  console.error('❌ Build validation failed. Some required files are missing.');
  process.exit(1);
}

console.log('🎉 Post-build tasks completed successfully');
console.log('📦 Build is ready for deployment');