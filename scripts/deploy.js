/**
 * PKL-278651-DEPLOY-0001-PROD
 * Deployment Helper Script
 * 
 * This script orchestrates the deployment process using existing package.json scripts
 * and our Framework 5.3 enhancements.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment to production
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Pickle+ deployment process...');

// Step 1: Run prepare-build script
console.log('\n📋 STEP 1: Preparing build environment...');
try {
  require('./prepare-build.js');
  console.log('✅ Build environment prepared successfully');
} catch (error) {
  console.error('❌ Error preparing build environment:', error);
  process.exit(1);
}

// Step 2: Run existing build script
console.log('\n🔨 STEP 2: Building application...');
try {
  console.log('   Building client and server...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.error('❌ Error building application:', error);
  process.exit(1);
}

// Step 3: Run post-build script
console.log('\n📦 STEP 3: Finalizing build artifacts...');
try {
  require('./post-build.js');
  console.log('✅ Build artifacts finalized successfully');
} catch (error) {
  console.error('❌ Error finalizing build artifacts:', error);
  process.exit(1);
}

// Step 4: Create deployment verification script
console.log('\n🔍 STEP 4: Creating verification script...');

const verifyScript = `
#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Automatically generated on ${new Date().toISOString()}
 */

console.log('🔍 Running deployment verification...');

// Check server health
fetch('/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Server health check passed:', data);
  })
  .catch(err => {
    console.error('❌ Server health check failed:', err);
  });

// Check database connection
fetch('/api/db-status')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Database connection check passed:', data);
  })
  .catch(err => {
    console.error('❌ Database connection check failed:', err);
  });

// Check critical features
const criticalEndpoints = [
  '/api/auth/current-user',
  '/api/multi-rankings/leaderboard',
  '/api/communities'
];

Promise.all(
  criticalEndpoints.map(endpoint => 
    fetch(endpoint)
      .then(res => ({ endpoint, status: res.status }))
      .catch(err => ({ endpoint, error: err.message }))
  )
)
.then(results => {
  console.log('🔍 Critical endpoints check results:');
  results.forEach(result => {
    if (result.status) {
      console.log(\`✅ \${result.endpoint}: \${result.status}\`);
    } else {
      console.log(\`❌ \${result.endpoint}: \${result.error}\`);
    }
  });
});
`;

fs.writeFileSync(path.resolve(__dirname, '../dist/verify.js'), verifyScript);
console.log('✅ Verification script created');

console.log('\n🎉 Deployment preparation complete!');
console.log(`
Next steps:
1. Upload the contents of the 'dist' directory to your production server
2. Set up environment variables based on .env.template
3. Run 'node index.js' to start the application
4. Run 'node verify.js' to verify the deployment

Refer to docs/deployment-checklist.md for the full deployment checklist.
`);