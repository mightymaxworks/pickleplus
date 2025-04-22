# Pickle+ Deployment Guide

This guide walks you through the step-by-step process of deploying the Pickle+ platform to Replit's Cloud Run environment.

## Pre-Deployment Checklist

1. ✅ Server port configuration 
   - Development: Port 5000
   - Production: Port 8080

2. ✅ Production environment setup
   - Using `production.js` as entry point
   - Setting NODE_ENV to 'production'
   - Creating minimal static files for production mode

3. ✅ Database connection
   - PostgreSQL database is properly configured
   - Connection string is available in environment variables

## Deployment Steps (SIMPLIFIED METHOD)

1. Run the simplified deployment script:
   ```
   npx tsx deploy-simple.js
   ```

2. Click the "Deploy" button in the Replit sidebar

3. Use these deployment settings:
   - Build Command: `npm install`
   - Run Command: `npx tsx production.js`

4. Click "Deploy" to start the deployment process

### How This Simplified Deployment Works

Our deploy-simple.js script:

1. Creates a production.js entry point that sets NODE_ENV=production
2. Creates a minimal static index.html file in server/public
3. Properly configures the app to run on port 8080 in production

This approach avoids the lengthy client build process that was causing timeouts.

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