
// Simple production server
// This sets the environment to production and starts the server
process.env.NODE_ENV = 'production';
process.env.PORT = 8080;

// Using require for server
const { createRequire } = require('module');
const require = createRequire(import.meta.url);
require('./server/index.js');
