/**
 * PKL-278651-CONFIG-0002-PROD
 * Production Configuration
 * 
 * Production-specific configuration overrides.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

module.exports = {
  server: {
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    trustProxy: true, // For proper IP detection behind load balancers
  },
  database: {
    // Production-optimized database settings
    connectionString: process.env.DATABASE_URL,
    poolSize: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false // Often needed for cloud database providers
    }
  },
  logging: {
    level: 'info',
    format: 'json', // Structured logging for production
  },
  auth: {
    // Must use strong session secret in production
    sessionMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    cookie: {
      secure: true, // Requires HTTPS
      sameSite: 'strict',
    }
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300, // Higher limit for production load
    },
  },
  // Production-specific settings
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on application needs
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", "https://api.pickleplus.com"], // Example API domain
        }
      }
    }
  },
  cache: {
    ttl: 3600, // 1 hour default cache TTL
    checkPeriod: 600, // Check for expired cache items every 10 minutes
  }
};