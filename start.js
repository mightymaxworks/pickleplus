import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// Add basic API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Try to import the main server module
try {
  const { default: serverApp } = await import('./server/index.js');
  // Use the imported server app's routes
  app.use(serverApp);
} catch (error) {
  console.error('Failed to load server module:', error);
}

// Handle client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

const port = process.env.PORT || 8080;
createServer(app).listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});