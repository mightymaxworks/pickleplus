# Pickle+ Project Deployment Guide

This guide explains how to deploy the complete Pickle+ application to production using Replit.

## The Challenge

We've been facing issues with deploying the full application while maintaining:
1. The complete Vite-built client
2. Working authentication
3. Proper database connectivity 
4. Correct port configuration

## The Solution: Vite Client Deployment

The `vite-build-deploy.sh` script is specifically designed to:

1. Build the actual Vite client from the client directory
2. Create a production-ready server with robust error handling
3. Fix authentication issues that caused internal server errors
4. Ensure proper port configuration (binding to port 5000)

## Deployment Instructions

Follow these steps to deploy the full Pickle+ application:

### 1. Prepare for Deployment

- Make sure your code changes are committed
- Ensure that you have provisioned a database in Replit
- Verify that the `DATABASE_URL` environment variable is set

### 2. Configure Deployment Settings

In the Replit UI:
1. Click the "Deploy" button in the right sidebar
2. Choose "Cloud Run" as the deployment target
3. Set the following settings:
   - **Build Command**: `bash vite-build-deploy.sh`
   - **Run Command**: `cd dist && ./start.sh`
   - **Environment Variables**: 
     - Make sure `DATABASE_URL` is set
     - Optionally set `SESSION_SECRET` to a strong random string

### 3. Deploy the Application

Click the "Deploy" button to start the deployment process.

### 4. Verify Deployment

After deployment is complete:
1. Navigate to your deployed application URL
2. Check if the application loads properly
3. Test authentication (login/logout)
4. Verify that database operations work correctly

## Troubleshooting

If you encounter issues with the deployment:

### Client Not Loading Correctly

If the client doesn't load properly:
- Check if the Vite build process completed successfully
- Verify that the client files were copied to the correct location
- Look for errors in the browser console

### Authentication Issues

If authentication doesn't work:
- Clear your browser cookies
- Check the server logs for authentication errors
- Verify that the session store is working correctly

### Database Connectivity Issues

If database operations fail:
- Check that the `DATABASE_URL` is set correctly
- Verify database connectivity from Replit
- Look for database connection errors in the server logs

## Technical Details

The deployment solution uses the following approach:

1. **Vite Client Build**: Properly builds the React application using Vite
2. **Authentication Fixes**: 
   - Implements proper error handling in passport serialization/deserialization
   - Uses direct SQL queries for critical user operations
   - Includes fallbacks if components fail
3. **Port Configuration**: 
   - Explicitly listens on port 5000 (required by Replit)
   - Binds to 0.0.0.0 for proper network access
4. **Database Connectivity**:
   - Adds connection retry mechanism
   - Implements fallbacks if database connection fails