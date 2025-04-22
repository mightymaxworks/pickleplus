/**
 * Simple deployment configuration for Framework 5.2
 * 
 * This configuration solves the issues with postgres and browser-only modules
 * by simply excluding them from the client bundle. These modules should only
 * be used on the server side.
 */

module.exports = {
  // Directories to exclude from the client build
  excludeFromClient: [
    'server/**/*',
    'shared/schema/**/*',
    'drizzle/**/*'
  ],
  
  // Node modules to external from client build
  // These modules should only be used on the server
  externalModules: [
    'pg', 
    'pg-native',
    'postgres',
    '@neondatabase/serverless',
    'drizzle-orm',
    'drizzle-orm/neon-serverless',
    'drizzle-kit',
    'connect-pg-simple',
    'ws',
    'express',
    'express-session',
    'http',
    'fs',
    'path',
    'os',
    'crypto',
    'net',
    'tls',
    'perf_hooks',
    'performance'
  ],
  
  // Port configuration
  devPort: 5000,
  prodPort: 8080  
}