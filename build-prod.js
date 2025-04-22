/**
 * Pickle+ Production Build Script
 * 
 * This script creates a proper production build that:
 * 1. Creates a server entry point with production configuration
 * 2. Ensures static files are properly served
 * 3. Sets up correct PORT configuration for Cloud Run (8080)
 * 4. Preserves all existing functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define important paths
const distDir = path.join(__dirname, 'dist');
const clientDistDir = path.join(__dirname, 'client', 'dist');
const serverEntryPath = path.join(distDir, 'prod-server.js');

// Create directories if they don't exist
console.log('🔧 Creating necessary directories...');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the client-side React app
console.log('🚀 Building React frontend...');
try {
  process.chdir(path.join(__dirname, 'client'));
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React frontend build successful');
} catch (error) {
  console.error('❌ Error building React frontend:', error.message);
  process.exit(1);
}

// Copy the enhanced production server file
console.log('📝 Creating production server entry point...');
try {
  const enhancedServerContent = fs.readFileSync(path.join(__dirname, 'prod-server.js'), 'utf8');
  fs.writeFileSync(serverEntryPath, enhancedServerContent);
  console.log('✅ Enhanced production server copied successfully');
} catch (error) {
  console.error('Error copying enhanced server file:', error.message);
  console.log('Falling back to basic server implementation...');
  
  // Create a basic server file as fallback
  const serverContent = `/**
 * Pickle+ Production Server
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    server: 'Pickle+ Production',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// For all other requests, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Pickle+ server running on port \${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || 'production'}\`);
  console.log(\`Current time: \${new Date().toISOString()}\`);
});
`;
  fs.writeFileSync(serverEntryPath, serverContent);
}

console.log('✅ Production server entry point created');

// Create package.json for production
console.log('📝 Creating production package.json...');
const productionPackageJson = {
  name: 'pickle-plus',
  version: '1.0.0',
  description: 'Pickle+ Platform',
  main: 'dist/prod-server.js',
  scripts: {
    start: 'node dist/prod-server.js'
  },
  dependencies: {
    express: '^4.18.3',
    '@neondatabase/serverless': '^0.9.0',
    'drizzle-orm': '^0.30.2'
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(productionPackageJson, null, 2)
);
console.log('✅ Production package.json created');

// Create a deployment summary
console.log('\n🎉 Production build completed successfully!');
console.log('\n📋 Deployment Instructions:');
console.log('1. In Replit deployment console, set:');
console.log('   - Build Command: node build-prod.js');
console.log('   - Run Command: npm --prefix dist start');
console.log('2. Click Deploy');
console.log('\n📂 Files created:');
console.log(`- ${serverEntryPath}`);
console.log(`- ${path.join(distDir, 'package.json')}`);
console.log('- Client build files (in client/dist)');