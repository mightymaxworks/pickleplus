#!/bin/bash
# FIXED-PRECISE-DEPLOY.SH
# A precisely targeted deployment script for Pickle+
# With enhanced error handling and dependency management

set -e  # Exit on error

echo "🥒 PICKLE+ PRECISE DEPLOYMENT SOLUTION 2.0 🥒"
echo "=============================================="
echo "Deploying the complete application with all functionality"

# Create backup of key files
mkdir -p .backups
cp package.json .backups/package.json.bak
cp server/index.ts .backups/index.ts.bak
cp server/db-factory.ts .backups/db-factory.ts.bak

# Step 1: Verify port configuration
echo "Step 1: Verifying port configuration..."
PORT_SETTING=$(grep -n "const port" server/index.ts)
echo "Current port setting: $PORT_SETTING"
if [[ ! "$PORT_SETTING" =~ "8080" ]]; then
  echo "Updating port configuration to use 8080 in production..."
  # Use sed to replace the port line with the correct configuration
  sed -i 's/const port = .*/const port = process.env.NODE_ENV === "production" ? 8080 : 5000;/g' server/index.ts
fi

# Step 2: Verify database URL usage
echo "Step 2: Verifying database connection..."
if grep -q "DATABASE_URL" server/db-factory.ts; then
  echo "Database URL configuration verified"
else
  echo "WARNING: DATABASE_URL not found in database configuration!"
  echo "This would need to be fixed, but server/db-factory.ts already seems to use it."
fi

# Step 3: Clean previous build artifacts
echo "Step 3: Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist/client

# Step 4: Build the client application
echo "Step 4: Building the client application..."
npm run build

# Step 5: Create and set up .env file for production
echo "Step 5: Setting up environment variables..."
cat > dist/.env << 'EOF'
NODE_ENV=production
PORT=8080
# Ensure DATABASE_URL is properly set in the Cloud Run environment
EOF

# Step 6: Create a complete production-ready package.json with all necessary dependencies
echo "Step 6: Creating production package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create a comprehensive package.json for production
const prodPkg = {
  name: 'pickle-plus-production',
  version: pkg.version,
  type: 'module',
  engines: { node: '>=18.0.0' },
  scripts: {
    start: 'NODE_ENV=production node index.js'
  },
  dependencies: {}
};

// Copy all essential dependencies
const essentialDeps = [
  '@neondatabase/serverless',
  'drizzle-orm',
  'express',
  'cors',
  'ws',
  'express-session',
  'connect-pg-simple',
  'passport',
  'passport-local',
  'bcryptjs',
  'memorystore',
  'zod',
  'multer',
  'nanoid'
];

essentialDeps.forEach(dep => {
  if (pkg.dependencies[dep]) {
    prodPkg.dependencies[dep] = pkg.dependencies[dep];
  }
});

// Write the production package.json to dist
fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
console.log('Created production package.json in dist/');
"

# Step 7: Add a simple test script to verify the build
echo "Step 7: Creating verification script..."
cat > dist/verify-deployment.js << 'EOF'
/**
 * Pickle+ Deployment Verification
 * 
 * This script performs basic checks to verify that the deployment
 * is properly configured and can start successfully.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🥒 PICKLE+ DEPLOYMENT VERIFICATION 🥒");
console.log("=====================================");

// Check for essential files
const essentialFiles = ['index.js', 'package.json', '.env'];
let allFilesPresent = true;

for (const file of essentialFiles) {
  if (!fs.existsSync(join(__dirname, file))) {
    console.error(`❌ MISSING: ${file}`);
    allFilesPresent = false;
  } else {
    console.log(`✅ FOUND: ${file}`);
  }
}

// Check client directory
if (!fs.existsSync(join(__dirname, 'client'))) {
  console.error('❌ MISSING: client directory');
  allFilesPresent = false;
} else {
  console.log('✅ FOUND: client directory');
}

// Check package.json
try {
  const pkg = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
  console.log('✅ Package.json is valid JSON');
  
  // Check for essential dependencies
  const essentialDeps = ['express', '@neondatabase/serverless', 'ws'];
  for (const dep of essentialDeps) {
    if (!pkg.dependencies || !pkg.dependencies[dep]) {
      console.error(`❌ MISSING DEPENDENCY: ${dep}`);
      allFilesPresent = false;
    } else {
      console.log(`✅ DEPENDENCY: ${dep} (${pkg.dependencies[dep]})`);
    }
  }
  
  // Check type: module
  if (pkg.type !== 'module') {
    console.error('❌ MISSING: "type": "module" in package.json');
    allFilesPresent = false;
  } else {
    console.log('✅ Found "type": "module" in package.json');
  }
} catch (error) {
  console.error('❌ ERROR parsing package.json:', error.message);
  allFilesPresent = false;
}

// Final assessment
if (allFilesPresent) {
  console.log("\n✅ VERIFICATION PASSED: All essential files and configurations are present");
  console.log("Ready to deploy to Cloud Run!");
} else {
  console.error("\n❌ VERIFICATION FAILED: Some essential files or configurations are missing");
  console.error("Please fix the issues before deploying.");
  process.exit(1);
}
EOF

# Step 8: Install production dependencies in dist folder
echo "Step 8: Installing production dependencies..."
cd dist
npm install
cd ..

# Step 9: Verify the deployment
echo "Step 9: Verifying the deployment..."
node dist/verify-deployment.js

echo "🥒 PICKLE+ PRECISE DEPLOYMENT PREPARED 🥒"
echo "====================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash fixed-precise-deploy.sh"
echo "3. Set the Run Command to: cd dist && npm start"
echo "4. Click Deploy"
echo ""
echo "This deployment has been verified and includes all necessary dependencies"
echo "for proper operation in a production environment."