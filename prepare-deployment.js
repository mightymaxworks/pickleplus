/**
 * Pickle+ Production Deployment Preparation Script
 * 
 * This script:
 * 1. Creates a 'dist' directory
 * 2. Copies production-app.js to dist/index.js
 * 3. Copies production-package.json to dist/package.json
 * 4. Creates the public directory in dist
 * 5. Copies the public/index.html file to dist/public/index.html
 * 
 * After running this script, the 'dist' directory will be ready
 * for deployment using the Replit deployment process.
 */

const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
  console.log('✅ Created dist directory');
}

// Copy production-app.js to dist/index.js
fs.copyFileSync('production-app.js', 'dist/index.js');
console.log('✅ Copied production-app.js to dist/index.js');

// Copy production-package.json to dist/package.json
fs.copyFileSync('production-package.json', 'dist/package.json');
console.log('✅ Copied production-package.json to dist/package.json');

// Create public directory in dist if it doesn't exist
if (!fs.existsSync(path.join('dist', 'public'))) {
  fs.mkdirSync(path.join('dist', 'public'));
  console.log('✅ Created dist/public directory');
}

// Copy public/index.html to dist/public/index.html
fs.copyFileSync('public/index.html', 'dist/public/index.html');
console.log('✅ Copied public/index.html to dist/public/index.html');

console.log('\n🚀 Deployment preparation complete!');
console.log('\nTo deploy:');
console.log('1. In Replit, click on "Deployment" in the sidebar');
console.log('2. Set the following deployment settings:');
console.log('   - Build Command: node prepare-deployment.js');
console.log('   - Run Command: node dist/index.js');
console.log('   - Directory: dist');
console.log('3. Click "Deploy"');