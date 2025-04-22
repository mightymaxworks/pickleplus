#!/bin/bash

echo "🚀 Starting simple deployment build..."

# 1. Clean the output directory
rm -rf dist
mkdir -p dist/public

# 2. Create a temporary vite config that excludes Node.js modules
cat > deploy-vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Exclude server-only modules
      external: [
        'pg', 'pg-native', 'postgres', '@neondatabase/serverless', 'ws',
        'drizzle-orm', 'drizzle-orm/neon-serverless', 'express', 'http',
        'fs', 'path', 'os', 'crypto', 'net', 'tls', 'perf_hooks'
      ]
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
EOF

# 3. Build the client
echo "🔨 Building client for production..."
npx vite build --config deploy-vite.config.js

# 4. Build the server
echo "🔨 Building server for production..."
cat > server-esbuild.js << 'EOF'
const { build } = require('esbuild');

async function buildServer() {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node16',
    outfile: 'dist/index.js',
    external: ['pg', 'pg-native', '@neondatabase/serverless', 'ws'],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
}

buildServer().catch(() => process.exit(1));
EOF

node server-esbuild.js

# 5. Add port 8080 to the server for Cloud Run
echo "🔧 Patching server for Cloud Run (port 8080)..."
sed -i 's/process.env.NODE_ENV === .production. ? 8080 : 5000/8080/g' dist/index.js
sed -i 's/const port = process\.env\.PORT || 5000/const port = 8080/g' dist/index.js

# 6. Clean up
rm deploy-vite.config.js server-esbuild.js

echo "✅ Deployment build complete!"
echo ""
echo "To deploy this build, click the 'Deploy' button in Replit and use:"
echo "  Deploy directory: dist"
echo "  Build command: ./simple-deploy.sh"
echo "  Run command: node dist/index.js"