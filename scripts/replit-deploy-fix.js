// This is a simplified deployment helper for Replit Deployments
// It adds the necessary configuration to ensure smooth deployments

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const rootDir = resolve(__dirname, '..');

console.log('🔧 Setting up Replit deployment configuration...');

// Create .replit file if it doesn't exist
const replitConfigPath = join(rootDir, '.replit');
if (!existsSync(replitConfigPath)) {
  const replitConfig = `
run = "npm run dev"
entrypoint = "server/index.ts"

hidden = [".config", "package-lock.json"]

[nix]
channel = "stable-22_11"

[env]
XDG_CONFIG_HOME = "/home/runner/.config"
NODE_ENV = "development"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true
enabledForHosting = false

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"
syntax = "javascript"

[languages.javascript.languageServer]
start = [ "typescript-language-server", "--stdio" ]

[deployment]
build = ["npm", "run", "build"]
run = ["node", "dist/index.js"]
deploymentTarget = "cloudrun"
`;
  writeFileSync(replitConfigPath, replitConfig);
  console.log('✅ Created .replit configuration file');
}

// Create replit.nix if it doesn't exist
const replitNixPath = join(rootDir, 'replit.nix');
if (!existsSync(replitNixPath)) {
  const replitNix = `{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.postgresql
  ];
}`;
  writeFileSync(replitNixPath, replitNix);
  console.log('✅ Created replit.nix file');
}

// Modify package.json to ensure proper build for Replit
const packageJsonPath = join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure correct scripts for Replit deployment
  packageJson.scripts = {
    ...packageJson.scripts,
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  };
  
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts for Replit deployment');
} catch (error) {
  console.error('❌ Failed to update package.json:', error);
}

// Create a health check route that Replit will use
const healthCheckPath = join(rootDir, 'server', 'routes', 'replit-health-route.ts');
if (!existsSync(healthCheckPath)) {
  const healthCheckContent = `/**
 * PKL-278651-HEALTH-0003-REPLIT - Replit Health Check Route
 * 
 * This file provides a simple health check endpoint specifically for Replit's deployment service
 * to verify that the application is running properly.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import express, { Request, Response } from 'express';

/**
 * Register Replit-specific health check routes with the Express application
 * @param app Express application
 */
export function registerReplitHealthRoutes(app: express.Express): void {
  // Root health check endpoint for Replit
  app.get('/', (req: Request, res: Response) => {
    // Check if request is from browser (has accept header with text/html)
    const isFromBrowser = req.headers.accept?.includes('text/html');
    
    if (isFromBrowser) {
      // Forward to the SPA
      res.sendStatus(200);
    } else {
      // Simple health check for monitoring services
      res.status(200).json({
        status: 'ok',
        message: 'Pickle+ API is running',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.9.0'
      });
    }
  });
}
`;
  writeFileSync(healthCheckPath, healthCheckContent);
  console.log('✅ Created Replit health check route');
}

// Update main routes file to include the Replit health check
const routesPath = join(rootDir, 'server', 'routes.ts');
try {
  let routesContent = readFileSync(routesPath, 'utf8');
  
  // Check if we need to import the Replit health routes
  if (!routesContent.includes('registerReplitHealthRoutes')) {
    // Add import statement
    routesContent = routesContent.replace(
      'import { isAuthenticated } from "./middleware/auth";',
      'import { isAuthenticated } from "./middleware/auth";\nimport { registerReplitHealthRoutes } from "./routes/replit-health-route";'
    );
    
    // Add route registration
    routesContent = routesContent.replace(
      'registerHealthCheckRoutes(app);',
      'registerHealthCheckRoutes(app);\n  registerReplitHealthRoutes(app); // Special routes for Replit deployment'
    );
    
    writeFileSync(routesPath, routesContent);
    console.log('✅ Updated routes.ts to include Replit health check');
  } else {
    console.log('✓ Replit health routes already registered');
  }
} catch (error) {
  console.error('❌ Failed to update routes.ts:', error);
}

console.log('🎉 Replit deployment configuration complete!');
console.log(`
Next steps:
1. Click the "Deploy" button in the Replit interface
2. Replit will build and deploy your application
3. The app will be available at your .replit.app domain
`);