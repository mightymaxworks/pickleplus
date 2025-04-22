#!/usr/bin/env node

/**
 * PKL-278651-DEPLOY-0004-VER
 * Production Readiness Verification Script
 * 
 * This script verifies that the application is ready for production deployment
 * by checking critical components and configurations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Verifying production readiness for Pickle+...');

// Track verification results
const results = {
  passed: [],
  warnings: [],
  failed: []
};

// Verify critical files exist
const requiredFiles = [
  { path: 'docs/production-monitoring.md', name: 'Production monitoring documentation' },
  { path: 'docs/deployment-checklist.md', name: 'Deployment checklist' },
  { path: 'server/health-checks.ts', name: 'Health check implementation' },
  { path: 'server/routes/health-check-routes.ts', name: 'Health check routes' },
  { path: 'server/db-factory.ts', name: 'Database factory with production safeguards' },
  { path: 'scripts/prepare-build.cjs', name: 'Build preparation script' },
  { path: 'scripts/post-build.cjs', name: 'Post-build script' }
];

console.log('\n📋 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file.path);
  if (fs.existsSync(filePath)) {
    results.passed.push(`✅ ${file.name} exists`);
  } else {
    results.failed.push(`❌ ${file.name} is missing (${file.path})`);
  }
}

// Check for environmental configuration
console.log('\n🔧 Checking configuration...');
const envExample = path.join(rootDir, '.env.example');
if (fs.existsSync(envExample)) {
  results.passed.push('✅ Environment template exists');
  
  // Check for production-specific variables
  const envContent = fs.readFileSync(envExample, 'utf8');
  if (envContent.includes('NODE_ENV=')) {
    results.passed.push('✅ Environment template includes NODE_ENV setting');
  } else {
    results.warnings.push('⚠️ Environment template missing NODE_ENV setting');
  }
} else {
  results.warnings.push('⚠️ Environment template (.env.example) missing');
}

// Check for health check routes in the codebase
console.log('\n🚦 Checking health endpoints...');
try {
  const healthCheckRoutes = fs.readFileSync(path.join(rootDir, 'server/routes/health-check-routes.ts'), 'utf8');
  
  if (healthCheckRoutes.includes('/api/health')) {
    results.passed.push('✅ Basic health check endpoint implemented');
  } else {
    results.warnings.push('⚠️ Basic health check endpoint may be missing');
  }
  
  if (healthCheckRoutes.includes('/api/health/db')) {
    results.passed.push('✅ Database health check endpoint implemented');
  } else {
    results.warnings.push('⚠️ Database health check endpoint may be missing');
  }
  
  if (healthCheckRoutes.includes('/api/health/memory')) {
    results.passed.push('✅ Memory usage health check endpoint implemented');
  } else {
    results.warnings.push('⚠️ Memory usage health check endpoint may be missing');
  }
} catch (error) {
  results.failed.push('❌ Could not verify health check implementation');
}

// Check database safeguards
console.log('\n🛡️ Checking database safeguards...');
try {
  const dbFactory = fs.readFileSync(path.join(rootDir, 'server/db-factory.ts'), 'utf8');
  
  if (dbFactory.includes('process.env.NODE_ENV === "production"')) {
    results.passed.push('✅ Production-specific database configuration implemented');
  } else {
    results.warnings.push('⚠️ No production-specific database configuration found');
  }
  
  if (dbFactory.includes('pool.on(\'error\'')) {
    results.passed.push('✅ Database connection error handling implemented');
  } else {
    results.warnings.push('⚠️ Database connection error handling may be missing');
  }
  
  if (dbFactory.includes('process.on(\'SIGTERM\'')) {
    results.passed.push('✅ Database graceful shutdown implemented');
  } else {
    results.warnings.push('⚠️ Database graceful shutdown may be missing');
  }
} catch (error) {
  results.failed.push('❌ Could not verify database safeguards');
}

// Check package.json for production scripts
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    results.passed.push('✅ Build script configured');
  } else {
    results.failed.push('❌ Build script missing in package.json');
  }
  
  if (packageJson.scripts && packageJson.scripts.start) {
    results.passed.push('✅ Start script configured');
  } else {
    results.warnings.push('⚠️ Start script missing in package.json');
  }
  
  // Check for production dependencies
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const requiredDeps = ['express', 'postgres', 'drizzle-orm'];
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length === 0) {
    results.passed.push('✅ All required dependencies are present');
  } else {
    results.warnings.push(`⚠️ Missing dependencies: ${missingDeps.join(', ')}`);
  }
} catch (error) {
  results.failed.push('❌ Could not verify package.json');
}

// Attempt to check if the server is running and health endpoints respond
console.log('\n🔄 Checking server health endpoints...');

// Function to check endpoint
function checkEndpoint(endpoint, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        results.passed.push(`✅ ${name} responded with 200 OK`);
      } else {
        results.warnings.push(`⚠️ ${name} responded with status ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', () => {
      results.warnings.push(`⚠️ ${name} is not responding`);
      resolve();
    });
    
    req.on('timeout', () => {
      results.warnings.push(`⚠️ ${name} timed out`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// Check endpoints
async function checkEndpoints() {
  await checkEndpoint('/api/health', 'Basic health endpoint');
  await checkEndpoint('/api/health/db', 'Database health endpoint');
  await checkEndpoint('/api/health/memory', 'Memory health endpoint');
  
  // Output results
  console.log('\n🔍 VERIFICATION RESULTS:');
  
  if (results.passed.length > 0) {
    console.log('\n✅ PASSED:');
    results.passed.forEach(item => console.log(`  ${item}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach(item => console.log(`  ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED:');
    results.failed.forEach(item => console.log(`  ${item}`));
  }
  
  // Final assessment
  console.log('\n📊 SUMMARY:');
  const totalChecks = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = (results.passed.length / totalChecks * 100).toFixed(1);
  
  console.log(`Total checks: ${totalChecks}`);
  console.log(`Passed: ${results.passed.length} (${passRate}%)`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length === 0) {
    if (results.warnings.length === 0) {
      console.log('\n🎉 EXCELLENT! Your application is ready for production deployment.');
    } else {
      console.log('\n🟡 GOOD! Your application can be deployed to production, but consider addressing the warnings.');
    }
  } else {
    console.log('\n🔴 ATTENTION! Your application has critical issues that should be fixed before production deployment.');
  }
}

checkEndpoints();