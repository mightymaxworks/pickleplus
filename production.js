/**
 * Production startup file
 * 
 * This file sets the NODE_ENV to 'production' before starting the server.
 * Use this as the entry point for deployment.
 */

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the server using ES modules (since package.json has "type": "module")
import './server/index.js';