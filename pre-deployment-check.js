/**
 * Pickle+ Pre-Deployment Check
 * 
 * This script performs a series of checks to ensure the application
 * is ready for deployment, focusing on the key issues that have
 * been identified during previous deployment attempts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII art logo for better visibility
console.log(`
  🥒🥒🥒 PICKLE+ PRE-DEPLOYMENT CHECK 🥒🥒🥒
  =========================================
`);

// Status tracking
let allChecksPassed = true;
const issues = [];

// Helper function to print check results
function printCheck(name, success, message) {
  const status = success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${name}`);
  if (!success) {
    console.log(`    Issue: ${message}`);
    issues.push({ name, message });
    allChecksPassed = false;
  }
}

// 1. Check port configuration in server/index.ts
async function checkPortConfiguration() {
  try {
    const serverCodePath = path.join(process.cwd(), 'server', 'index.ts');
    
    if (!fs.existsSync(serverCodePath)) {
      return printCheck(
        "Port Configuration", 
        false, 
        "server/index.ts file not found"
      );
    }
    
    const serverCode = fs.readFileSync(serverCodePath, 'utf8');
    
    // Check if production port is set to 8080
    const productionPortCheck = serverCode.includes("process.env.NODE_ENV === 'production' ? 8080");
    
    printCheck(
      "Port Configuration", 
      productionPortCheck, 
      "Production port should be set to 8080 for Cloud Run compatibility"
    );
  } catch (error) {
    printCheck("Port Configuration", false, `Error checking port: ${error.message}`);
  }
}

// 2. Check database URL configuration
async function checkDatabaseConfiguration() {
  try {
    const dbFactoryPath = path.join(process.cwd(), 'server', 'db-factory.ts');
    
    if (!fs.existsSync(dbFactoryPath)) {
      return printCheck(
        "Database Configuration", 
        false, 
        "server/db-factory.ts file not found"
      );
    }
    
    const dbCode = fs.readFileSync(dbFactoryPath, 'utf8');
    
    // Check if DATABASE_URL environment variable is used
    const databaseUrlCheck = dbCode.includes("process.env.DATABASE_URL");
    
    printCheck(
      "Database Configuration", 
      databaseUrlCheck, 
      "Database should use process.env.DATABASE_URL for connection"
    );
  } catch (error) {
    printCheck("Database Configuration", false, `Error checking database: ${error.message}`);
  }
}

// 3. Check package.json for module type
async function checkPackageJsonConfiguration() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return printCheck(
        "Package.json Configuration", 
        false, 
        "package.json file not found"
      );
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if type is set to "module"
    const moduleTypeCheck = packageJson.type === "module";
    
    printCheck(
      "Package.json Module Type", 
      moduleTypeCheck, 
      'package.json should have "type": "module" for ES module compatibility'
    );
    
    // Check build script
    const hasBuildScript = !!packageJson.scripts && !!packageJson.scripts.build;
    
    printCheck(
      "Build Script", 
      hasBuildScript, 
      'package.json should have a "build" script'
    );
  } catch (error) {
    printCheck("Package.json Configuration", false, `Error checking package.json: ${error.message}`);
  }
}

// 4. Check for existence of critical deployment files
async function checkDeploymentFiles() {
  try {
    const preciseDeployPath = path.join(process.cwd(), 'precise-deploy.sh');
    const preciseDeployExists = fs.existsSync(preciseDeployPath);
    
    printCheck(
      "Deployment Script", 
      preciseDeployExists, 
      "precise-deploy.sh is missing - this is needed for the deployment process"
    );
  } catch (error) {
    printCheck("Deployment Files", false, `Error checking deployment files: ${error.message}`);
  }
}

// 5. Check build process
async function checkBuildProcess() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return printCheck(
        "Build Process", 
        false, 
        "package.json file not found"
      );
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.build) {
      return printCheck(
        "Build Process", 
        false, 
        'package.json is missing a "build" script'
      );
    }
    
    const buildScript = packageJson.scripts.build;
    const includesViteBuild = buildScript.includes("vite build");
    const includesServerBuild = buildScript.includes("esbuild server");
    
    printCheck(
      "Build Process", 
      includesViteBuild && includesServerBuild, 
      "Build script should include both client (vite) and server (esbuild) builds"
    );
  } catch (error) {
    printCheck("Build Process", false, `Error checking build process: ${error.message}`);
  }
}

// Run all checks
async function runAllChecks() {
  try {
    await checkPortConfiguration();
    await checkDatabaseConfiguration();
    await checkPackageJsonConfiguration();
    await checkDeploymentFiles();
    await checkBuildProcess();
    
    console.log("\n-----------------------------------------");
    if (allChecksPassed) {
      console.log("✅ ALL CHECKS PASSED! Your application is ready for deployment.");
      console.log("\nTo deploy:");
      console.log("1. Run: bash precise-deploy.sh");
      console.log("2. Use Replit's Cloud Run deployment with:");
      console.log("   - Build Command: bash precise-deploy.sh");
      console.log("   - Run Command: cd dist && npm start");
    } else {
      console.log("❌ SOME CHECKS FAILED. Please fix the issues listed below before deploying:");
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.name}`);
        console.log(`   Issue: ${issue.message}`);
      });
    }
  } catch (error) {
    console.error("Error running checks:", error);
  }
}

runAllChecks();