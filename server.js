/**
 * Pickle+ Production Server
 * 
 * This is a simplified production server that serves the client-side application
 * and handles API requests.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import session from 'express-session';
import { setupAuth } from './server/auth.js';
import { registerRoutes } from './server/routes.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS to allow credentials
app.use(cors({
  origin: true, // Allow the request origin
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'X-Requested-With']
}));

// Add headers for better cookie handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie');
  next();
});

// Add a basic request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Set up authentication
setupAuth(app);

// Add a health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Serve static files - check multiple possible locations
const possibleStaticPaths = [
  path.join(__dirname, 'client/dist'),      // Standard client build output
  path.join(__dirname, 'dist/public'),      // Where production server looks
];

let staticPath = null;
for (const tryPath of possibleStaticPaths) {
  if (fs.existsSync(tryPath)) {
    staticPath = tryPath;
    console.log(`Found static files at: ${staticPath}`);
    app.use(express.static(staticPath));
    break;
  }
}

if (!staticPath) {
  console.warn('Could not find any static files directory. Client-side rendering may not work.');
  console.warn('Paths checked:');
  possibleStaticPaths.forEach(p => console.warn(`- ${p}`));
  
  // Try to build on the fly if client directory exists
  const clientSrcPath = path.join(__dirname, 'client');
  if (fs.existsSync(clientSrcPath)) {
    console.log('Client source directory found. You may need to build it first with: npm run build');
  }
}

// Register API routes
const httpServer = registerRoutes(app);

// Serve index.html for all non-API routes (client-side routing)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.url.startsWith('/api')) {
    return next();
  }
  
  if (staticPath) {
    return res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    // Fallback if no static path found
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pickle+</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; text-align: center; }
            .error { color: #e53e3e; margin: 2rem 0; }
          </style>
        </head>
        <body>
          <h1>Pickle+</h1>
          <div class="error">
            <p>Could not find client build files. Please make sure to run:</p>
            <pre>npm run build</pre>
          </div>
        </body>
      </html>
    `);
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// For Replit deployment, port 5000 must be used for both production and development
const port = process.env.PORT || 5000;
httpServer.listen({
  port: Number(port),
  host: "0.0.0.0",
}, () => {
  console.log(`Pickle+ server running at http://0.0.0.0:${port}`);
});