# Pickle+ Deployment Guide

This guide walks you through the step-by-step process of deploying the Pickle+ platform to Replit's Cloud Run environment.

## Pre-Deployment Checklist

1. ✅ Server port configuration 
   - Development: Port 5000
   - Production: Port 8080

2. ✅ Production environment setup
   - Using `production.js` as entry point
   - Setting NODE_ENV to 'production'
   - Building client files for production

3. ✅ Database connection
   - PostgreSQL database is properly configured
   - Connection string is available in environment variables

## Deployment Steps (FINAL METHOD)

1. Click the "Deploy" button in the Replit sidebar

2. Use these deployment settings:
   - Build Command: `./build.sh`
   - Run Command: `npm start`
   - Deploy Directory: `dist`

3. Click "Deploy" to start the deployment process

This method properly builds the client files and sets up the necessary structure for production deployment.

### What This Does

Our build script (`build.sh`) does the following:

1. Builds the client using Vite, outputting to `dist/public`
2. Creates the server structure in the `dist` directory
3. Creates a production entry point with `NODE_ENV=production`
4. Sets up a minimal package.json with only the required dependencies
5. Configures the application to run on port 8080 in production

## Post-Deployment Verification

1. Once deployed, verify that the application is working by:
   - Checking the application logs
   - Accessing the deployed URL
   - Testing key functionality

2. Common deployment issues and solutions:
   - If the database connection fails, check the DATABASE_URL environment variable
   - If the application crashes, check the Replit logs for details

## Rollback Procedure

If you need to roll back to a previous version:

1. In Replit, go to the Deployments tab
2. Find the previous successful deployment
3. Click "Redeploy" on that version

## Future Deployments

For future updates, simply:

1. Make your changes
2. Commit them
3. Run `./deploy.sh`
4. Click Deploy in the Replit sidebar

---

**Contact Information:**  
If you encounter any issues during deployment, please contact the development team.