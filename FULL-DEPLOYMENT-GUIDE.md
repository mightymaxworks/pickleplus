# Pickle+ Full Application Deployment Guide

This guide provides step-by-step instructions for deploying the complete Pickle+ platform, including both the frontend and backend components.

## About This Deployment

The full deployment:

1. Uses ES modules for server-side JavaScript compatibility
2. Builds and includes the complete React frontend
3. Connects to the PostgreSQL database with WebSocket support
4. Properly configures session management
5. Includes all API routes for full functionality
6. Sets up proper port configuration (80) for production

## Deployment Instructions

### 1. Full Deployment Setup

Run the full deployment build script:

```bash
chmod +x es-full-build.sh
./es-full-build.sh
```

This script:
- Builds the client application (React frontend)
- Creates a deployment directory with the built client
- Sets up the ES module-compatible server
- Copies API routes from the main codebase
- Installs all required dependencies
- Configures port 80 for standard HTTP traffic

### 2. Configure Replit Deployment

In the Replit deployment interface:

- **Build Command**:
  ```
  bash es-full-build.sh
  ```
  
- **Run Command**:
  ```
  cd dist && node index.js
  ```

### 3. Deploy

Click the "Deploy" button in the Replit interface.

## Technical Details

### Client Build

The client build process:
- Runs `npm run build` in the client directory
- Copies the built frontend to the deployment directory
- Falls back to a simplified placeholder if the build fails

### Server Configuration

The server is configured with:
- Dynamic loading of additional API routes
- Proper database connection with WebSocket support
- Session management with PostgreSQL or in-memory fallback
- Correct CORS settings for API access
- Static file serving for the frontend SPA

### Database Connection

The database connection:
- Uses the Neon PostgreSQL serverless client
- Configures WebSockets properly
- Handles connection errors gracefully
- Falls back to in-memory storage when needed

### Port Configuration

Port configuration:
- Uses PORT environment variable if set (for Cloud Run)
- Defaults to port 80 (standard HTTP)
- Adds Procfile and .env for explicit configuration

## Troubleshooting

If you encounter issues:

1. **Client Build Fails**: The script will create a placeholder frontend to ensure the server can still be deployed
2. **Database Connection Issues**: The server will run without database functionality if connection fails
3. **Port Conflicts**: Verify if port 80 is available; the server automatically uses the PORT environment variable
4. **Missing API Routes**: Check the console logs to ensure API routes were loaded correctly

## Development vs. Production

There are a few key differences between development and production:

1. **Static File Serving**: Development uses Vite dev server; production serves static built files
2. **Module System**: Production uses ES modules instead of CommonJS
3. **Port**: Development runs on 5000; production uses 80
4. **Cookie Security**: Production cookies are set as secure