#!/bin/bash

# PKL-278651-BOUNCE-0010-CICD - Bounce Setup Script
# 
# Setup script for the Bounce automated testing system
# Installs dependencies and configures the testing environment
# 
# @framework Framework5.2
# @version 1.0.0
# @lastModified 2025-04-22

# Make sure we're in the project root
cd "$(dirname "$0")/.."

echo "=============================="
echo "Bounce Testing System Setup"
echo "=============================="
echo "Setting up the Bounce automated testing system..."

# Create necessary directories
mkdir -p reports evidence

# Check if playwright is installed
if ! npx playwright --version &> /dev/null; then
  echo "Installing Playwright..."
  # Install playwright with chromium browser only to reduce size
  npx playwright install --with-deps chromium
else
  echo "Playwright is already installed."
fi

# Check if necessary npm packages are installed
echo "Checking required npm packages..."
required_packages=("drizzle-orm" "drizzle-zod" "zod" "playwright")

for package in "${required_packages[@]}"; do
  if ! grep -q "\"$package\"" package.json; then
    echo "Package $package is not in package.json, please install it using:"
    echo "npm install $package"
  fi
done

# Check database connection
echo "Checking database connection..."
if [[ -z "${DATABASE_URL}" ]]; then
  echo "DATABASE_URL environment variable is not set."
  echo "Please set it to connect to your database."
else
  echo "Database URL is configured."
fi

# Create evidence directory if it doesn't exist
if [ ! -d "evidence" ]; then
  mkdir -p evidence
  echo "Created evidence directory."
fi

# Create reports directory if it doesn't exist
if [ ! -d "reports" ]; then
  mkdir -p reports
  echo "Created reports directory."
fi

echo "Setup complete!"
echo "To run Bounce tests, use: npx tsx bounce/cli.ts run"
echo "To generate a report, use: npx tsx bounce/cli.ts report <test-run-id>"
echo "To generate a sprint plan, use: npx tsx bounce/cli.ts plan <test-run-id>"
echo "For a simple demo run that doesn't require Playwright, use: npx tsx bounce/simple-run.ts"
echo "=============================="