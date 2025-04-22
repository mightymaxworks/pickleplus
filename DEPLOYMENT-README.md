# Pickle+ Deployment Guide

This guide provides simple instructions for deploying the Pickle+ application using Replit's standard deployment method.

## Recent Fixes for Successful Deployment

We've made targeted changes to fix deployment issues:

1. **Authentication Resilience**:
   - Added robust error handling in `passport.deserializeUser`
   - Prevents app crashes when auth errors occur

2. **Port Configuration**:
   - Updated port configuration to use `process.env.PORT || 5000`
   - Essential for proper Replit deployment

3. **Session Handling**:
   - Improved session store reliability
   - Better error handling during login/logout

## Deployment Steps

### 1. Deploy Using Standard Replit Method

1. Click the **Deploy** button in Replit
2. Choose **Cloud Run** as the deployment method
3. Use the default settings:
   - Build Command: (default) `npm run build`
   - Run Command: (default) `npm start`
4. Make sure the `DATABASE_URL` environment variable is set
5. Click **Deploy**

### 2. Verifying Deployment

After deployment is complete:

1. Visit the deployed app URL
2. Try logging in to verify authentication works
3. Check that you're seeing the full Pickle+ application, not a placeholder page
4. Monitor deployment logs for any authentication errors

## Troubleshooting

If you experience issues:

- **Authentication Failures**: Check the deployment logs for specific error messages
- **Blank Page**: Verify the DATABASE_URL is correctly set in environment variables
- **Not Found Errors**: Make sure the build completed successfully

## Database Requirements

The application requires a PostgreSQL database. The connection string should be provided as a `DATABASE_URL` environment variable in the format:
```
postgresql://username:password@hostname:port/database
```

## Next Steps

After successful deployment, the full Pickle+ application will be available with all features:
- Tournament management
- Match recording
- Community features
- User profiles
- Analytics