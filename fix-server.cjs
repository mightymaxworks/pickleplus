/**
 * Pickle+ Production Server with Authentication - CommonJS Version
 * This script creates a production-ready server file that handles authentication
 */

const fs = require('fs');
const path = require('path');

// Create the final server file with session support
function createServerFileWithAuth() {
  console.log("Creating production server with authentication support...");
  
  const productionServerCode = `
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const ConnectPgSimple = require('connect-pg-simple');
const bcryptjs = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq } = require('drizzle-orm');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Connect to database
console.log('Connecting to database...');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Load schema
const schema = {
  users: {
    id: { name: 'id' },
    username: { name: 'username' },
    password: { name: 'password' }
  }
};

const db = drizzle({ client: pool, schema });

// Standard middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Configure session management
const PostgresSessionStore = ConnectPgSimple(session);
const sessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: process.env.DATABASE_URL
  },
  createTableIfMissing: true
});

// Session configuration
app.set('trust proxy', 1);
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'pickle-plus-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false, // Will be handled by Replit's proxy
    sameSite: 'lax'
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Get user from database
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Configure local strategy for username/password login
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // Find user by username
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    
    if (!user) {
      return done(null, false);
    }
    
    // Compare password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return done(null, false);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Authentication API routes
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    req.login(user, (err) => {
      if (err) return next(err);
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

app.get('/api/auth/current-user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Application routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'client')));

// Handle all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(\`Server listening at http://0.0.0.0:\${port}\`);
  console.log(\`Database connection: \${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}\`);
});
`;

  try {
    // Ensure the dist directory exists
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist', { recursive: true });
    }
    
    fs.writeFileSync('./dist/index.js', productionServerCode);
    console.log("✅ Created production server with authentication support");
    return true;
  } catch (error) {
    console.error("❌ Failed to create production server file:", error);
    return false;
  }
}

// Execute the function
createServerFileWithAuth();