# Pickle+ Deployment Checklist

This checklist will help us ensure a successful deployment of the Pickle+ application.

## Pre-Deployment Checks

### Critical Path Structure

- [ ] Verify client/src paths in imports
- [ ] Check for absolute vs. relative path issues
- [ ] Verify asset paths (@assets/ vs /src/assets/)
- [ ] Check public asset references
- [ ] Verify uploads directory references

### Server Configuration

- [ ] Ensure server listens on port 8080 for Cloud Run
- [ ] Verify database connection using DATABASE_URL
- [ ] Check WebSocket configuration compatibility
- [ ] Verify session middleware setup
- [ ] Check authentication flow in production

### React Build Process

- [ ] Test build locally with `npm run build` 
- [ ] Verify build output is created in client/dist
- [ ] Check for any build warnings or errors
- [ ] Verify static assets are included in the build
- [ ] Check for environment variables used in the build

### API Endpoint Checks

- [ ] Verify API routes are properly registered
- [ ] Check for hardcoded URLs or ports in API calls
- [ ] Verify CORS configuration
- [ ] Check API error handling
- [ ] Verify authentication protected routes

### Database Integration

- [ ] Verify database connection string usage
- [ ] Check for migrations that need to be run
- [ ] Verify schema compatibility
- [ ] Check database queries for production readiness
- [ ] Verify database error handling

## Deployment Steps

1. Run pre-deployment check script:
   ```
   bash pre-deployment-check.sh
   ```

2. Fix any issues identified by the pre-deployment checks

3. Update the final-deploy.sh script if needed based on issues found

4. Deploy using the following steps:
   - Click the Deploy button in Replit
   - Set the Build Command to: `bash final-deploy.sh`
   - Set the Run Command to: `npm start`
   - Click Deploy

5. Verify the deployment:
   - Check that the application loads correctly
   - Verify API endpoints are working
   - Check database connectivity
   - Test authentication flow
   - Verify static assets are loaded properly

## Post-Deployment Validation

- [ ] Test login/authentication flow
- [ ] Check community features
- [ ] Verify tournaments functionality
- [ ] Test match recording
- [ ] Check profile management
- [ ] Verify admin features
- [ ] Test Bounce integration
- [ ] Check responsive design on mobile