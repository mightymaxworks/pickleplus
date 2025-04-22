# Pickle+ Replit Deployment Guide

This is a step-by-step guide to successfully deploy the Pickle+ application on Replit using the standard deployment method.

## 🧰 Deployment Prerequisites

Before deploying, make sure you have:

1. A PostgreSQL database set up (Replit should have provided this)
2. The database connection string in your environment variables
3. A secure SESSION_SECRET value for user authentication

## 🚀 Deployment Steps

### Step 1: Build the Application

First, we need to build both the client and server components:

```bash
npm run build
```

### Step 2: Run the Deployment Fix Script

This script copies the client files to the correct location where the production server will look for them:

```bash
node deployment-fix.js
```

### Step 3: Deploy with Replit

1. Click the **Deploy** button in the Replit sidebar
2. Set up the deployment with these settings:
   - **Build Command**: `npm run build && node deployment-fix.js`
   - **Run Command**: `NODE_ENV=production node dist/index.js`
   - **Deploy Directory**: `dist`

3. Make sure these environment variables are configured:
   - `NODE_ENV`: Set to `production`
   - `PORT`: Set to `5000` (required for Replit)
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `SESSION_SECRET`: A secure random string for session encryption

4. Click **Deploy**

## 🔍 Verifying the Deployment

After deployment:

1. Open the deployed application URL
2. Verify you can log in and access all features
3. Check that authentication persists between page refreshes
4. Verify that the user interface loads correctly

## 🛠️ Troubleshooting

If you see a blank screen after deployment:

1. **Check Server Logs**: Look at the Replit logs to see any server-side errors

2. **Verify Environment Variables**: Make sure all required environment variables are set correctly

3. **Inspect Browser Console**: Open browser dev tools to see any client-side errors

4. **Check Static Files**: Verify the static files were copied to `dist/public` by the deployment fix script

5. **Database Connection**: Confirm the database connection is working properly

## 🔁 Common Issues and Solutions

### Authentication Issues

If users can't log in or sessions don't persist:
- Make sure SESSION_SECRET is set
- Check that cookies are being properly set and sent with requests

### Missing Static Files

If the app loads but shows no styles or JavaScript errors:
- Verify the build process completed successfully
- Make sure the deployment-fix.js script ran correctly
- Check that the files exist in the dist/public directory

### Database Connection Problems

If you see database-related errors:
- Verify the DATABASE_URL is correct
- Make sure the database is running and accessible from the deployed application

## 📋 Final Checklist

Before considering the deployment complete, verify:

- [ ] Application loads without errors
- [ ] Static assets (CSS/JS) load correctly
- [ ] Users can register and log in
- [ ] Authentication persists between page refreshes
- [ ] All API endpoints work correctly
- [ ] Database operations succeed