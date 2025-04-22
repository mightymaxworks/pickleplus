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

# Install dev dependencies
echo "Installing development dependencies..."
npm install -D playwright@latest colors@latest commander@latest dotenv@latest

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
echo "Usage:"
echo "  - Run tests: npx tsx bounce/cli.ts run --suite all"
echo "  - Run CI/CD: npx tsx bounce/ci/run-ci.ts"
echo "  - Initialize test suite: npx tsx bounce/cli.ts init"
echo ""