# Pickle+ Port Configuration Fix

This document explains the port configuration issue and the solution implemented in the `port-fixed-deploy.sh` script.

## Problem

The deployment is encountering port configuration issues:

1. **Port Mismatch**: The server is listening on port 8080 in production, but Replit Cloud Run expects port 5000
2. **Port Mapping**: Replit maps the internal port 5000 to external port 80 for HTTP traffic
3. **Environment Variables**: The application needs to respect both `process.env.PORT` and static port assignments

## Solution

The `port-fixed-deploy.sh` script addresses these issues by:

1. **Using `process.env.PORT` Instead of Hardcoded Values**:
   ```javascript
   // Changed from:
   const port = process.env.NODE_ENV === 'production' ? 8080 : 5000;
   
   // To:
   const port = process.env.PORT || 5000;
   ```
   
   This ensures the application listens on whatever port is provided by the environment (Replit sets this to 5000), with a fallback to 5000 for local development.

2. **Including a Start Script** that handles the PORT environment variable:
   ```bash
   #!/bin/bash
   # Ensure the PORT environment variable is correctly set for production
   export NODE_ENV=production

   # Set PORT to 5000 if not already set
   if [ -z "$PORT" ]; then
     export PORT=5000
     echo "Setting PORT to default value: 5000"
   else
     echo "Using provided PORT: $PORT"
   fi

   # Start the application
   echo "Starting application with NODE_ENV=$NODE_ENV and PORT=$PORT"
   node index.js
   ```

   This wrapper script ensures the correct environment variables are set before starting the application.

3. **Setting Environment Variables in `.env`**:
   ```
   NODE_ENV=production
   PORT=5000
   ```

   These environment variables ensure the application has sane defaults if the platform doesn't provide them.

## Deployment Instructions

To deploy with the fixed port configuration:

1. **Run the port-fixed-deploy.sh script**:
   ```bash
   bash port-fixed-deploy.sh
   ```

2. **Deploy using Replit Cloud Run**:
   - Click the "Deploy" button in Replit
   - Set the Build Command to: `bash port-fixed-deploy.sh`
   - Set the Run Command to: `cd dist && ./start.sh`
   - Click Deploy

This ensures the application respects Replit's port requirements while maintaining the ability to run in different environments.

## Verification

The deployment verification script checks that:
1. The PORT is correctly set to 5000 in the .env file
2. All necessary files and dependencies are present
3. The application is correctly configured to start

If these checks pass, the application should successfully deploy and run on Replit Cloud Run.