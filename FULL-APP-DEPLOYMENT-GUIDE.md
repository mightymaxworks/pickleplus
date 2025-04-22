# Pickle+ Full Application Deployment Guide

This guide ensures a successful deployment of the complete Pickle+ application with all functionality intact.

## Key Improvements in This Deployment

1. **Robust Error Handling**:
   - Extensive try/catch blocks around critical operations
   - Detailed error logging for easier debugging
   - Graceful fallbacks when components fail

2. **Reliable Database Connectivity**:
   - Connection retry mechanism with timeout control
   - Fallback session store if database connection fails
   - Raw SQL queries for critical user operations

3. **Enhanced Authentication**:
   - Error handling in passport serialization/deserialization
   - Properly configured cookie and session settings
   - Clear error responses for authentication failures

4. **Proper Port Configuration**:
   - Uses port 5000 as required by Replit Cloud Run
   - Configurable via environment variables

## Deployment Instructions

### Step 1: Verify Prerequisites

- Ensure `DATABASE_URL` is properly set in your environment variables
- Make sure you have the latest code committed

### Step 2: Deploy Using the Full App Script

1. In Replit UI, click the "Deploy" button on the right sidebar
2. Choose Cloud Run as the target
3. Set the following settings:
   - **Build Command**: `bash full-app-deploy.sh`
   - **Run Command**: `cd dist && ./start.sh`
   - **Environment Variables**: 
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SESSION_SECRET`: A strong random string (optional but recommended)
4. Click Deploy

## Troubleshooting Guide

If you encounter issues during deployment:

### Database Connection Issues

1. Verify the `DATABASE_URL` format is correct (should be a PostgreSQL connection string)
2. Check if the database is accessible from Replit (might need whitelisting)
3. Ensure the required tables exist in the database

### Authentication Problems

1. Try clearing your browser cookies and reloading
2. Check the server logs for specific authentication errors
3. Verify the session table exists in your database

### Port Configuration Issues

1. Make sure no custom port is being set in your code
2. The deployment should use port 5000, which Replit maps to external port 80

## Monitoring After Deployment

Once deployed, you can monitor the application using:

1. The `/api/health` endpoint, which provides status information
2. Replit logs to see any runtime errors
3. Database logs for query issues

## Security Considerations

For a production environment:

1. Use a strong `SESSION_SECRET` environment variable
2. Consider enabling secure cookies when serving over HTTPS
3. Implement rate limiting for authentication endpoints