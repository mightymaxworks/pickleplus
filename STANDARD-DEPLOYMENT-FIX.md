# Standard Replit Deployment - Fix Guide

This guide explains how to fix the blank screen issue when using Replit's standard deployment method.

## The Problem

When deploying the Pickle+ app on Replit, you're seeing a blank screen because:

1. Static files (CSS, JS, etc.) aren't being served correctly in production
2. Authentication flow may be disrupted in the production environment

## The Fix - Focus on Static Files Serving

### Step 1: Verify the server configuration for static files

Check `server/index.ts` to ensure it's properly configured to serve static files in production:

```typescript
// In server/index.ts
import express from 'express';
import path from 'path';

// Create Express app
const app = express();

// ...other configuration...

// Add this block for proper static file serving in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from different possible locations
  const clientDistPath = path.join(__dirname, '../client/dist');
  const distPublicPath = path.join(__dirname, 'public');
  
  console.log('Checking for static files in:', clientDistPath);
  console.log('Checking for static files in:', distPublicPath);
  
  app.use(express.static(clientDistPath));
  app.use(express.static(distPublicPath));
  
  // Serve index.html for client-side routing
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).send('API endpoint not found');
    }
    
    // Try to send index.html from client/dist
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath);
  });
}
```

### Step 2: Update the build script

Ensure the build process correctly copies the client files to the right location. Make sure your `build` script in `package.json` looks like this:

```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

### Step 3: Verify environment variables for production

Create a `.env` file with the correct settings for production:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<your database url>
SESSION_SECRET=<your session secret>
```

## Deploying with Replit's Standard Method

1. Click the **Deploy** button in the Replit sidebar
2. Configure these settings:
   - **Build Command**: `npm run build`
   - **Run Command**: `node dist/index.js`
   - **Deploy Directory**: `dist`

3. Make sure these environment variables are set in the Replit Secrets:
   - `NODE_ENV` (set to "production")
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `PORT` (set to 5000 for Replit)

## Troubleshooting

If you still see a blank screen:

1. **Check the deployment logs**: They often provide helpful error messages.

2. **Verify the build output**: Check if the `dist` directory contains both server files and client static files.

3. **Validate authentication**: If the app loads but you see authentication issues, check the session configuration (especially secure cookies settings and CORS).

4. **Add more logging**: Add console logs in the server code to understand what's happening.

Remember, when using Replit's standard deployment, simplicity is key. Focus on making sure the server can find and serve the static files correctly.