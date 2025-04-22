# Pickle+ Deployment Lessons Learned

This document captures the key insights and lessons learned from our iterative deployment process.

## Critical Deployment Requirements

1. **Port Configuration**: Cloud Run requires using port 8080 in production, while development uses port 5000.
    - SOLUTION: Use conditional port assignment:
      ```js
      const port = process.env.NODE_ENV === 'production' ? 8080 : 5000;
      ```

2. **Database Connection**: The application must use `process.env.DATABASE_URL` for database connections.
    - SOLUTION: Ensure `server/db-factory.ts` consistently uses this environment variable.

3. **ES Module Compatibility**: The application uses ES modules, requiring proper configuration.
    - SOLUTION: Maintain `"type": "module"` in package.json and ensure build scripts account for it.

4. **Build Process Integrity**: The build process must compile both client and server correctly.
    - SOLUTION: Use the existing build script that handles both Vite (client) and esbuild (server).

## What Works: Successful Approach

The most successful deployment approach:

1. **Preserve Existing Code**: Don't recreate server code; modify it minimally to work in production.
2. **Use Built-in Build Scripts**: Leverage the existing build process in package.json.
3. **Verify Critical Settings**: Ensure port, database connection, and module format are correctly configured.
4. **Create Clean Production Artifacts**: Generate a minimal production package.json with only required dependencies.

## What Doesn't Work: Avoided Pitfalls

1. **Building New Server Files**: Creating separate production server files from scratch breaks functionality.
2. **Manual Database Setup**: Hard-coding database connection details instead of using environment variables.
3. **Ignoring Module Format**: Not accounting for ES module format in build and runtime.
4. **Missing Dependencies**: Not including critical dependencies in the production package.

## Pre-Deployment Checklist for the Future

1. **Port Configuration**: Verify server uses port 8080 in production.
2. **Database Connection**: Confirm code uses environment variables for all connections.
3. **Module Format**: Ensure package.json and build scripts handle ES modules correctly.
4. **Environment Variables**: Check that all required variables are documented.
5. **WebSocket Setup**: Verify any WebSocket servers use correct paths and protocols.
6. **Build Process**: Test the complete build process before deployment.

## Deployment Process

The optimized deployment process is:

1. Run `bash precise-deploy.sh` to build the application.
2. Deploy using Replit's Cloud Run deployment feature.
3. Set the build command to `bash precise-deploy.sh`.
4. Set the run command to `cd dist && npm start`.

This approach avoids the circular troubleshooting that occurred with multiple deployment scripts and ensures all functionality is preserved.