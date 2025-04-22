/**
 * Pickle+ Simple Frontend Server
 * 
 * This server serves your already running application through a proxy.
 * It's a simpler approach than trying to build the entire frontend.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static assets if available
app.use(express.static('public'));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'production',
    time: new Date().toISOString(),
    server: 'Express Proxy'
  });
});

// Serve a nice HTML page for the root
app.get('/', (req, res) => {
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
    
    .button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: var(--primary-dark);
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
        Pickle+ is a cutting-edge platform for pickleball players of all skill levels.
        Our platform helps you track matches, find players, join communities, and improve your game.
      </p>
      <p>
        <a href="/app" class="button">Launch Application</a>
      </p>
    </section>
    
    <section class="card">
      <h2 class="card-title">Key Features</h2>
      <div class="features-grid">
        <div class="feature-item">
          <h3 class="feature-title">Match Tracking</h3>
          <p>Record matches and analyze your performance with detailed statistics</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Skill Development</h3>
          <p>Track your progress and receive personalized recommendations</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Community</h3>
          <p>Connect with other players and join local pickleball communities</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Tournaments</h3>
          <p>Organize and participate in tournaments with automated brackets</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Leaderboards</h3>
          <p>See how you rank against other players in your area</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Mobile-First</h3>
          <p>Access all features from your mobile device on the court</p>
        </div>
      </div>
    </section>
  </div>
  
  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} Pickle+ Platform. All rights reserved.</p>
  </footer>
</body>
</html>
  `);
});

// Serve a proxy to the app for the /app route
app.get('/app', (req, res) => {
  res.redirect('https://pickle-plus.org/app');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Frontend Proxy Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});