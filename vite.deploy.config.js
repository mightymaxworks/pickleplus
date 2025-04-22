const { defineConfig } = require("vite");
const path = require("path");

/**
 * Special Vite config for deployment only
 * This config:
 * 1. Excludes Node.js modules from browser builds
 * 2. Properly handles optimizeDeps and browser externals
 */
module.exports = defineConfig({
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Exclude all Node-only packages from browser build 
      external: [
        'performance',
        'perf_hooks',
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'net',
        'tls',
        'pg',
        'pg-native',
        '@neondatabase/serverless',
        'drizzle-orm',
        'ws',
        'connect-pg-simple'
      ]
    }
  },
  define: {
    // Provide empty polyfills for Node.js built-ins
    'process.env': '{}',
    'global': '{}',
  },
  resolve: {
    alias: {
      // Map Node-only modules to empty objects
      fs: path.resolve(__dirname, 'empty-module.js'),
      path: path.resolve(__dirname, 'empty-module.js'),
      os: path.resolve(__dirname, 'empty-module.js'),
      crypto: path.resolve(__dirname, 'empty-module.js'),
      stream: path.resolve(__dirname, 'empty-module.js'),
      net: path.resolve(__dirname, 'empty-module.js'),
      tls: path.resolve(__dirname, 'empty-module.js'),
      perf_hooks: path.resolve(__dirname, 'empty-module.js'),
      performance: path.resolve(__dirname, 'empty-module.js')
    }
  }
});