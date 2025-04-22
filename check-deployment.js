/**
 * Pickle+ Deployment Readiness Checker
 * Run with: node check-deployment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Utility function to print status messages
function printStatus(message, status, details = '') {
  const statusColors = {
    'PASS': colors.green,
    'FAIL': colors.red,
    'WARN': colors.yellow,
    'INFO': colors.blue
  };
  
  console.log(
    `${statusColors[status]}[${status}]${colors.reset} ${message}` +
    (details ? `\n       ${colors.cyan}${details}${colors.reset}` : '')
  );
}

console.log(`\n${colors.bold}${colors.magenta}===== Pickle+ Deployment Readiness Check =====${colors.reset}\n`);

// Check 1: Verify server port configuration
function checkServerPort() {
  console.log(`\n${colors.bold}${colors.blue}Checking Server Configuration...${colors.reset}`);
  
  try {
    const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
    const serverContent = fs.readFileSync(serverIndexPath, 'utf8');
    
    if (serverContent.includes('const port = 8080')) {
      printStatus('Server port configured correctly for Cloud Run (8080)', 'PASS');
    } else if (serverContent.includes('port = process.env.NODE_ENV === \'production\' ? 8080 : 5000')) {
      printStatus('Server port conditionally set for production (8080) and development (5000)', 'PASS');
    } else if (serverContent.includes('const port = process.env.PORT || 5000')) {
      printStatus('Server using environment PORT variable with 5000 fallback', 'WARN', 
                  'This may work if PORT is set to 8080 in deployment environment');
    } else {
      printStatus('Server port not explicitly set to 8080 for Cloud Run', 'FAIL',
                 'Update server/index.ts to use port 8080 for production or run ./simple.sh');
    }
  } catch (error) {
    printStatus('Could not check server port configuration', 'FAIL', error.message);
  }
}

// Check 2: Verify database configuration
function checkDatabaseConfig() {
  console.log(`\n${colors.bold}${colors.blue}Checking Database Configuration...${colors.reset}`);
  
  try {
    const dbPath = path.join(__dirname, 'server', 'db.ts');
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    
    if (dbContent.includes('@neondatabase/serverless')) {
      printStatus('Using Neon Serverless PostgreSQL', 'PASS');
    } else {
      printStatus('Not using Neon Serverless PostgreSQL', 'INFO',
                 'This is not necessarily a problem, but Neon is recommended for Replit deployments');
    }
    
    if (dbContent.includes('process.env.DATABASE_URL')) {
      printStatus('Using DATABASE_URL environment variable', 'PASS');
    } else {
      printStatus('No DATABASE_URL environment variable found', 'WARN',
                 'Make sure database connection string is properly configured');
    }
    
    if (dbContent.includes('neonConfig.webSocketConstructor = ws')) {
      printStatus('WebSocket configuration for Neon properly set', 'PASS');
    } else if (dbContent.includes('@neondatabase/serverless')) {
      printStatus('Neon WebSocket configuration not found', 'WARN',
                 'Add: neonConfig.webSocketConstructor = ws');
    }
  } catch (error) {
    printStatus('Could not check database configuration', 'FAIL', error.message);
  }
}

// Check 3: Verify routes configuration
function checkRoutesConfig() {
  console.log(`\n${colors.bold}${colors.blue}Checking Routes Configuration...${colors.reset}`);
  
  try {
    const routesPath = path.join(__dirname, 'server', 'routes.ts');
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    if (routesContent.includes('import { specialRouter }') || 
        routesContent.includes("import { specialRouter }")) {
      printStatus('Special routes imported', 'PASS');
    } else {
      printStatus('Special routes not imported', 'WARN',
                 'Check if special-routes.ts needs to be imported in routes.ts');
    }
    
    if (routesContent.includes('app.use(\'/api\', specialRouter)')) {
      printStatus('Special routes mounted', 'PASS');
    } else if (routesContent.includes('import { specialRouter }')) {
      printStatus('Special routes imported but not mounted', 'FAIL',
                 'Add: app.use(\'/api\', specialRouter)');
    }
    
    // Check for correct server creation
    if (routesContent.includes('const server = http.createServer(app)')) {
      printStatus('HTTP server properly created', 'PASS');
    } else {
      printStatus('HTTP server creation not found or unusual pattern', 'WARN',
                 'Make sure server is created with: const server = http.createServer(app)');
    }
  } catch (error) {
    printStatus('Could not check routes configuration', 'FAIL', error.message);
  }
}

// Check 4: Check package.json
function checkPackageJson() {
  console.log(`\n${colors.bold}${colors.blue}Checking Package Configuration...${colors.reset}`);
  
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = require(packagePath);
    
    // Check Node.js type
    if (packageJson.type === 'module') {
      printStatus('Package type is set to "module"', 'PASS');
    } else {
      printStatus('Package type is not set to "module"', 'INFO',
                 'This is only a concern if you use ES modules syntax');
    }
    
    // Check start script
    if (packageJson.scripts && packageJson.scripts.start) {
      printStatus('Start script exists: ' + packageJson.scripts.start, 'PASS');
    } else {
      printStatus('No start script found in package.json', 'WARN',
                 'Consider adding a start script for production');
    }
    
    // Check key dependencies
    const criticalDeps = [
      '@neondatabase/serverless',
      'express',
      'drizzle-orm',
      'react',
      'vite'
    ];
    
    const missingDeps = criticalDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
      printStatus('All critical dependencies present', 'PASS');
    } else {
      printStatus('Missing critical dependencies: ' + missingDeps.join(', '), 'WARN',
                 'Make sure these are installed before deployment');
    }
  } catch (error) {
    printStatus('Could not check package.json', 'FAIL', error.message);
  }
}

// Check 5: Check for Node.js native modules in client code
function checkClientImports() {
  console.log(`\n${colors.bold}${colors.blue}Checking Client Imports...${colors.reset}`);
  
  const clientDir = path.join(__dirname, 'client');
  const nodeNativeModules = [
    'fs', 
    'path', 
    'os', 
    'crypto', 
    'http', 
    'https', 
    'net', 
    'tls',
    'perf_hooks',
    'child_process',
    'worker_threads'
  ];
  
  let foundIssues = false;
  
  try {
    // Use a simple grep-like approach to find problematic imports
    if (fs.existsSync(clientDir)) {
      nodeNativeModules.forEach(module => {
        try {
          const results = execSync(`grep -r "from '${module}'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ${clientDir}`, { stdio: 'pipe' }).toString();
          
          if (results) {
            printStatus(`Found Node.js native module '${module}' in client code`, 'FAIL', 
                       'This will cause build errors for browser code');
            foundIssues = true;
          }
        } catch (e) {
          // grep returns non-zero exit code when no matches found, which is what we want
        }
      });
      
      if (!foundIssues) {
        printStatus('No Node.js native modules found in client code', 'PASS');
      }
    } else {
      printStatus('Client directory not found at expected location', 'WARN',
                 'Could not check for Node.js native modules in client code');
    }
  } catch (error) {
    printStatus('Error checking client imports', 'FAIL', error.message);
  }
}

// Check 6: Verify health endpoints
function checkHealthEndpoints() {
  console.log(`\n${colors.bold}${colors.blue}Checking Health Endpoints...${colors.reset}`);
  
  try {
    const healthRoutesPath = path.join(__dirname, 'server', 'routes', 'health-check-routes.ts');
    
    if (fs.existsSync(healthRoutesPath)) {
      const healthRoutesContent = fs.readFileSync(healthRoutesPath, 'utf8');
      
      if (healthRoutesContent.includes('/health') || healthRoutesContent.includes('/api/health')) {
        printStatus('Health check endpoint found', 'PASS');
      } else {
        printStatus('Health check endpoint not explicitly found', 'WARN',
                   'Consider adding a basic health endpoint at /api/health');
      }
    } else {
      printStatus('Health routes file not found at expected location', 'WARN',
                 'Consider adding a basic health endpoint for monitoring');
    }
  } catch (error) {
    printStatus('Could not check health endpoints', 'FAIL', error.message);
  }
}

// Check 7: Environment variables
function checkEnvironmentVariables() {
  console.log(`\n${colors.bold}${colors.blue}Checking Environment Configuration...${colors.reset}`);
  
  try {
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      printStatus(`Found .env file with ${envLines.length} configured variables`, 'PASS');
      
      // Check for critical variables
      const criticalVars = ['DATABASE_URL', 'SESSION_SECRET'];
      const missingVars = criticalVars.filter(variable => 
        !envLines.some(line => line.startsWith(`${variable}=`))
      );
      
      if (missingVars.length === 0) {
        printStatus('All critical environment variables found', 'PASS');
      } else {
        printStatus('Missing critical environment variables: ' + missingVars.join(', '), 'WARN',
                   'Make sure these are set in Replit Secrets for deployment');
      }
    } else {
      printStatus('.env file not found', 'WARN',
                 'Make sure environment variables are set in Replit Secrets');
    }
    
    if (fs.existsSync(envExamplePath)) {
      printStatus('.env.example file found', 'PASS',
                 'This helps document required environment variables');
    } else {
      printStatus('.env.example file not found', 'INFO',
                 'Consider adding an example file to document required variables');
    }
  } catch (error) {
    printStatus('Could not check environment variables', 'FAIL', error.message);
  }
}

// Run all checks
checkServerPort();
checkDatabaseConfig();
checkRoutesConfig();
checkPackageJson();
checkClientImports();
checkHealthEndpoints();
checkEnvironmentVariables();

console.log(`\n${colors.bold}${colors.magenta}===== Deployment Checklist Complete =====${colors.reset}\n`);
console.log(`${colors.cyan}Run this deployment script to prepare for deployment: ./simple.sh${colors.reset}`);
console.log(`${colors.cyan}Then deploy with build command: npm install${colors.reset}`);
console.log(`${colors.cyan}And run command: npx tsx server/index.ts${colors.reset}\n`);