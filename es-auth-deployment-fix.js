// ES Module compatible session and authentication fix for deployment
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the final server file with session support
export function createServerFileWithAuth() {
  console.log("Creating production server with authentication support...");
  
  const productionServerCode = `
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import ConnectPgSimple from 'connect-pg-simple';
import bcryptjs from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.js';

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Connect to database
console.log('Connecting to database...');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
    const [user] = await db.select().from(schema.users).where(sql\`id = \${id}\`);
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
    const [user] = await db.select().from(schema.users).where(sql\`username = \${username}\`);
    
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
    fs.writeFileSync('./dist/index.js', productionServerCode);
    console.log("✅ Created production server with authentication support");
    return true;
  } catch (error) {
    console.error("❌ Failed to create production server file:", error);
    return false;
  }
}

// Import drizzle schema for production
export function exportSchemaForProduction() {
  console.log("Exporting database schema for production...");
  
  try {
    // Check if shared/schema.ts exists
    const schemaPath = join(__dirname, 'shared', 'schema.ts');
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ schema.ts not found at path:", schemaPath);
      return false;
    }

    // Read the schema file content
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Convert TypeScript import/export to ES modules
    let esModuleSchema = schemaContent
      .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'import {$1} from "$2.js"')
      .replace(/export\s+{([^}]+)}/g, 'export {$1}');
    
    // Write the ES module version to the dist folder
    fs.writeFileSync('./dist/schema.js', esModuleSchema);
    console.log("✅ Exported database schema for production");
    return true;
  } catch (error) {
    console.error("❌ Failed to export schema:", error);
    return false;
  }
}

// Main execution
createServerFileWithAuth();
exportSchemaForProduction();