
// Pickle+ Production Entrypoint
// This file sets NODE_ENV to production and runs the server

process.env.NODE_ENV = 'production';

// Import the server index
import './server/index.js';
