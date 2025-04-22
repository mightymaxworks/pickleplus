#!/usr/bin/env node

/**
 * PKL-278651-DEPLOY-0003-POST
 * Post-Build Processing Script
 * 
 * This script performs post-build tasks to prepare the application for deployment,
 * including optimization, validation, and documentation generation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const fs = require('fs');
const path = require('path');

// Get root directory
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('📦 Running post-build processing...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist directory does not exist. Build may have failed.');
  process.exit(1);
}

// Create a production .env template file for deployment
const envExamplePath = path.join(rootDir, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const productionEnvTemplate = envExample
    .replace(/NODE_ENV=.*/, 'NODE_ENV=production')
    .replace(/LOG_LEVEL=.*/, 'LOG_LEVEL=info')
    .replace(/# PRODUCTION SETTINGS/, '# PRODUCTION SETTINGS - CONFIGURE THESE VALUES');

  fs.writeFileSync(path.join(distDir, '.env.template'), productionEnvTemplate);
  console.log('✅ Created production .env.template file');
}

// Copy deployment documentation
const docsDir = path.join(rootDir, 'docs');
const deploymentDocs = [
  'deployment-checklist.md',
  'production-environment-setup.md',
  'production-monitoring.md'
];

if (!fs.existsSync(path.join(distDir, 'docs'))) {
  fs.mkdirSync(path.join(distDir, 'docs'), { recursive: true });
}

let docsFound = false;
for (const doc of deploymentDocs) {
  const srcPath = path.join(docsDir, doc);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, 'docs', doc));
    docsFound = true;
    console.log(`✅ Copied ${doc} to dist/docs`);
  }
}

if (!docsFound) {
  console.warn('⚠️ Warning: No deployment documentation found to copy');
}

// Create a README.md for the deployment package
const readmeContent = `# Pickle+ Deployment Package

**Version**: 0.9.0
**Build Date**: ${new Date().toISOString()}
**Framework**: Framework5.3

## Deployment Instructions

1. Configure environment variables by copying .env.template to .env and filling in required values
2. Set up a PostgreSQL database and update DATABASE_URL in the .env file
3. Run \`node index.js\` to start the application
4. Run \`node verify.js\` to verify the deployment is working properly

## Documentation

See the \`docs\` directory for detailed documentation:

- deployment-checklist.md: Full deployment checklist
- production-environment-setup.md: How to set up the production environment
- production-monitoring.md: Monitoring and maintenance guidelines

## Support

For issues or questions, refer to the documentation or contact support.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
console.log('✅ Created deployment README.md');

// Create an empty logs directory for production logs
const logsDir = path.join(distDir, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  // Create a .gitkeep file to ensure the directory is tracked
  fs.writeFileSync(path.join(logsDir, '.gitkeep'), '');
  console.log('✅ Created logs directory');
}

// Extract version information for the build metadata
let version = '0.9.0'; // Default version
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  version = packageJson.version || version;
} catch (error) {
  console.warn('⚠️ Warning: Could not read package.json for version information');
}

// Update build metadata with accurate version
const buildMetadataPath = path.join(distDir, 'build-metadata.json');
if (fs.existsSync(buildMetadataPath)) {
  try {
    const buildMetadata = JSON.parse(fs.readFileSync(buildMetadataPath, 'utf8'));
    buildMetadata.version = version;
    fs.writeFileSync(buildMetadataPath, JSON.stringify(buildMetadata, null, 2));
    console.log('✅ Updated build metadata with correct version');
  } catch (error) {
    console.warn('⚠️ Warning: Could not update build metadata with version information', error);
  }
}

console.log('✅ Post-build processing complete!');