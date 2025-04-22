/**
 * Pickle+ Production Server that serves the actual React frontend landing page
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Serve static files from the client/dist directory
// This is where Vite builds the production frontend
app.use(express.static(path.join(__dirname, 'client/dist')));

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    server: 'Express (Frontend)',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// For all other requests, serve the React app
app.get('*', (req, res) => {
  // Check if the client/dist/index.html file exists
  try {
    const indexPath = path.join(__dirname, 'client/dist/index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // If the built index.html doesn't exist, serve a fallback
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickle+ Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .message {
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
    <h1>Pickle+ Platform</h1>
    
    <div class="message">
      <p>The frontend has been deployed but the built files weren't found. This is usually because:</p>
      <ol>
        <li>The frontend hasn't been built yet</li>
        <li>The build files are in a different location</li>
      </ol>
      <p>The API server is running and healthy. You can check the health endpoint at <code>/api/health</code>.</p>
    </div>
    
    <p>To build and deploy the frontend, follow these steps:</p>
    <ol>
      <li>Add a build step to your deployment that runs <code>npm run build</code> in the client directory</li>
      <li>Ensure the built files are in <code>client/dist</code></li>
      <li>Redeploy the application</li>
    </ol>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Pickle+ Platform</p>
    </div>
  </div>
</body>
</html>
      `);
    }
  } catch (error) {
    console.error('Error serving frontend:', error);
    res.status(500).send('Server error when trying to serve the frontend');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickle+ Frontend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Date/Time: ${new Date().toISOString()}`);
});