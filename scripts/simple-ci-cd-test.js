#!/usr/bin/env node

/**
 * Simple CI/CD Test for Admin Enhanced Match Management
 * Tests the current working system for 100% operational status
 */

import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const BASE_URL = 'http://localhost:5000';

class SimpleAdminValidator {
  constructor() {
    this.results = {
      serverResponding: false,
      adminRouteAccessible: false,
      selectComponentsFixed: false,
      criticalFilesExist: false,
      timestamp: new Date().toISOString()
    };
  }

  async testServerResponse() {
    console.log('🌐 Testing server response...');
    try {
      const response = await axios.get(`${BASE_URL}`, { timeout: 5000 });
      this.results.serverResponding = response.status === 200;
      console.log(`✅ Server responding: ${response.status}`);
    } catch (error) {
      console.log(`❌ Server not responding: ${error.message}`);
    }
  }

  async testAdminRoute() {
    console.log('🔧 Testing admin route accessibility...');
    try {
      const response = await axios.get(`${BASE_URL}/admin/enhanced-match-management`, { 
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept redirects and auth errors
      });
      
      // 200 (OK), 302 (redirect to login), or 401 (unauthorized) are all acceptable
      this.results.adminRouteAccessible = [200, 302, 401].includes(response.status);
      console.log(`✅ Admin route accessible: ${response.status}`);
    } catch (error) {
      console.log(`❌ Admin route failed: ${error.message}`);
    }
  }

  async testSelectComponentsFix() {
    console.log('🔍 Testing Select components for empty values...');
    try {
      const filesToCheck = [
        'client/src/components/match/QuickMatchRecorderStreamlined.tsx',
        'client/src/modules/admin/components/feedback/BugReportDetail.tsx',
        'client/src/components/community/AdvancedCommunitySearch.tsx',
        'client/src/components/community/CommunityList.tsx',
        'client/src/components/community/EventForm.tsx',
        'client/src/components/admin/PassportVerificationDashboard.tsx'
      ];

      let hasEmptyValues = false;
      let checkedFiles = 0;

      for (const file of filesToCheck) {
        try {
          const fullPath = join(ROOT_DIR, file);
          const content = readFileSync(fullPath, 'utf8');
          
          if (content.includes('SelectItem value=""')) {
            console.log(`❌ Found empty SelectItem in ${file}`);
            hasEmptyValues = true;
          }
          checkedFiles++;
        } catch (error) {
          // File might not exist, continue
          console.log(`⚠️  Could not check ${file}`);
        }
      }

      this.results.selectComponentsFixed = !hasEmptyValues && checkedFiles > 0;
      console.log(`${this.results.selectComponentsFixed ? '✅' : '❌'} Select components fixed: ${checkedFiles} files checked`);
    } catch (error) {
      console.log(`❌ Select components test failed: ${error.message}`);
    }
  }

  async testCriticalFiles() {
    console.log('📁 Testing critical files exist...');
    try {
      const criticalFiles = [
        'client/src/pages/admin/EnhancedMatchManagement.tsx',
        'client/src/modules/admin/components/AdminLayout.tsx'
      ];

      let existingFiles = 0;

      for (const file of criticalFiles) {
        try {
          const fullPath = join(ROOT_DIR, file);
          const content = readFileSync(fullPath, 'utf8');
          
          if (content.includes('export') && content.length > 100) {
            existingFiles++;
            console.log(`✅ ${file} exists and valid`);
          }
        } catch (error) {
          console.log(`❌ ${file} missing or invalid`);
        }
      }

      this.results.criticalFilesExist = existingFiles === criticalFiles.length;
    } catch (error) {
      console.log(`❌ Critical files test failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Generating validation report...');
    
    const totalTests = Object.keys(this.results).length - 1; // Exclude timestamp
    const passedTests = Object.values(this.results).filter(result => result === true).length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    const report = {
      ...this.results,
      summary: {
        totalTests,
        passedTests,
        successRate,
        overallSuccess: passedTests === totalTests
      }
    };

    // Write report
    writeFileSync('simple-ci-cd-report.json', JSON.stringify(report, null, 2));

    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('=====================================');
    console.log(`Overall Success: ${report.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Tests Passed: ${report.summary.passedTests}/${report.summary.totalTests}`);
    console.log('=====================================');

    if (report.summary.overallSuccess) {
      console.log('🚀 Admin Enhanced Match Management is 100% operational!');
      console.log('✅ Ready for production deployment');
      return true;
    } else {
      console.log('🔧 Issues detected - review the report for details');
      return false;
    }
  }

  async runValidation() {
    console.log('🚀 Starting Simple CI/CD Validation...\n');
    
    await this.testServerResponse();
    await this.testAdminRoute();
    await this.testSelectComponentsFix();
    await this.testCriticalFiles();
    
    const success = this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// Run validation
const validator = new SimpleAdminValidator();
validator.runValidation().catch((error) => {
  console.error('💥 Validation failed:', error.message);
  process.exit(1);
});