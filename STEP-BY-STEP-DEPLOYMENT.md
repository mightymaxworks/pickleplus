# Step-by-Step Pickle+ Deployment Guide

This guide provides detailed step-by-step instructions for deploying the full Pickle+ application to Replit's Cloud Run service.

## Deployment Requirements

- **Port**: The application must run on port 8080 (Cloud Run requirement)
- **Host**: The server must bind to '0.0.0.0' (not localhost)
- **Database**: The DATABASE_URL environment variable must be available for database connectivity

## Pre-Deployment Preparation

1. We have created all the necessary deployment files:
   - `build-prod.js` - Builds the React frontend and creates the production server
   - `prod-server.js` - Enhanced production server with database connectivity
   - `deploy.sh` - Deployment shell script that orchestrates the build process

2. Make sure these files are executable:
   ```
   chmod +x deploy.sh
   ```

## Step-by-Step Deployment Process

### Option 1: One-Click Deployment (Recommended)

1. In the Replit deployment interface:

   - Set **Build Command** to:
     ```
     bash deploy.sh
     ```

   - Set **Run Command** to:
     ```
     npm --prefix dist start
     ```

   - Click **Deploy**

2. The deployment process will:
   - Install necessary dependencies
   - Build the React frontend
   - Create the production server
   - Configure database connectivity (if DATABASE_URL is available)
   - Start the server on port 8080

### Option 2: Manual Deployment

If you prefer to do the deployment manually:

1. Run the build script:
   ```
   node build-prod.js
   ```

2. Navigate to the dist directory:
   ```
   cd dist
   ```

3. Install production dependencies:
   ```
   npm install --production
   ```

4. Start the server:
   ```
   npm start
   ```

## Verifying Deployment

Once deployed, you can verify the deployment is working by:

1. Checking the deployment logs for any errors
2. Visiting the deployed URL to see if the frontend is served correctly
3. Checking the health endpoint at `/api/health` to verify server status
4. Checking the database status endpoint at `/api/db-status` to verify database connectivity

## Troubleshooting

### Common Issues

1. **Frontend Build Failure**:
   - Check the build logs for specific error messages
   - Ensure all frontend dependencies are available

2. **Database Connection Errors**:
   - Verify the DATABASE_URL environment variable is set correctly
   - Check database credentials and connection parameters

3. **Port Binding Issues**:
   - Ensure the server is configured to use port 8080
   - Verify the server is binding to '0.0.0.0' and not localhost

4. **WebSocket Connection Errors**:
   - WebSocket connections can be problematic in Cloud Run
   - The current deployment is configured to handle these gracefully

## Next Steps

After successful deployment:

1. Test all critical functionality
2. Monitor the application logs for any errors
3. Set up any additional environment variables as needed
4. Consider setting up a custom domain if needed

For any further assistance, refer to the comprehensive deployment guides:
- `DEPLOYMENT.md` - Overall deployment strategy
- `FINAL-DEPLOYMENT-GUIDE.md` - Alternative deployment options