# Pickle+ Deployment Instructions

This document provides the latest instructions for deploying the Pickle+ platform to production.

## Important Deployment Requirements

When deploying to Cloud Run (via Replit), you need to:

1. Use port 8080 for the server (not 5000 or 3000)
2. Set the server to listen on `0.0.0.0` (not localhost or 127.0.0.1)
3. Ensure any runtime dependencies are added to the package.json file
4. For a full guide with multiple deployment options, see `FINAL-DEPLOYMENT-GUIDE.md`

## Recommended Deployment Option

After testing multiple approaches, we recommend the **Simple Frontend Proxy** approach, which:

- Requires minimal configuration
- Avoids complex TypeScript compilation issues 
- Avoids WebSocket connection problems
- Serves a professional landing page
- Can direct users to your actual application

### Simple Frontend Proxy Deployment

Follow these steps for the recommended deployment:

1. **Build Command**:
   ```
   cp simple-frontend-deploy.js index.js && echo '{"name":"pickle-plus","version":"1.0.0","main":"index.js","scripts":{"start":"node index.js"},"dependencies":{"express":"^4.18.3"}}' > package.json && npm install
   ```

2. **Run Command**:
   ```
   npm start
   ```

3. Click **Deploy**

This will:
- Create the necessary files for deployment
- Install the Express dependency
- Start the server on port 8080
- Serve a beautiful landing page
- Provide a link to your application

## Upgrading the Deployment

If you want more advanced functionality (database connections, WebSockets, etc.), you can:

1. Follow the options in the `FINAL-DEPLOYMENT-GUIDE.md` file
2. Modify `simple-frontend-deploy.js` to include additional functionality
3. Add necessary dependencies to the package.json

## Troubleshooting

Common deployment issues:

- **Port Issues**: Make sure your server is configured to use port 8080
- **Module Format**: If you get ES module errors, use CommonJS format with `require()` instead of `import`
- **Missing Dependencies**: Ensure all dependencies are listed in package.json
- **WebSocket Errors**: If you encounter WebSocket errors, try a deployment option without WebSockets

## Additional Resources

For more information, check:
- `FINAL-DEPLOYMENT-GUIDE.md` - Comprehensive deployment options
- `frontend-deploy.js` - Full frontend deployment example
- `landing-deploy.js` - Simple landing page example