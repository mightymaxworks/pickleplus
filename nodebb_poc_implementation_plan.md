# NodeBB Integration Proof of Concept Plan

## Overview

This document outlines the implementation plan for a Proof of Concept (POC) integration of NodeBB with the Pickle+ platform. The goal is to validate the feasibility of using NodeBB as the foundation for our Community Hub v2 with minimal development investment.

## Objectives

1. Validate that NodeBB can be integrated with our existing authentication system
2. Confirm that NodeBB's UI can be styled to match Pickle+ design guidelines
3. Test data synchronization between Pickle+ and NodeBB
4. Evaluate the developer experience of extending NodeBB
5. Measure initial performance metrics

## Implementation Steps

### 1. Setup NodeBB Development Environment (1-2 days)

**Tasks:**
- Install NodeBB in a development environment
- Configure NodeBB to use our PostgreSQL database
- Set up initial admin account
- Install required plugins:
  - OAuth2 SSO plugin
  - PostgreSQL adapter
  - API connector plugin
  - Write API plugin

**Technical approach:**
```
# Install NodeBB with PostgreSQL support
npm install nodebb-plugin-postgresql
npm install nodebb-plugin-write-api
npm install nodebb-plugin-oauth2-sso

# Configure database.json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "password",
    "database": "nodebb",
    "ssl": false
  }
}

# Start NodeBB in development mode
./nodebb dev
```

### 2. Create Authentication Bridge (2-3 days)

**Tasks:**
- Implement OAuth2 provider in Pickle+ backend
- Configure NodeBB to use our OAuth2 for authentication
- Create user profile sync mechanism
- Test single sign-on functionality

**Technical approach:**
```typescript
// server/modules/auth/oauth-provider.ts
import OAuth2Server from 'oauth2-server';

const oauth = new OAuth2Server({
  model: {
    // Implement required OAuth2 model methods
    getClient: async (clientId, clientSecret) => { /* ... */ },
    saveToken: async (token, client, user) => { /* ... */ },
    getAccessToken: async (accessToken) => { /* ... */ },
    getAuthorizationCode: async (authorizationCode) => { /* ... */ },
    revokeToken: async (token) => { /* ... */ },
    // User authentication
    getUser: async (username, password) => { /* ... */ },
    // Validation methods
    validateScope: async (user, client, scope) => { /* ... */ },
  }
});

// Expose OAuth endpoints
app.post('/oauth/token', (req, res) => {
  const request = new OAuth2Server.Request(req);
  const response = new OAuth2Server.Response(res);
  
  oauth.token(request, response)
    .then(token => { 
      res.json(token);
    })
    .catch(err => {
      res.status(err.code || 500).json(err);
    });
});

app.get('/oauth/authorize', (req, res) => { /* ... */ });
```

### 3. Create UI Integration Layer (2-3 days)

**Tasks:**
- Create `/community/v2` route in Pickle+ frontend
- Implement iframe or direct component embedding for NodeBB
- Apply Pickle+ theme to NodeBB (colors, typography, spacing)
- Create unified navigation experience

**Technical approach:**
```typescript
// client/src/pages/community/v2/index.tsx
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * @component NodeBBIntegration
 * @layer UI
 * @version 0.1.0
 * @description Proof of Concept integration with NodeBB community platform
 * @openSource Integrated with NodeBB@2.8.0 
 * @integrationPattern Iframe
 */
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
      <h1 className="text-3xl font-bold mb-6">Pickle+ Community</h1>
      
      <Separator className="my-4" />
      
      <div className="rounded-lg border overflow-hidden h-[800px]">
        {isAuthenticated ? (
          <iframe 
            ref={iframeRef}
            src="/nodebb/"
            className="w-full h-full"
            title="Pickle+ Community Forums"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">Please log in to access the community</p>
            <Button>Log In</Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Implement API Gateway (2-3 days)

**Tasks:**
- Create Express middleware for proxying requests to NodeBB API
- Implement webhook handler for receiving events from NodeBB
- Create simple sync mechanism for user profile changes
- Test data flow between systems

**Technical approach:**
```typescript
// server/modules/community/nodebb-gateway.ts
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Proxy API requests to NodeBB
router.all('/api/nodebb/*', async (req, res) => {
  try {
    const nodebbPath = req.path.replace('/api/nodebb', '');
    const nodebbUrl = `${process.env.NODEBB_URL}${nodebbPath}`;
    
    // Forward the request to NodeBB
    const response = await axios({
      method: req.method,
      url: nodebbUrl,
      data: req.body,
      headers: {
        'Authorization': `Bearer ${process.env.NODEBB_API_TOKEN}`,
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
router.post('/webhooks/nodebb', (req, res) => {
  const { action, data } = req.body;
  
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
```

### 5. Develop Custom NodeBB Plugin for Pickleball Features (3-4 days)

**Tasks:**
- Create basic NodeBB plugin for displaying pickleball ratings
- Add custom fields for skill level
- Create simple match result sharing template
- Test plugin functionality

**Technical approach:**
```javascript
// nodebb-plugin-pickle-plus/library.js
"use strict";

const plugin = {};

plugin.init = function(params, callback) {
  const { router, middleware } = params;
  
  // Add routes for our plugin
  router.get('/pickle-plus/rating/:userId', middleware.authenticate, async (req, res) => {
    const { userId } = req.params;
    // Fetch rating from Pickle+ API
    try {
      const rating = await getRatingFromPicklePlus(userId);
      res.json({ rating });
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch rating' });
    }
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
```

### 6. Performance and Integration Testing (2-3 days)

**Tasks:**
- Create automated tests for authentication flow
- Measure page load times with NodeBB integration
- Test user journey across both platforms
- Document performance findings

**Technical approach:**
```typescript
// test/integration/nodebb-integration.test.ts
import { test, expect } from '@playwright/test';

test.describe('NodeBB Integration', () => {
  test('should authenticate user across platforms', async ({ page }) => {
    // Log in to Pickle+
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to community v2
    await page.goto('/community/v2');
    
    // Wait for iframe to load
    const iframe = page.frameLocator('iframe');
    await iframe.locator('.user-header').waitFor();
    
    // Verify user is authenticated in NodeBB
    const username = await iframe.locator('.username').textContent();
    expect(username).toBe('testuser');
  });
  
  test('should measure performance metrics', async ({ page }) => {
    // Capture performance metrics
    const metrics = await page.evaluate(() => JSON.stringify(performance.timing));
    console.log('Performance metrics:', metrics);
    
    // Validate acceptable load times
    await page.goto('/community/v2');
    const loadTime = await page.evaluate(() => 
      performance.timing.loadEventEnd - performance.timing.navigationStart
    );
    
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });
});
```

## Success Criteria

The POC will be considered successful if:

1. Users can seamlessly authenticate between Pickle+ and NodeBB
2. The NodeBB UI can be styled to closely match Pickle+ design
3. Basic data synchronization works between platforms
4. Custom plugin development is straightforward
5. Page load performance is acceptable (under 3 seconds initial load)

## Timeline

Total estimated duration: **2-3 weeks**

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| Setup | 1-2 days | None |
| Authentication | 2-3 days | Setup |
| UI Integration | 2-3 days | Setup |
| API Gateway | 2-3 days | Authentication |
| Custom Plugin | 3-4 days | API Gateway |
| Testing | 2-3 days | All previous phases |

## Resources Required

- Developer with NodeBB experience (or time to learn)
- Access to PostgreSQL database
- Test user accounts
- Server for hosting NodeBB instance

## Next Steps After POC

If the POC is successful:
1. Proceed with full implementation of PKL-278651-COMM-0011-OSI
2. Document lessons learned and update the implementation plan
3. Create detailed technical specifications based on POC findings

If the POC reveals issues:
1. Evaluate alternative platforms (Discourse, Forem)
2. Adjust implementation approach based on findings
3. Create new POC with alternative solution if needed