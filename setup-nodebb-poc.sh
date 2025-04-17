#!/bin/bash
# NodeBB Proof of Concept Setup Script
# PKL-278651-COMM-0011-OSI

# Exit on error
set -e

echo "========================================"
echo "Pickle+ NodeBB Integration POC Setup"
echo "========================================"

# Create directory for NodeBB
mkdir -p ./community-poc
cd ./community-poc

# Clone NodeBB repository
echo "Cloning NodeBB repository..."
git clone -b v2.8.x https://github.com/NodeBB/NodeBB.git nodebb
cd nodebb

# Install dependencies
echo "Installing NodeBB dependencies..."
npm install

# Install required plugins
echo "Installing NodeBB plugins..."
npm install nodebb-plugin-postgresql
npm install nodebb-plugin-write-api
npm install nodebb-plugin-oauth2-sso
npm install nodebb-plugin-custom-pages

# Create database config
echo "Creating database configuration..."
cat > config.json << EOF
{
    "url": "http://localhost:4567",
    "secret": "pickle-plus-nodebb-poc",
    "database": "postgres",
    "port": "4567",
    "postgres": {
        "host": "localhost",
        "port": 5432,
        "username": "postgres",
        "password": "postgres",
        "database": "nodebb_poc",
        "ssl": false
    }
}
EOF

# Create .env file for Pickle+ integration
echo "Creating environment configuration for Pickle+ integration..."
cd ../..
cat > .env.nodebb << EOF
# NodeBB Integration Configuration
NODEBB_URL=http://localhost:4567
NODEBB_API_TOKEN=your_api_token_here
NODEBB_ADMIN_USERNAME=admin
NODEBB_ADMIN_PASSWORD=adminpassword
NODEBB_ADMIN_EMAIL=admin@example.com

# OAuth Configuration
OAUTH_CLIENT_ID=pickle_plus_client
OAUTH_CLIENT_SECRET=pickle_plus_secret
OAUTH_REDIRECT_URI=http://localhost:4567/auth/oauth/callback
EOF

# Create basic NodeBB plugin for Pickle+
echo "Creating basic Pickle+ NodeBB plugin..."
mkdir -p ./community-poc/nodebb-plugin-pickle-plus
cat > ./community-poc/nodebb-plugin-pickle-plus/package.json << EOF
{
  "name": "nodebb-plugin-pickle-plus",
  "version": "0.1.0",
  "description": "Pickle+ integration for NodeBB",
  "main": "library.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "nodebb",
    "plugin",
    "pickle",
    "pickleball"
  ],
  "author": "Pickle+",
  "license": "MIT",
  "nbbpm": {
    "compatibility": "^2.8.0"
  }
}
EOF

cat > ./community-poc/nodebb-plugin-pickle-plus/library.js << EOF
"use strict";

const plugin = {};

plugin.init = function(params, callback) {
  const { router, middleware } = params;
  
  // Add routes for our plugin
  router.get('/pickle-plus/rating/:userId', (req, res) => {
    const { userId } = req.params;
    // This would fetch from the Pickle+ API in the full implementation
    res.json({ 
      userId: userId,
      rating: 4.5,
      confidence: 0.85,
      matches: 42
    });
  });
  
  callback();
};

plugin.addUserFields = function(params, callback) {
  params.fields.push(
    'pickle_skill_level',
    'pickle_preferred_play',
    'pickle_equipment'
  );
  callback(null, params);
};

plugin.addProfileItem = function(data, callback) {
  data.links.push({
    name: 'Pickleball Stats',
    route: 'pickle-stats',
    icon: 'fa-table-tennis'
  });
  callback(null, data);
};

module.exports = plugin;
EOF

# Create directory for NodeBB route in frontend
echo "Setting up frontend integration..."
mkdir -p ./client/src/pages/community/v2

# Create React component for NodeBB integration
cat > ./client/src/pages/community/v2/index.tsx << EOF
/**
 * @component NodeBBIntegration
 * @layer UI
 * @version 0.1.0
 * @description Proof of Concept integration with NodeBB community platform
 * @openSource Integrated with NodeBB@2.8.0 
 * @integrationPattern Iframe
 * @lastModified 2025-04-17
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function NodeBBIntegration() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // When user logs in, pass auth token to iframe
    if (isAuthenticated && user && iframeRef.current) {
      // Post message to NodeBB with authentication token
      iframeRef.current.contentWindow?.postMessage({
        type: 'auth',
        token: user.accessToken
      }, '*');
    }
  }, [isAuthenticated, user]);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pickle+ Community [v2 POC]</h1>
      
      <Separator className="my-4" />
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 h-[800px]">
          {isAuthenticated ? (
            <iframe 
              ref={iframeRef}
              src="${process.env.NODEBB_URL || 'http://localhost:4567'}"
              className="w-full h-full border-0"
              title="Pickle+ Community Forums"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="mb-4">Please log in to access the community</p>
              <Button>Log In</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# Create API gateway for NodeBB
mkdir -p ./server/modules/community/nodebb
cat > ./server/modules/community/nodebb/gateway.ts << EOF
/**
 * @module NodeBB Gateway
 * @layer Server
 * @version 0.1.0
 * @description API Gateway for NodeBB integration
 * @openSource Integrated with NodeBB@2.8.0 
 * @integrationPattern API
 * @lastModified 2025-04-17
 */

import express from 'express';
import axios from 'axios';
import { isAuthenticated } from '../../middleware/auth';

const router = express.Router();

// Proxy API requests to NodeBB
router.all('/api/nodebb/*', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const nodebbPath = req.path.replace('/api/nodebb', '');
    const nodebbUrl = \`\${process.env.NODEBB_URL || 'http://localhost:4567'}\${nodebbPath}\`;
    
    // Forward the request to NodeBB
    const response = await axios({
      method: req.method,
      url: nodebbUrl,
      data: req.body,
      headers: {
        'Authorization': \`Bearer \${process.env.NODEBB_API_TOKEN || 'test-token'}\`,
        'Content-Type': 'application/json'
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Error communicating with community platform'
    });
  }
});

// Webhook handler for NodeBB events
router.post('/webhooks/nodebb', (req: express.Request, res: express.Response) => {
  const { action, data } = req.body;
  
  console.log(\`[NodeBB Webhook] Received event: \${action}\`);
  console.log(data);
  
  // In a real implementation, we would process these events
  switch (action) {
    case 'post.create':
      // Process new post
      break;
    case 'user.update':
      // Sync user data
      break;
    // Handle other events
  }
  
  res.sendStatus(200);
});

export default router;
EOF

cat > ./server/modules/community/nodebb/index.ts << EOF
import gateway from './gateway';

export { gateway };
EOF

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "To run the NodeBB server:"
echo "1. cd ./community-poc/nodebb"
echo "2. ./nodebb setup"
echo "3. ./nodebb start"
echo ""
echo "Note: You will need to have PostgreSQL running with a database named 'nodebb_poc'"
echo ""
echo "Next steps:"
echo "1. Complete the setup process when you run ./nodebb setup"
echo "2. IMPORTANT: When updating server/routes.ts to include the NodeBB gateway:"
echo "   - DO NOT modify or replace any existing routes"
echo "   - ADD the new routes: '/api/nodebb' and '/api/webhooks/nodebb'"
echo "   - See nodebb_route_integration_guide.md for details"
echo "3. IMPORTANT: When updating client/src/App.tsx to include the NodeBB page:"
echo "   - DO NOT modify or replace any existing routes"
echo "   - ADD the new route: '/community/v2'"
echo "   - See nodebb_route_integration_guide.md for details"
echo ""
echo "Remember: The goal is to run both community implementations side by side"
echo "for A/B testing, not to replace the existing implementation."
echo ""