/**
 * Ultra-minimal deployment file for Pickle+
 * This file uses only Express to create a minimal production server
 * that serves a static page with deployment information.
 */

const express = require('express');
const app = express();

// Create a simple server that just returns a success message
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pickle+ Deployment Success</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f8fa;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 30px;
          margin-top: 50px;
        }
        h1 {
          color: #38a169;
          margin-top: 0;
        }
        .success-icon {
          font-size: 64px;
          color: #38a169;
          text-align: center;
          margin: 20px 0;
        }
        .details {
          background-color: #f0fff4;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pickle+ Deployment Successful!</h1>
        
        <div class="success-icon">✅</div>
        
        <p>Your minimal deployment has succeeded. This confirms that the Replit deployment pipeline is working.</p>
        
        <div class="details">
          <h2>Deployment Information:</h2>
          <ul>
            <li><strong>Server:</strong> Express.js (Minimal)</li>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'Not set'}</li>
            <li><strong>Server Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Listening Port:</strong> ${process.env.PORT || 8080}</li>
          </ul>
        </div>
        
        <p>Now that we've verified the deployment pipeline works, we can work on deploying the full application.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Pickle+ Platform</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Set the port - use the PORT environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});