#!/bin/bash
# PRE-DEPLOYMENT CHECK SCRIPT
# This script performs comprehensive checks before deploying the Pickle+ application
# It will identify potential issues with paths, dependencies, and configuration

echo "🥒 PICKLE+ PRE-DEPLOYMENT CHECK 🥒"
echo "===================================="

# Function to display check result
check_result() {
  if [ $1 -eq 0 ]; then
    echo "✅ $2"
  else
    echo "❌ $2"
    echo "   └─ $3"
  fi
}

# Function to check if a file exists
check_file() {
  if [ -f "$1" ]; then
    check_result 0 "File exists: $1"
    return 0
  else
    check_result 1 "File missing: $1" "This file is required for the application to function properly"
    return 1
  fi
}

# Function to check if a directory exists
check_dir() {
  if [ -d "$1" ]; then
    check_result 0 "Directory exists: $1"
    return 0
  else
    check_result 1 "Directory missing: $1" "This directory is required for the application to function properly"
    return 1
  fi
}

echo "Step 1: Checking critical directories..."
check_dir "client"
check_dir "server"
check_dir "shared"
check_dir "public"
check_dir "uploads"

echo ""
echo "Step 2: Checking critical files..."
check_file "server/index.ts"
check_file "server/routes.ts"
check_file "server/db.ts"
check_file "server/storage.ts"
check_file "server/auth.ts"
check_file "package.json"
check_file "drizzle.config.ts"

echo ""
echo "Step 3: Checking for Vite build configuration..."
check_file "vite.config.ts"

echo ""
echo "Step 4: Checking package.json scripts..."
SCRIPTS=$(node -e "console.log(JSON.stringify(require('./package.json').scripts))")
echo "Available scripts: $SCRIPTS"

if node -e "process.exit(require('./package.json').scripts.build ? 0 : 1)"; then
  check_result 0 "Build script exists"
else
  check_result 1 "Build script missing" "The build script is required for building the React frontend"
fi

if node -e "process.exit(require('./package.json').scripts.dev ? 0 : 1)"; then
  check_result 0 "Dev script exists"
else
  check_result 1 "Dev script missing" "The dev script is required for starting the development server"
fi

echo ""
echo "Step 5: Checking PORT configuration..."
SERVER_INDEX_CONTENT=$(cat server/index.ts)
if [[ $SERVER_INDEX_CONTENT =~ (const PORT|const port) ]]; then
  PORT_CONFIG=$(grep -E "const (PORT|port)" server/index.ts)
  echo "PORT configuration found: $PORT_CONFIG"
  if [[ $PORT_CONFIG =~ 5000 ]]; then
    echo "⚠️ Server using port 5000 in development, will need to use 8080 in production"
  fi
else
  check_result 1 "PORT not configured in server/index.ts" "The PORT variable is required for starting the server"
fi

echo ""
echo "Step 6: Checking database configuration..."
if grep -q "process.env.DATABASE_URL" server/db.ts; then
  check_result 0 "Database URL environment variable used"
else
  check_result 1 "Database URL environment variable not used" "The app should use DATABASE_URL for database connections"
fi

echo ""
echo "Step 7: Testing npm build to check for issues..."
echo "This may take a moment..."

# Create a temporary build log
BUILD_LOG=$(mktemp)
npm run build > $BUILD_LOG 2>&1
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
  check_result 0 "React build successful"
else
  check_result 1 "React build failed" "Check the build log at $BUILD_LOG"
  echo "Here are the last 10 lines of the build log:"
  tail -n 10 $BUILD_LOG
fi

echo ""
echo "Step 8: Checking client-side imports..."
CLIENT_IMPORTS=$(find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "from ''" 2>/dev/null)
if [ -z "$CLIENT_IMPORTS" ]; then
  check_result 0 "No empty imports found in client code"
else
  check_result 1 "Empty imports found in client code" "Empty imports can cause build failures"
  echo "Files with empty imports:"
  echo "$CLIENT_IMPORTS"
fi

echo ""
echo "Step 9: Checking asset path references..."
ASSET_PATHS=$(find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "/src/assets" 2>/dev/null)
if [ -z "$ASSET_PATHS" ]; then
  check_result 0 "No absolute asset paths found"
else
  check_result 1 "Absolute asset paths found" "Use relative paths or @assets/ for assets"
  echo "Files with absolute asset paths:"
  echo "$ASSET_PATHS"
fi

echo ""
echo "Step 10: Checking for hard-coded URLs..."
HARDCODED_URLS=$(find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "http://localhost" 2>/dev/null)
if [ -z "$HARDCODED_URLS" ]; then
  check_result 0 "No hard-coded localhost URLs found"
else
  check_result 1 "Hard-coded localhost URLs found" "Hard-coded URLs can cause issues in production"
  echo "Files with hard-coded URLs:"
  echo "$HARDCODED_URLS"
fi

echo ""
echo "Step 11: Checking session configuration..."
if grep -q "session" server/routes.ts; then
  check_result 0 "Session middleware found in routes"
else
  check_result 1 "Session middleware not found in routes" "Session middleware is required for authentication"
fi

echo ""
echo "Step 12: Checking for WebSocket usage..."
WS_USAGE=$(grep -r "WebSocket" server/ --include="*.ts" --include="*.js" 2>/dev/null)
if [ -n "$WS_USAGE" ]; then
  check_result 0 "WebSocket usage found"
  echo "WebSocket configuration will need to be updated for production"
else
  check_result 0 "No WebSocket usage found"
fi

echo ""
echo "Step 13: Generating suggested deployment steps..."
echo "Based on the checks, here are the recommended deployment steps:"
echo "1. Fix any issues identified above (marked with ❌)"
echo "2. Ensure the server listens on port 8080 in production (Cloud Run requirement)"
echo "3. Update database URL configuration for production"
echo "4. Update WebSocket configurations for production"
echo "5. Use the final-deploy.sh script for deployment"

echo ""
echo "🥒 PRE-DEPLOYMENT CHECK COMPLETE 🥒"
echo "==================================="