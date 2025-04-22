#!/bin/bash

echo "🚀 Starting deployment build process..."

# Clean the output directory
echo "🧹 Cleaning output directory..."
rm -rf dist
mkdir -p dist/public

# Create a temporary file with a perf_hooks shim
echo "🛠️ Creating performance shim for client-side..."
cat > performance-shim.js << 'EOF'
/**
 * Simple performance shim for client builds
 * This replaces the Node.js perf_hooks module with browser-compatible performance API
 */
export const performance = window.performance;
EOF

# Create a special vite config for deployment
echo "📝 Creating deployment Vite config..."
cat > vite.deploy.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // Shim Node.js modules with empty implementations
      "perf_hooks": path.resolve(__dirname, "performance-shim.js"),
      "pg": path.resolve(__dirname, "empty-module.js"),
      "pg-native": path.resolve(__dirname, "empty-module.js"),
      "postgres": path.resolve(__dirname, "empty-module.js"),
      "@neondatabase/serverless": path.resolve(__dirname, "empty-module.js"),
      "drizzle-orm": path.resolve(__dirname, "empty-module.js"),
      "drizzle-orm/neon-serverless": path.resolve(__dirname, "empty-module.js"),
      "ws": path.resolve(__dirname, "empty-module.js"),
      "net": path.resolve(__dirname, "empty-module.js"),
      "tls": path.resolve(__dirname, "empty-module.js"),
      "fs": path.resolve(__dirname, "empty-module.js"),
      "path": path.resolve(__dirname, "empty-module.js"),
      "os": path.resolve(__dirname, "empty-module.js"),
      "crypto": path.resolve(__dirname, "empty-module.js"),
      "http": path.resolve(__dirname, "empty-module.js"),
      "express": path.resolve(__dirname, "empty-module.js"),
      "express-session": path.resolve(__dirname, "empty-module.js"),
    }
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    rollupOptions: {
      // Don't external any modules since we're shimming them
      external: []
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
EOF

# Build client
echo "🏗️ Building client..."
npx vite build --config vite.deploy.config.js

# Create a build script for the server
echo "📝 Creating server build script..."
cat > server-build.js << 'EOF'
const esbuild = require('esbuild')

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/server.js',
      external: [
        'pg',
        'pg-native',
        '@neondatabase/serverless',
        'ws'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    })
    console.log('✅ Server build completed')
  } catch (err) {
    console.error('❌ Server build failed:', err)
    process.exit(1)
  }
}

build()
EOF

# Build server
echo "🏗️ Building server..."
node server-build.js

# Create server entry point for production
echo "📝 Creating production entry point..."
cat > dist/index.js << 'EOF'
// Production entry point
process.env.NODE_ENV = 'production';

// Import and run the server
require('./server.js');
EOF

# Patch for Cloud Run port
echo "🔧 Patching server for Cloud Run port..."
sed -i 's/process.env.NODE_ENV === .production. ? 8080 : 5000/8080/g' dist/server.js
sed -i 's/const port = process\.env\.PORT || 5000/const port = 8080/g' dist/server.js

# Clean up temporary files
echo "🧹 Cleaning up..."
rm performance-shim.js server-build.js vite.deploy.config.js

echo "✅ Deployment build completed!"
echo ""
echo "To deploy:"
echo "  1. Click the Deploy button in Replit"
echo "  2. Set deploy directory to: dist"
echo "  3. Set build command to: ./deploy.sh"
echo "  4. Set run command to: node index.js"
echo "  5. Click Deploy"