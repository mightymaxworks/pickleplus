#!/usr/bin/env node
/**
 * PKL-278651-DEPLOY-0001-PROD
 * Production Deployment Helper Script
 * 
 * This script handles production deployment tasks for Framework 5.3
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set environment to production
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Pickle+ production deployment...');

function runStep(name, command) {
  console.log(`\n🔄 Running step: ${name}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${name} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    return false;
  }
}

// Step 1: Prepare the environment
if (!runStep('Environment preparation', 'NODE_ENV=production npm run build:prepare')) {
  process.exit(1);
}

// Step 2: Build the application
if (!runStep('Application build', 'npm run build')) {
  process.exit(1);
}

// Step 3: Post-build processing
if (!runStep('Post-build processing', 'NODE_ENV=production npm run build:post')) {
  process.exit(1);
}

// Step 4: Create deployment verification script
console.log('\n📋 Creating verification artifacts...');

// Create dist dir if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
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
4. Access the health endpoints to verify the deployment:
   - /api/health - Basic health check
   - /api/health/db - Database connectivity check
   - /api/health/memory - Memory usage check
   - /api/health/detailed - Comprehensive health information

## Documentation

See the \`docs\` directory for detailed documentation:

- deployment-checklist.md: Full deployment checklist
- production-environment-setup.md: How to set up the production environment
- production-monitoring.md: Monitoring and maintenance guidelines

## Support

For support, please refer to the documentation or contact support.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
console.log('✅ Created deployment README.md');

console.log('\n🎉 Deployment preparation complete!');
console.log(`
Next steps:
1. Upload the contents of the 'dist' directory to your production server
2. Set up environment variables based on .env.template
3. Run 'node index.js' to start the application
4. Check '/api/health' to verify the deployment

Refer to docs/deployment-checklist.md for the full deployment checklist.
`);