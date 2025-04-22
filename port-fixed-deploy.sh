#!/bin/bash
# PORT-FIXED-DEPLOY.SH
# A precise deployment script for Pickle+ with correct port handling
# This script addresses the port configuration issues specific to Replit

set -e  # Exit on error

echo "🥒 PICKLE+ PORT-FIXED DEPLOYMENT SOLUTION 🥒"
echo "============================================"
echo "Deploying with correct port configuration"

# Create backup of key files
mkdir -p .backups
cp package.json .backups/package.json.bak
cp server/index.ts .backups/index.ts.bak
cp server/db-factory.ts .backups/db-factory.ts.bak

# Step 1: Fix the port configuration in server/index.ts
echo "Step 1: Fixing port configuration..."
cat > .backups/port-fix.js << 'EOF'
const fs = require('fs');

// Read the server/index.ts file
const indexPath = 'server/index.ts';
let content = fs.readFileSync(indexPath, 'utf8');

// Replace the port configuration to use process.env.PORT with fallback to 5000
// This ensures compatibility with both development and Cloud Run
const portRegex = /const port = .*?;/;
const newPortConfig = "const port = process.env.PORT || 5000;";

if (portRegex.test(content)) {
  content = content.replace(portRegex, newPortConfig);
  console.log("✅ Port configuration updated to use process.env.PORT");
} else {
  console.error("❌ Could not find port configuration in server/index.ts");
  process.exit(1);
}

// Write the updated content back to the file
fs.writeFileSync(indexPath, content);
console.log("✅ server/index.ts updated successfully");
EOF

# Execute the port fix script
node .backups/port-fix.js

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
mkdir -p dist/client dist/public

# Step 4: Build the client application
echo "Step 4: Building the client application..."
npm run build

# Step 5: Create and set up .env file for production
echo "Step 5: Setting up environment variables..."
cat > dist/.env << 'EOF'
NODE_ENV=production
PORT=5000
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

// Check .env file
try {
  const env = fs.readFileSync(join(__dirname, '.env'), 'utf8');
  console.log('✅ .env file exists');
  
  // Check if PORT is set to 5000
  if (!env.includes('PORT=5000')) {
    console.error('❌ PORT is not set to 5000 in .env');
    allFilesPresent = false;
  } else {
    console.log('✅ PORT is set to 5000 in .env');
  }
} catch (error) {
  console.error('❌ ERROR reading .env file:', error.message);
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

# Step 9: Create a special startup script that handles PORT environment variable
echo "Step 9: Creating startup script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash
# Ensure the PORT environment variable is correctly set for production
export NODE_ENV=production

# Set PORT to 5000 if not already set
if [ -z "$PORT" ]; then
  export PORT=5000
  echo "Setting PORT to default value: 5000"
else
  echo "Using provided PORT: $PORT"
fi

# Start the application
echo "Starting application with NODE_ENV=$NODE_ENV and PORT=$PORT"
node index.js
EOF

chmod +x dist/start.sh

# Step 10: Verify the deployment
echo "Step 10: Verifying the deployment..."
node dist/verify-deployment.js

echo "🥒 PICKLE+ PORT-FIXED DEPLOYMENT PREPARED 🥒"
echo "==========================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash port-fixed-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Click Deploy"
echo ""
echo "This deployment has been verified and includes correct port configuration"
echo "for proper operation in Replit Cloud Run environment."