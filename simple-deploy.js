/**
 * Simple direct deployment for Pickle+
 * 
 * This script prepares the server for production deployment
 * by creating necessary files without the full build process.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Attempt to connect to database if DATABASE_URL is available
let db = null;
if (process.env.DATABASE_URL) {
  try {
    console.log('Attempting to connect to database...');
    const { Pool } = require('@neondatabase/serverless');
    
    // Set up connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test database connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Database connected:', res.rows[0]);
        db = pool; // Store the pool for later use
      }
    });
  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
}

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from public directory if it exists
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  console.log(`Serving static files from ${publicPath}`);
  app.use(express.static(publicPath));
}

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: db ? 'connected' : 'not connected',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoint for user data (if authenticated)
app.get('/api/user', (req, res) => {
  // Simple mock user response
  res.json({
    id: 1,
    username: 'user',
    firstName: 'Demo',
    lastName: 'User',
    profileCompletionPct: 85
  });
});

// For all other requests, serve the app's landing page
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback landing page
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    :root {
      --primary: #38a169;
      --primary-light: #9ae6b4;
      --primary-dark: #2f855a;
      --background: #f7fafc;
      --card-bg: #ffffff;
      --text: #2d3748;
      --text-light: #4a5568;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--background);
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .header {
      text-align: center;
      padding: 2rem 0;
    }
    
    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    .tagline {
      font-size: 1.2rem;
      color: var(--text-light);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .card {
      background-color: var(--card-bg);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 2rem;
      margin: 2rem 0;
    }
    
    .card-title {
      font-size: 1.5rem;
      color: var(--primary);
      margin-top: 0;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--primary-light);
      padding-bottom: 0.5rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .feature-item {
      background-color: var(--card-bg);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 1.5rem;
    }
    
    .feature-title {
      font-weight: 600;
      margin-top: 0;
      color: var(--primary-dark);
    }
    
    .button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 1rem;
    }
    
    .footer {
      text-align: center;
      padding: 2rem 0;
      margin-top: 2rem;
      color: var(--text-light);
      border-top: 1px solid var(--border);
    }
    
    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">Pickle+</div>
      <p class="tagline">Transforming pickleball player development through innovative mobile-first technology</p>
    </header>
    
    <section class="card">
      <h2 class="card-title">Welcome to Pickle+</h2>
      <p>
        Our platform is your one-stop destination for all things pickleball. Whether you're tracking matches,
        connecting with other players, or looking to improve your skills, Pickle+ has you covered.
      </p>
      <p>
        This simplified deployment is now running successfully in the cloud!
      </p>
      <a href="/dashboard" class="button">Enter Application</a>
    </section>
    
    <section class="card">
      <h2 class="card-title">Key Features</h2>
      <div class="features-grid">
        <div class="feature-item">
          <h3 class="feature-title">Match Tracking</h3>
          <p>Record and analyze your pickleball matches with detailed statistics</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Community Building</h3>
          <p>Connect with other players and join local pickleball communities</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Tournaments</h3>
          <p>Create and manage tournaments with automated bracket generation</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Skill Development</h3>
          <p>Track your progress and improve your pickleball skills</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Player Rankings</h3>
          <p>See how you stack up against other players in your area</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Mobile Optimization</h3>
          <p>Access all features from your mobile device on the court</p>
        </div>
      </div>
    </section>
  </div>
  
  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} Pickle+ Platform. All rights reserved.</p>
  </footer>
  
  <script>
    // Simple API health check
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('API Health:', data);
      })
      .catch(error => {
        console.error('API Health Error:', error);
      });
  </script>
</body>
</html>
    `);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  console.log(`Current time: ${new Date().toISOString()}`);
});