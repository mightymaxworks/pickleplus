# Pickle+ Official Deployment Guide

This document provides clear instructions for deploying the Pickle+ application to Replit.

## Prerequisites

Before deploying, ensure you have:

1. A PostgreSQL database connection string
2. A secure random string for the SESSION_SECRET

## Deployment Steps

### 1. Using Replit's Deploy Button

1. Click the **Deploy** button in Replit
2. Use the following configuration:
   - **Build Command**: `node build-for-deployment.js`
   - **Run Command**: `NODE_ENV=production node dist/index.js`

### 2. Set Environment Variables

In Replit Secrets, add the following environment variables:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A secure random string

### 3. Deploy!

Click Deploy and wait for the build process to complete. The application will be available at your Replit URL.

## Troubleshooting

If you encounter a blank screen after deployment:

1. Check the deployment logs for errors
2. Verify that all environment variables are set correctly
3. Ensure the database connection is working

## How It Works

The deployment process:

1. `build-for-deployment.js` builds both client and server code
2. Client files are placed in `dist/public` where the server expects them
3. Server code is compiled to `dist/index.js`
4. The fix-build script ensures all files are in the correct locations

This approach ensures a smooth, standard deployment without requiring manual intervention.