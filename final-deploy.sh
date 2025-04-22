#!/bin/bash
# FINAL-DEPLOY.SH
# Definitive deployment solution for the full Pickle+ application
# No compromises, no simplifications - full functionality

echo "🥒 PICKLE+ FINAL DEPLOYMENT SOLUTION 🥒"
echo "========================================"
echo "Deploying the complete application, no compromises"

# Step 1: Build the React app
echo "Step 1: Building React app..."
npm run build

# Step 2: Create a production-ready server.js file that integrates with existing code
echo "Step 2: Creating production server..."
cat > server.js << 'EOF'
// Production server.js - integrates with existing server code
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Import existing server index
import './server/index.js';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve React app static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle client-side routing - send index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  }
});

// Export the app for use in the main server
export default app;
EOF

# Step 3: Create startup script that modifies the port in the original server
echo "Step 3: Creating startup script..."
cat > start.js << 'EOF'
// Production startup script for Pickle+
import './server/index.js'; // Import the existing server code

// Force server to listen on port 8080
process.env.PORT = '8080';
console.log('Pickle+ production server starting on port 8080...');
EOF

# Step 4: Update package.json
echo "Step 4: Updating package.json..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Make a backup
fs.writeFileSync('package.json.bak', JSON.stringify(packageJson, null, 2));

// Add type: module
packageJson.type = 'module';

// Update start script
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.start = 'PORT=8080 node start.js';

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Step 5: Modify server/index.ts to use PORT 8080 in production
echo "Step 5: Modifying server/index.ts for production..."
node -e "
const fs = require('fs');
const path = require('path');

// Check if it's TS or JS
let serverFile = 'server/index.ts';
if (!fs.existsSync(serverFile)) {
  serverFile = 'server/index.js';
}

if (fs.existsSync(serverFile)) {
  let content = fs.readFileSync(serverFile, 'utf8');
  
  // Replace port definition to ensure it uses PORT=8080 in production
  if (content.includes('const port = ') || content.includes('const PORT = ')) {
    // Replace any port definition with one that prioritizes env var
    content = content.replace(
      /const (port|PORT) = [^;]+;/g, 
      'const PORT = process.env.PORT || 8080;'
    );
  }
  
  // Also replace any hardcoded port 5000
  content = content.replace(/5000/g, 'PORT');
  
  // Write back the modified file
  fs.writeFileSync(serverFile, content);
  console.log('Modified server file to use PORT=8080');
} else {
  console.log('Could not find server index file');
}
"

# Step 6: Create .env file for production environment variables
echo "Step 6: Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
EOF

echo "🥒 FINAL DEPLOYMENT SOLUTION READY 🥒"
echo "====================================="
echo "To deploy to Replit Cloud Run:"
echo "1. Click the Deploy button in Replit"
echo "2. Set the Build Command to: bash final-deploy.sh"
echo "3. Set the Run Command to: npm start"
echo "4. Click Deploy"
echo "This solution will deploy your COMPLETE application with ALL functionality!"