const { build } = require('esbuild');
const path = require('path');

async function buildServer() {
  try {
    console.log('Building server...');
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node16',
      outfile: 'dist/index.js',
      external: [
        // Mark these packages as external to avoid bundling issues
        '@neondatabase/serverless',
        'pg', 
        'pg-native',
        'ws',
        'drizzle-orm',
        'drizzle-orm/neon-serverless',
        'node-fetch',
        'express-session',
        'connect-pg-simple',
        'memorystore',
        // Add any other problematic packages
      ],
      format: 'cjs',
      sourcemap: true,
      minify: false,
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
      },
    });
    console.log('Server build completed successfully.');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

buildServer();