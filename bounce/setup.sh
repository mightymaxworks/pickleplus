#!/bin/bash
# PKL-278651-BOUNCE-0010-CICD - Bounce Test Environment Setup Script
# 
# This script sets up the required dependencies for running Bounce tests,
# including Playwright.
#
# @framework Framework5.2
# @version 1.0.0
# @lastModified 2025-04-22

echo "Setting up Bounce automated testing environment..."

# Create reports and evidence directories if they don't exist
echo "Creating report directories..."
mkdir -p ./reports
mkdir -p ./evidence

# Install Playwright (only if needed)
if ! npm list playwright | grep -q "playwright"; then
  echo "Installing Playwright..."
  npm install --no-save playwright@latest
else
  echo "Playwright already installed."
fi

# Check if the browsers are already installed
if [ ! -d "./node_modules/playwright/.local-browsers" ]; then
  echo "Installing Playwright browsers..."
  npx playwright install --with-deps chromium firefox webkit
else
  echo "Playwright browsers already installed."
fi

# Create default test structure if it doesn't exist
if [ ! -d "./bounce/tests" ]; then
  echo "Creating default test structure..."
  mkdir -p ./bounce/tests
  
  # Create a basic test suite
  cat > ./bounce/tests/basic-test-suite.json <<EOL
{
  "name": "basic",
  "tests": [
    {
      "name": "Home Page Test",
      "description": "Tests the home page loads correctly",
      "paths": ["/"],
      "steps": [
        {
          "action": "navigate",
          "target": "/"
        },
        {
          "action": "assertElementExists",
          "target": "body"
        }
      ]
    }
  ]
}
EOL
fi

echo "Bounce testing environment setup complete!"
echo "You can now run tests using: npx tsx bounce/cli.ts run"