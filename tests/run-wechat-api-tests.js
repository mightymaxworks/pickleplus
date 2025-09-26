#!/usr/bin/env node

/**
 * PKL-278651-API-0001-TEST-RUNNER
 * WeChat API Test Runner
 * 
 * Comprehensive test runner for WeChat integration API endpoints
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`\n${colorize('▶', 'blue')} ${description}...`, 'bright');
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`❌ ${description} failed`, 'red');
        log(`Error: ${error.message}`, 'red');
        if (stderr) log(`Stderr: ${stderr}`, 'red');
        reject(error);
      } else {
        log(`✅ ${description} completed`, 'green');
        if (stdout) log(stdout, 'cyan');
        resolve(stdout);
      }
    });

    // Show real-time output for long-running commands
    child.stdout?.on('data', (data) => {
      process.stdout.write(colorize(data, 'cyan'));
    });

    child.stderr?.on('data', (data) => {
      process.stderr.write(colorize(data, 'yellow'));
    });
  });
}

async function checkPrerequisites() {
  log('\n📋 Checking prerequisites...', 'bright');
  
  // Check if server is running
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:5000/health', {
      timeout: 3000
    });
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    log('✅ Server is running and accessible', 'green');
  } catch (error) {
    log('❌ Server is not running or not accessible', 'red');
    log('   Please start the server with: npm run dev', 'yellow');
    process.exit(1);
  }

  // Check if test database is available
  try {
    await runCommand('npm run db:check', 'Database connectivity check');
  } catch (error) {
    log('⚠️  Database check failed, tests may fail', 'yellow');
  }
}

async function runTestSuite(testFile, description) {
  const testPath = path.join(__dirname, testFile);
  
  if (!fs.existsSync(testPath)) {
    log(`⚠️  Test file not found: ${testFile}`, 'yellow');
    return false;
  }

  try {
    await runCommand(
      `npx jest ${testPath} --verbose --detectOpenHandles`,
      `Running ${description}`
    );
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

async function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    test_suite: 'WeChat Integration API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    results,
    summary: {
      total_suites: results.length,
      passed_suites: results.filter(r => r.passed).length,
      failed_suites: results.filter(r => r.passed === false).length,
      overall_status: results.every(r => r.passed) ? 'PASS' : 'FAIL'
    }
  };

  const reportPath = path.join(__dirname, '../test-results', `wechat-api-test-report-${Date.now()}.json`);
  
  // Ensure test-results directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📊 Test report saved to: ${reportPath}`, 'blue');
  
  return report;
}

async function main() {
  log(colorize('\n🚀 WeChat Integration API Test Suite', 'bright'));
  log(colorize('=' .repeat(50), 'cyan'));
  
  const startTime = Date.now();
  const results = [];

  try {
    // Prerequisites check
    await checkPrerequisites();

    // Test suites to run
    const testSuites = [
      {
        file: 'wechat-integration-api.test.js',
        description: 'WeChat Integration API Tests',
        critical: true
      },
      {
        file: 'webhook-integration.test.js',
        description: 'Webhook Integration Tests',
        critical: true
      }
    ];

    // Run all test suites
    for (const suite of testSuites) {
      log(`\n${'='.repeat(50)}`, 'cyan');
      const passed = await runTestSuite(suite.file, suite.description);
      
      results.push({
        suite: suite.description,
        file: suite.file,
        passed,
        critical: suite.critical,
        timestamp: new Date().toISOString()
      });

      if (!passed && suite.critical) {
        log(`❌ Critical test suite failed: ${suite.description}`, 'red');
        log('   API may not be ready for production use', 'yellow');
      }
    }

    // Generate test report
    const report = await generateTestReport(results);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n' + '='.repeat(50), 'cyan');
    log(colorize('📊 TEST SUMMARY', 'bright'));
    log('='.repeat(50), 'cyan');
    
    log(`Total Test Suites: ${report.summary.total_suites}`, 'blue');
    log(`Passed: ${colorize(report.summary.passed_suites, 'green')}`, 'green');
    log(`Failed: ${colorize(report.summary.failed_suites, 'red')}`, 'red');
    log(`Duration: ${duration}s`, 'blue');
    log(`Overall Status: ${colorize(report.summary.overall_status, report.summary.overall_status === 'PASS' ? 'green' : 'red')}`, 'bright');

    if (report.summary.overall_status === 'PASS') {
      log('\n🎉 All tests passed! WeChat API is ready for external developers.', 'green');
      log('   External apps can now safely integrate with Pickle+ API', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review and fix issues before release.', 'yellow');
      log('   Check the test report for detailed error information', 'yellow');
    }

    // API Documentation reminder
    log('\n📚 Next Steps:', 'bright');
    log('   1. Review test report for any issues', 'blue');
    log('   2. Generate API documentation for external developers', 'blue');
    log('   3. Set up CI/CD pipeline for automated testing', 'blue');
    log('   4. Create developer portal with API examples', 'blue');

    process.exit(report.summary.overall_status === 'PASS' ? 0 : 1);

  } catch (error) {
    log(`\n❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n⚠️  Test runner interrupted by user', 'yellow');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Test runner terminated', 'yellow');
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, runTestSuite, generateTestReport };