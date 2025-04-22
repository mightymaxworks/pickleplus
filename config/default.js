/**
 * PKL-278651-CONFIG-0001-PROD
 * Default Configuration
 * 
 * Base configuration for all environments.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  },
  database: {
    // Base database configuration
    connectionString: process.env.DATABASE_URL,
    poolSize: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'dev',
  },
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'pickle-plus-dev-secret',
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  client: {
    // Base client configuration
    apiBaseUrl: '/api',
  }
};