# Pickle+ Simplified Deployment Guide

This guide addresses the deployment issues, including both the port configuration and authentication errors. It provides a more compatible approach using CommonJS modules.

## What This Fixes

1. **Port Configuration Issues**: Ensures the application listens on port 5000 in Replit Cloud Run
2. **Authentication Error**: Fixes the "Failed to deserialize user out of session" error
3. **Module Compatibility**: Uses CommonJS instead of ESM to avoid Node.js module resolution errors

## Why This Works

The previous deployment attempts had several issues:
- ESM/CommonJS module incompatibilities causing runtime errors
- Missing session management configuration in production
- Incorrect port configuration causing the app to be unreachable

This simplified approach:
- Creates a standalone server file with authentication built-in
- Properly configures the PostgreSQL session store
- Ensures consistent port configuration with the Replit environment

## Deployment Instructions

### Step 1: Verify Files

Make sure these files exist in your project:
- `simple-auth-deploy.sh` (main deployment script)
- `fix-server.js` (authentication-enabled server generator)

### Step 2: Deploy to Replit Cloud Run

1. In Replit UI, click the "Deploy" button on the right sidebar
2. Choose Cloud Run as the target
3. Set the following settings:
   - **Build Command**: `bash simple-auth-deploy.sh`
   - **Run Command**: `cd dist && ./start.sh`
   - **Environment Variables**: Make sure `DATABASE_URL` is set
4. Click Deploy

## Verifying Deployment

After deployment, you should be able to:
1. Access the application without the "Failed to deserialize user out of session" error
2. Log in and stay logged in across page reloads
3. Access protected routes that require authentication

## Troubleshooting

If you encounter any issues:

1. Check that the DATABASE_URL environment variable is correctly set in the deployment settings
2. Verify that the database is accessible from the deployed application
3. Look at the Replit deployment logs for any error messages

For persistent authentication issues, try adding the SESSION_SECRET environment variable explicitly in the deployment settings.