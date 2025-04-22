# Pickle+ Full Deployment Guide

This guide provides step-by-step instructions for deploying the complete Pickle+ application to production.

## Understanding the Deployment Process

When deploying the full Pickle+ application, we need to:

1. **Build the React frontend** - Compile all React components and assets
2. **Set up the production server** - Configure the Express server for production
3. **Configure database access** - Ensure the database connection works in production
4. **Deploy to Cloud Run** - Submit the deployment to Replit's Cloud Run service

## Components of Full Deployment

The full deployment uses the following key files:

- `full-deploy.js` - Production-ready Express server that serves the React frontend and APIs
- `full-deploy-package.json` - Package configuration with minimal dependencies
- `build-full.sh` - Build script that compiles the React app and organizes files for deployment

## Step-by-Step Deployment Instructions

Follow these steps for a full deployment:

### 1. Prepare the Deployment

Make sure you have run:

```bash
chmod +x build-full.sh
```

### 2. Configure Replit Deployment

In the Replit deployment interface:

- **Build Command**:
  ```
  ./build-full.sh
  ```
  
- **Run Command**:
  ```
  cd dist && npm start
  ```

### 3. Submit the Deployment

Click "Deploy" in the Replit interface to start the deployment process.

## What Happens During Deployment

1. The `build-full.sh` script:
   - Installs server dependencies
   - Builds the React frontend (`client` directory)
   - Creates a deployment directory (`dist`)
   - Copies the built frontend and server files to the deployment directory
   - Installs production dependencies in the deployment directory

2. The `cd dist && npm start` command:
   - Navigates to the deployment directory
   - Starts the production server
   - Serves the compiled React app
   - Handles API requests

## Troubleshooting

If you encounter issues during deployment:

### Client Build Issues

- Check that the client build completes successfully
- Look for any error messages in the build logs
- Verify that the `client/dist` directory exists after the build

### Server Issues

- Ensure the server is binding to port 8080
- Verify the database connection is working
- Check for WebSocket connection issues
- Ensure all required environment variables are set

### Database Connectivity

- Verify that `DATABASE_URL` environment variable is set
- Check database credentials and connection string
- Test the database connection from the local development environment

## Advanced Configuration

For more advanced configuration:

- Edit `full-deploy.js` to add additional API routes
- Modify `full-deploy-package.json` to add necessary dependencies
- Update `build-full.sh` to include additional build steps

## Post-Deployment Verification

After deployment:

1. Check the deployed URL to ensure the application loads
2. Verify that API calls are working 
3. Test user authentication and database operations
4. Check for console errors in browser dev tools