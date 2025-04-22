#!/bin/bash

# PKL-278651-BOUNCE-0010-CICD - Bounce Setup Script
# Installs and configures the Bounce testing system
#
# @framework Framework5.2
# @version 1.0.0
# @lastModified 2025-04-22

# Ensure script exit on any error
set -e

echo "===== Bounce Testing System Setup ====="
echo "Framework5.2 Compliance: PKL-278651-BOUNCE-0010-CICD"
echo "----------------------------------------"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p reports
mkdir -p evidence

# Check if Playwright is installed
if npx playwright --version &> /dev/null; then
  echo "✅ Playwright is already installed"
else
  echo "Installing Playwright..."
  npm install -D playwright
  echo "✅ Playwright installed"
fi

# Check if database schema exists
echo "Checking database schema..."
if node -e "
const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { eq } = require('drizzle-orm');

// Configure neon to use ws
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function checkSchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    // Try to query the bounce_test_runs table
    await db.execute(sql\`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'bounce_test_runs'
    )\`);
    
    return true;
  } catch (error) {
    return false;
  } finally {
    await pool.end();
  }
}

checkSchema().then(exists => {
  if (exists) {
    console.log('true');
  } else {
    console.log('false');
  }
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
" | grep -q "true"; then
  echo "✅ Database schema exists"
else
  echo "Creating database schema..."
  npx tsx create-bounce-tables.ts
  echo "✅ Database schema created"
fi

# Install other dependencies if needed
echo "Checking dependencies..."
npm list drizzle-orm > /dev/null || npm install drizzle-orm
npm list drizzle-zod > /dev/null || npm install drizzle-zod

echo "----------------------------------------"
echo "✅ Bounce Testing System Setup Complete!"
echo "----------------------------------------"
echo "Usage:"
echo "  npx tsx bounce/cli.ts help              View CLI help"
echo "  npx tsx bounce/cli.ts run               Run tests"
echo "  npx tsx bounce/cli.ts simple            Run a simple demo"
echo "  npx tsx bounce/cli.ts list              List all test runs"
echo "  npx tsx bounce/cli.ts report <id>       Generate a bug report"
echo "  npx tsx bounce/cli.ts plan <id>         Generate a sprint plan"
echo "----------------------------------------"