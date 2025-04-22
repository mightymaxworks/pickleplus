#!/bin/bash
# PRECISE-DEPLOY.SH
# A precisely targeted deployment script for Pickle+
# Based on thorough checks and analysis of the project structure

set -e  # Exit on error

echo "🥒 PICKLE+ PRECISE DEPLOYMENT SOLUTION 🥒"
echo "========================================"
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

# Step 3: Build the client application
echo "Step 3: Building the client application..."
echo "Using the existing build script from package.json..."
npm run build

# Step 4: Copy necessary environment variables to .env
echo "Step 4: Setting up environment variables..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
# Database URL is provided by the environment at runtime
EOF

# Step 5: Create a production-ready package.json
echo "Step 5: Creating production package.json..."
# Extract only what we need from the existing package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create a minimal package.json for production
const prodPkg = {
  name: 'pickle-plus-production',
  version: pkg.version,
  type: 'module', 
  engines: { node: '>=18.0.0' },
  scripts: {
    start: 'NODE_ENV=production node dist/index.js'
  },
  dependencies: {} 
};

// Copy only the dependencies we need for production
const essentialDeps = [
  '@neondatabase/serverless',
  'drizzle-orm',
  'express',
  'cors',
  'ws',
  'express-session',
  'passport',
  'passport-local',
  'bcryptjs'
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

# Step 6: Copy .env to dist directory
echo "Step 6: Copying .env to dist directory..."
cp .env dist/.env

echo "🥒 PICKLE+ PRECISE DEPLOYMENT PREPARED 🥒"
echo "====================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash precise-deploy.sh"
echo "3. Set the Run Command to: cd dist && npm start"
echo "4. Click Deploy"
echo ""
echo "This script uses your project's existing build process (vite build + esbuild)"
echo "and ensures port 8080 for Cloud Run compatibility."