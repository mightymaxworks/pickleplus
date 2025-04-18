/**
 * PKL-278651-COMM-0019-VISUALS
 * Community Visual Upload Test Server
 * 
 * This script creates a simple Express server that:
 * 1. Sets up a session with the main app session cookie
 * 2. Serves the test-upload.html file 
 * 3. Provides endpoints to test file uploads
 * 
 * Run with: npx tsx test-upload.ts
 */
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
// Don't import storage from server directly
// import { storage } from './server/storage';

const app = express();
const PORT = 5050;

// Use a simple memory store for sessions
const MemoryStore = require('memorystore')(session);

// Use the same session configuration as the main app
const sessionSettings = {
  secret: process.env.SESSION_SECRET || "pickle-plus-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false, // Set to false for development to work in Replit
    sameSite: "lax" as const
  },
  name: "connect.sid" // Use default cookie name
};

// Set up middleware
app.use(cookieParser());
app.use(session(sessionSettings));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
  // Read the HTML file
  const htmlPath = path.join(__dirname, 'test-upload.html');
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      return res.status(500).send('Error loading test page');
    }
    
    // Set user as authenticated for testing
    if (req.session) {
      (req.session as any).passport = { user: 1 }; // User ID 1 (mightymax)
    }
    
    // Send the HTML with session cookie
    res.send(data);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Use this page to test file uploads with proper authentication`);
});