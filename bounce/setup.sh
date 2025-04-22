#!/bin/bash
# Bounce CI/CD Setup Script
# Installs necessary dependencies for Bounce CI/CD
#
# Run with: bash bounce/setup.sh

# Set error handling
set -e

echo "=== Setting up Bounce CI/CD Framework ==="

# Create required directories
echo "Creating required directories..."
mkdir -p bounce/tests
mkdir -p reports/evidence
mkdir -p reports/ci

# Install dev dependencies directly without using packager_tool
# This avoids issues with auto-including @shared/schema and other problematic packages
echo "Installing development dependencies..."

# Install dependencies one by one to avoid package resolution issues
echo "Installing Playwright..."
npm install -D playwright@latest --no-save

echo "Installing colors..."
npm install -D colors@latest --no-save

echo "Installing commander..."
npm install -D commander@latest --no-save

echo "Installing dotenv..."
npm install -D dotenv@latest --no-save

# IMPORTANT: Using --no-save to prevent modifying package.json
# This is a workaround for Replit's package management
echo "Dependencies installed without modifying package.json"

# Install global packages if needed
echo "Installing global dependencies..."
if ! command -v npx &> /dev/null; then
  npm install -g npx
fi

# Set permissions
echo "Setting permissions..."
chmod +x bounce/setup.sh

echo "=== Bounce CI/CD Framework Setup Complete ==="
echo ""
echo "IMPORTANT NOTE:"
echo "The dependencies have been installed in the node_modules directory"
echo "but package.json has NOT been modified to avoid conflicts with Replit's"
echo "package management system. If you reinstall node_modules or restart the"
echo "Repl, you'll need to run this setup script again."
echo ""
echo "Usage:"
echo "  - Run tests: npx tsx bounce/cli.ts run --suite all"
echo "  - Run CI/CD: npx tsx bounce/ci/run-ci.ts"
echo "  - Initialize test suite: npx tsx bounce/cli.ts init"
echo ""