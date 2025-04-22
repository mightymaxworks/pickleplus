/**
 * Production Server Entry Point
 * Framework 5.2 compatible deployment entry point
 */

// Set Node environment to production
process.env.NODE_ENV = 'production';

// Load the compiled server code
require('./dist/index.js');