# Pickle+ Replit Deployment Guide

This document outlines the process for deploying the Pickle+ application to Replit's hosting platform.

## Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All health check endpoints are properly implemented and responding with 200 OK
- ✅ Database connection handling includes proper error handling and graceful shutdown
- ✅ Environment variables are configured correctly
- ✅ Build scripts are configured properly
- ✅ Application starts properly in production mode

## Deployment Process

1. **Prepare for Deployment**
   - Run the Replit deployment fix script to ensure configuration is correct:
     ```
     node scripts/replit-deploy-fix.js
     ```
   - This script ensures the following:
     - Proper `.replit` configuration
     - Correct package.json scripts
     - Health check endpoints compatible with Replit
     - ESM module compatibility

2. **Verify Production Readiness**
   - Run the verification script to ensure all systems are ready:
     ```
     node scripts/verify-production-readiness.cjs
     ```
   - All checks should pass with minimal warnings

3. **Deploy via Replit Interface**
   - Click the "Deploy" button in the Replit interface
   - Replit will automatically:
     - Build the application using the configured build script
     - Deploy the application to a .replit.app domain
     - Set up required environment variables

4. **Post-Deployment Verification**
   - Access the deployed application at your .replit.app URL
   - Verify the health check endpoints:
     - `GET /` should return 200 OK with application status
     - `GET /api/health` should return 200 OK
     - `GET /api/health/db` should return 200 OK
   - Verify that the application is functional

## Environment Variables

The following environment variables should be set in the Replit Secrets tab:

- `NODE_ENV`: Set to "production"
- `DATABASE_URL`: Connection string for the PostgreSQL database
- `SESSION_SECRET`: Secret for session encryption
- Other application-specific secrets

## Troubleshooting

If deployment fails:

1. Check the Replit deployment logs for errors
2. Verify that all environmental variables are set correctly
3. Ensure the build script completes successfully
4. Check the application logs for any runtime errors
5. Verify database connectivity