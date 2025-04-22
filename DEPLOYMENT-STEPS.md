# Pickle+ Deployment Steps

Follow these steps to deploy the full application with authentication fixes:

## 1. Use the Deployment Script

Use the `deploy-full-app-with-auth-fixes.sh` script which:
- Builds the full application
- Sets up the production server with authentication fixes
- Creates all necessary supporting files

## 2. Configure Deployment in Replit

In the Replit deployment settings:
1. Click the Deploy button
2. Choose Cloud Run
3. Set the following:
   - **Build Command**: `bash deploy-full-app-with-auth-fixes.sh`
   - **Run Command**: `cd dist && ./start.sh`
   - Ensure `DATABASE_URL` is set in environment variables

## 3. Make Sure Authentication Fixes Are Applied

The key authentication fixes in this deployment are:
- Using direct SQL queries instead of ORM for user operations
- Adding robust error handling in passport.deserializeUser
- Implementing a fallback for session store issues
- Adding more detailed logging for authentication issues

## 4. Deploy and Monitor

After deployment:
- Check the logs for any authentication errors
- Test authentication by logging in/out
- Verify all API endpoints are working

If you still have issues, the logs will provide more specific information about what's failing.