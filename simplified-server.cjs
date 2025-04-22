/**
 * Pickle+ Ultra-Simplified Production Server with Authentication
 * This is a minimal server that focuses on static file serving and basic authentication
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Standard middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Authentication routes - Simplified placeholder versions
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    id: 1,
    username: "user",
    displayName: "Demo User",
    isAdmin: false
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/current-user', (req, res) => {
  // Return a demo user without attempting database access
  res.status(200).json({
    id: 1,
    username: "user",
    displayName: "Demo User",
    isAdmin: false
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    env: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT,
      database_url_present: !!process.env.DATABASE_URL
    }
  });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'client')));

// Handle all routes for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'index.html');
  
  // Check if the file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback if index.html doesn't exist
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pickle+</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #4CAF50; }
          </style>
        </head>
        <body>
          <h1>Pickle+ MVP Deployed Successfully</h1>
          <p>The application has been deployed, but client files weren't found.</p>
          <p>Server is running and ready to serve the application.</p>
          <div>
            <h2>Environment</h2>
            <p>NODE_ENV: ${process.env.NODE_ENV}</p>
            <p>PORT: ${process.env.PORT}</p>
            <p>DATABASE_URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database connection: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});