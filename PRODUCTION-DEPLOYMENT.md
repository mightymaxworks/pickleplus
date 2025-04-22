# Pickle+ Production Deployment Guide

This guide provides a complete approach to deploying the Pickle+ platform to Replit's Cloud Run environment.

## Understanding the Deployment Process

The deployment process consists of three main steps:
1. Preparing the application for production
2. Configuring the deployment settings
3. Running the deployment

## Step 1: Preparation

Run the production build script to prepare all necessary files:

```bash
npx tsx build-prod.js
```

This script:
- Creates a production.js entry point with proper NODE_ENV settings
- Sets up static file serving
- Ensures correct port configuration (8080 for Cloud Run)

## Step 2: Deployment Settings

When deploying on Replit, use these exact settings:

For the **Build Command**:
```
npm install
```

For the **Run Command**:
```
npx tsx production.js
```

## Step 3: Deployment

1. Click the "Deploy" button in the Replit interface
2. Enter the settings from Step 2
3. Click "Deploy" to start the deployment process
4. Wait for the deployment to complete

## Verification and Troubleshooting

After deployment:
1. Check the deployment logs for any errors
2. Visit the deployed URL to verify the application is running
3. Test key functionality to ensure it's working as expected

## Common Issues and Solutions

### Port Configuration Issues
- Make sure the server listens on port 8080 in production
- Verify that process.env.PORT is being used correctly

### Module System Errors
- Check for compatibility between ES modules and CommonJS
- Ensure imports/exports are consistent

### Database Connection Issues
- Verify DATABASE_URL is available in the production environment
- Test database connectivity before deployment

## Notes for Mobile Deployment

When deploying from a mobile device:
1. Use a stable internet connection
2. Copy and paste commands carefully, ensuring no extra characters
3. Check for mobile-specific UI limitations in the Replit app
4. Consider switching to desktop view in your browser if available

## Rollback Procedure

If you need to roll back to a previous version:
1. Navigate to the Deployments tab in Replit
2. Find the previous successful deployment
3. Click "Redeploy" on that version

---

**Contact Information:**  
If you encounter any issues during deployment, please contact the development team.