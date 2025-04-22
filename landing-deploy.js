/**
 * Pickle+ Landing Page Deployment
 * 
 * This file provides a simplified deployment that only serves
 * a beautiful landing page without database or WebSocket connections.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve the landing page
app.get('*', (req, res) => {
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
    
    .api-section {
      margin-top: 1.5rem;
    }
    
    .api-endpoint {
      background-color: #f8f9fa;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-family: 'Courier New', monospace;
      margin: 0.5rem 0;
      border-left: 4px solid var(--primary);
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      margin: 1rem 0;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #38a169;
      margin-right: 10px;
    }
    
    .status-text {
      font-weight: 500;
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
    
    .api-demo {
      margin-top: 2rem;
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
      <h2 class="card-title">Deployment Status</h2>
      <div class="status-indicator">
        <div class="status-dot"></div>
        <span class="status-text">System online and operational</span>
      </div>
      <p>
        The Pickle+ platform has been successfully deployed to production. This is a simplified deployment
        that provides a landing page and basic API health endpoints.
      </p>
      <div class="api-section">
        <h3>Available API Endpoints:</h3>
        <div class="api-endpoint">/api/health</div>
      </div>
    </section>
    
    <section class="card">
      <h2 class="card-title">Platform Features</h2>
      <div class="features-grid">
        <div class="feature-item">
          <h3 class="feature-title">User Management</h3>
          <p>Comprehensive user profiles, authentication, and permission systems</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Match Tracking</h3>
          <p>Record and analyze your pickleball matches with detailed statistics</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Skill Development</h3>
          <p>Track your progress and improve your pickleball skills</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Community Features</h3>
          <p>Connect with other pickleball enthusiasts and join communities</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Tournament Management</h3>
          <p>Create and manage tournaments with automatic bracket generation</p>
        </div>
        <div class="feature-item">
          <h3 class="feature-title">Mobile Optimization</h3>
          <p>Fully responsive design for a seamless mobile experience</p>
        </div>
      </div>
    </section>
    
    <section class="card">
      <h2 class="card-title">API Health</h2>
      <div class="api-demo">
        <div class="status-indicator">
          <div class="status-dot" id="health-status-dot"></div>
          <span class="status-text" id="health-status-text">Checking API health...</span>
        </div>
        <p id="health-details"></p>
      </div>
    </section>
  </div>
  
  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} Pickle+ Platform. All rights reserved.</p>
  </footer>

  <script>
    // API Health endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'production',
        server: 'Express (Landing)',
        time: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Simple script to check API health
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        
        const statusDot = document.getElementById('health-status-dot');
        const statusText = document.getElementById('health-status-text');
        const healthDetails = document.getElementById('health-details');
        
        if (data.status === 'ok') {
          statusDot.style.backgroundColor = '#38a169'; // green
          statusText.textContent = 'API is healthy and responding';
          
          healthDetails.innerHTML = \`
            <strong>Environment:</strong> \${data.environment || 'Not available'}<br>
            <strong>Server:</strong> \${data.server || 'Express'}<br>
            <strong>Time:</strong> \${new Date(data.time).toLocaleString() || 'Not available'}<br>
            <strong>Version:</strong> \${data.version || 'Not available'}
          \`;
        } else {
          statusDot.style.backgroundColor = '#e53e3e'; // red
          statusText.textContent = 'API is not responding correctly';
          healthDetails.textContent = 'The API health check returned an unexpected response.';
        }
      } catch (error) {
        console.error('Health check failed:', error);
        const statusDot = document.getElementById('health-status-dot');
        const statusText = document.getElementById('health-status-text');
        const healthDetails = document.getElementById('health-details');
        
        statusDot.style.backgroundColor = '#e53e3e'; // red
        statusText.textContent = 'Could not connect to API';
        healthDetails.textContent = \`Error: \${error.message}\`;
      }
    }
    
    // Run health check when page loads
    window.addEventListener('DOMContentLoaded', checkHealth);
  </script>
</body>
</html>
  `);
});

// API Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    server: 'Express (Landing)',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Landing Page Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});