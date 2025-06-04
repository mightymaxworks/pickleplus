/**
 * Production Authentication Fix for Pickle+
 * Fixes session configuration and authentication for deployed environment
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Fixing authentication for production deployment...');

// Read the current auth.ts file
const authFilePath = path.join(__dirname, 'server', 'auth.ts');
let authContent = fs.readFileSync(authFilePath, 'utf8');

// Fix session configuration for production
const sessionConfigFix = `  // Create session configuration optimized for production
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pickle-plus-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: isProduction, // Use secure cookies only in production
      sameSite: isProduction ? "none" : "lax", // Allow cross-site for production
      path: '/'
    },
    name: "pickle_session_id"
  };`;

// Replace the session configuration
authContent = authContent.replace(
  /\/\/ Create session configuration[\s\S]*?name: "pickle_session_id"[^}]*}/,
  sessionConfigFix
);

// Fix trust proxy configuration
const proxyConfigFix = `  // Configure session middleware for production deployment
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy for HTTPS
  } else {
    app.set('trust proxy', true); // Trust all proxies for development
  }`;

// Replace the trust proxy configuration
authContent = authContent.replace(
  /\/\/ Configure session middleware[\s\S]*?app\.set\('trust proxy'[^;]*;/,
  proxyConfigFix
);

// Add CORS headers for authentication in production
const corsHeadersFix = `
  // Add CORS headers for authentication
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
    }
    next();
  });

  app.use(session(sessionSettings));`;

// Replace the session setup
authContent = authContent.replace(
  /app\.use\(session\(sessionSettings\)\);/,
  corsHeadersFix
);

// Write the fixed auth file
fs.writeFileSync(authFilePath, authContent);

console.log('✅ Authentication configuration fixed for production');
console.log('🔧 Session cookies now properly configured for HTTPS');
console.log('🌐 CORS headers added for cross-origin authentication');
console.log('🚀 Ready for production deployment');