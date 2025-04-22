# Pickle+ Deployment Checklist

This checklist ensures all key aspects of deployment are addressed to prevent circular troubleshooting and ensure a successful deployment.

## 1. Pre-Deployment Configuration Checks

- [ ] Port Configuration: Ensure server uses port 8080 in production (Cloud Run requirement)
- [ ] Database Connection: Verify code uses `process.env.DATABASE_URL` for database connection
- [ ] ES Module Compatibility: Ensure `"type": "module"` is in package.json
- [ ] Environment Variables: Confirm all required variables are configured in `.env.example`
- [ ] WebSocket Setup: Verify WebSocket server path doesn't conflict with Vite's HMR
- [ ] Build Scripts: Check build pipeline creates server and client together

## 2. Build Process Verification

- [ ] Frontend Builds Successfully: Vite creates optimized client files
- [ ] Backend Builds Successfully: Server compiles to JavaScript correctly
- [ ] Assets Included: All necessary assets are packaged with the build
- [ ] Environment: Build works in production environment (`NODE_ENV=production`)
- [ ] Bundle Size: Check build output size is reasonable

## 3. Cloud Run Deployment Configuration

- [ ] Build Command: Use `bash precise-deploy.sh` for deployment build
- [ ] Run Command: Use `cd dist && npm start` as the start command
- [ ] Memory Allocation: Standard 512MB should be sufficient
- [ ] CPU Allocation: Standard 1 CPU should be sufficient
- [ ] Environment Variables: Ensure DATABASE_URL is properly set in Cloud Run

## 4. Post-Deployment Verification

- [ ] Server Starts: Application starts without errors on the deployed URL
- [ ] Database Connects: Check server logs for successful database connection
- [ ] API Endpoints Work: Test key API endpoints with curl or Postman
- [ ] Frontend Loads: Visit the root URL and verify the React app loads
- [ ] Authentication Works: Test login functionality
- [ ] WebSockets Work: If applicable, test realtime features

## 5. Common Issues & Solutions

### Port Configuration
- **Issue**: Application binds to wrong port
- **Solution**: In `server/index.ts`, ensure port is set to 8080 in production: 
  ```javascript
  const port = process.env.NODE_ENV === 'production' ? 8080 : 5000;
  ```

### Database Connection
- **Issue**: Database connection fails in production
- **Solution**: Ensure `server/db-factory.ts` uses `process.env.DATABASE_URL`

### Module Format
- **Issue**: ES module imports fail
- **Solution**: Ensure package.json has `"type": "module"` and build scripts handle it correctly

### Static File Serving
- **Issue**: Frontend assets not found
- **Solution**: Verify static file serving is properly configured in production mode

### 404 Errors on Client Routes
- **Issue**: Client-side routes return 404
- **Solution**: Ensure server has a catch-all route that serves index.html for client routes

### WebSocket Connection Issues
- **Issue**: WebSockets don't connect in production
- **Solution**: Verify WebSocket URL construction uses correct protocol and host