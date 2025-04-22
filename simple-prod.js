// Super simple production server for Pickle+

// Set the environment to production mode
process.env.NODE_ENV = 'production';

// Import required modules with CommonJS
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express application
const app = express();

// Serve static files from the server/public directory
app.use(express.static(path.join(__dirname, 'server', 'public')));

// Create a simple HTML page
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f9f9f9;
      color: #333;
    }
    
    .container {
      text-align: center;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-radius: 8px;
      padding: 40px;
      max-width: 600px;
    }
    
    h1 {
      color: #38a169;
      margin-bottom: 16px;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 32px;
    }
    
    .features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin: 32px 0;
    }
    
    .feature {
      background-color: #f0f9eb;
      padding: 16px;
      border-radius: 8px;
      flex: 1 1 160px;
      max-width: 200px;
    }
    
    .feature h3 {
      margin-top: 0;
      color: #38a169;
    }
    
    .footer {
      margin-top: 40px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pickle+ Platform</h1>
    <p>Welcome to the Pickle+ Platform! Your cutting-edge gamified web platform transforming pickleball player development.</p>
    
    <div class="features">
      <div class="feature">
        <h3>Player Profiles</h3>
        <p>Track your ratings, match history, and skill development.</p>
      </div>
      <div class="feature">
        <h3>Community Hub</h3>
        <p>Connect with other players and join communities.</p>
      </div>
      <div class="feature">
        <h3>Tournaments</h3>
        <p>Participate in tournaments and track your performance.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Pickle+. All rights reserved.</p>
      <p>Version 1.0.0 - April 22, 2025</p>
    </div>
  </div>
</body>
</html>
`;

// Ensure the public directory exists
const publicDir = path.join(__dirname, 'server', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the index.html file
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

// Define the port (use 8080 for Replit deployment)
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});