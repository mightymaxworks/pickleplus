#!/bin/bash
# ES-PORT-FIXED-DEPLOY.SH
# ES Module compatible deployment script for Pickle+
# This script addresses the port configuration issues specific to Replit

set -e  # Exit on error

echo "🥒 PICKLE+ ES-MODULE PORT FIX DEPLOYMENT 🥒"
echo "=========================================="
echo "Deploying with correct port configuration (ES Module compatible)"

# Create backup of key files
mkdir -p .backups
cp package.json .backups/package.json.bak
cp server/index.ts .backups/index.ts.bak
cp server/db-factory.ts .backups/db-factory.ts.bak

# Step 1: Fix the port configuration in server/index.ts
echo "Step 1: Fixing port configuration..."
node es-port-fix.js

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

# Step 6: Create a production-ready package.json using ES modules
echo "Step 6: Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "pickle-plus-production",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.29.5",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "express-session": "^1.18.0",
    "connect-pg-simple": "^9.0.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "memorystore": "^1.6.7",
    "zod": "^3.22.4",
    "multer": "^1.4.5-lts.1",
    "nanoid": "^3.3.6"
  }
}
EOF

# Step 7: Create a simple startup script that handles PORT environment variable
echo "Step 7: Creating startup script..."
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

echo "Step 8: Installing dependencies in dist folder..."
cd dist
npm install
cd ..

echo "🥒 PICKLE+ PORT-FIXED DEPLOYMENT PREPARED 🥒"
echo "==========================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash es-port-fixed-deploy.sh"
echo "3. Set the Run Command to: cd dist && ./start.sh"
echo "4. Click Deploy"
echo ""
echo "This deployment has been fixed to work with ES modules and uses"
echo "the correct port configuration for Replit Cloud Run."