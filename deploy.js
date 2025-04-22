/**
 * Ultra-minimal deployment file for Pickle+
 * This file uses only Express to create a minimal production server
 * that serves a static page with deployment information.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Landing page
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
      --primary-dark: #2f855a;
      --bg: #f7fafc;
      --text: #2d3748;
      --border: #e2e8f0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary);
      margin-bottom: 10px;
    }
    
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
    }
    
    h1, h2 {
      color: var(--primary);
    }
    
    .card {
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #666;
    }
    
    .status {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      background-color: #38a169;
      border-radius: 50%;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Pickle+</div>
    <p>Transforming pickleball player development through innovative technology</p>
  </div>
  
  <div class="container">
    <h1>Deployment Successful!</h1>
    
    <div class="status">
      <div class="status-dot"></div>
      <div>Application deployed and running</div>
    </div>
    
    <div class="card">
      <h2>Deployment Information</h2>
      <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
      <p><strong>Server:</strong> Express.js Minimal Server</p>
      <p><strong>Deployment Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="card">
      <h2>Available Endpoints</h2>
      <ul>
        <li><code>/api/health</code> - Server health check</li>
      </ul>
    </div>
    
    <p>
      This is a minimal deployment for Pickle+. The application has been successfully deployed to the cloud.
    </p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} Pickle+ Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Minimal Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});