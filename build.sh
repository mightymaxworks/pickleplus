#!/bin/bash

# Build script for Framework 5.2
echo "Starting build process for Framework 5.2..."

# 1. Build client with Vite
echo "Building client with Vite..."
npx vite build

# 2. Build server with custom esbuild config for better compatibility
echo "Building server with esbuild..."
node build.js

# 3. Copy necessary files to dist
echo "Copying package.json to dist for dependency installation..."
cp package.json dist/

echo "Build completed successfully."