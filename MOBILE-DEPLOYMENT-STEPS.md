# Pickle+ Mobile Deployment Guide

## Step 1: Run the Build Script

First, run this command in the console to prepare for deployment:
```
npx tsx build-prod.js
```

This prepares all necessary files for deployment.

## Step 2: Find the Deployment Section

On your mobile device:
1. Open the menu (≡) in Replit
2. Scroll down to find "Deployment" 
3. Tap on it to open deployment settings

## Step 3: Enter Deployment Settings

Copy and paste these exactly:

Build Command:
```
npm install
```

Run Command:
```
npx tsx production.js
```

## Step 4: Deploy

Tap the "Deploy" button at the bottom of the screen.

## What This Does

This deployment approach:
- Uses the proper port configuration (8080) required by Cloud Run
- Sets up production mode correctly
- Serves static files properly
- Uses your existing code architecture

## Troubleshooting

If the deployment fails:
- Check the error messages in the deployment logs
- Make sure you copied the commands exactly
- Try the deployment one more time - sometimes it works on a second attempt

If you continue having issues, consider using a desktop browser in "Desktop Mode" to deploy.