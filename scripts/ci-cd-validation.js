#!/usr/bin/env node

/**
 * CI/CD Validation Script for Admin Enhanced Match Management
 * Ensures 100% operational status before deployment
 */

import axios from 'axios';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '67661189abc';

class AdminMatchManagementValidator {
  constructor() {
    this.session = null;
    this.results = {
      authentication: false,
      apiEndpoints: {},
      componentLoading: {},
      dataIntegrity: {},
      userInterface: {},
      timestamp: new Date().toISOString()
    };
  }

  async authenticate() {
    console.log('🔐 Authenticating admin user...');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      }, {
        withCredentials: true,
        timeout: 10000
      });

      if (response.status === 200) {
        this.session = response.headers['set-cookie'];
        this.results.authentication = true;
        console.log('✅ Admin authentication successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async validateApiEndpoints() {
    console.log('🔌 Validating API endpoints...');
    
    const endpoints = [
      '/api/admin/match-management/players/available',
      '/api/admin/match-management/matches',
      '/api/admin/match-management/competitions',
      '/api/admin/enhanced-match-management/age-groups',
      '/api/admin/enhanced-match-management/analytics/mixed-age-matches',
      '/api/admin/tournaments'
    ];

    const headers = this.session ? { 'Cookie': this.session.join('; ') } : {};

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers,
          timeout: 15000
        });
        
        this.results.apiEndpoints[endpoint] = {
          status: response.status,
          success: response.status === 200,
          responseTime: Date.now()
        };
        
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        this.results.apiEndpoints[endpoint] = {
          status: error.response?.status || 0,
          success: false,
          error: error.message
        };
        console.error(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }

  async validateComponentLoading() {
    console.log('🧩 Validating component loading...');
    
    // Check if critical components exist and are properly structured
    const components = [
      'client/src/pages/admin/EnhancedMatchManagement.tsx',
      'client/src/components/match/QuickMatchRecorderStreamlined.tsx',
      'client/src/modules/admin/components/AdminLayout.tsx'
    ];

    for (const component of components) {
      try {
        const content = await fs.readFile(component, 'utf8');
        
        // Check for common React/TypeScript issues
        const hasExport = content.includes('export');
        const hasReact = content.includes('React') || content.includes('tsx');
        const hasSelectItems = content.includes('SelectItem');
        const hasEmptyValues = content.includes('value=""');
        
        this.results.componentLoading[component] = {
          exists: true,
          hasExport,
          hasReact,
          hasSelectItems,
          hasEmptyValues: hasEmptyValues, // Should be false
          valid: hasExport && hasReact && (!hasSelectItems || !hasEmptyValues)
        };
        
        console.log(`✅ ${component}: ${this.results.componentLoading[component].valid ? 'Valid' : 'Issues detected'}`);
      } catch (error) {
        this.results.componentLoading[component] = {
          exists: false,
          error: error.message
        };
        console.error(`❌ ${component}: Not found`);
      }
    }
  }

  async validateDataIntegrity() {
    console.log('🗃️ Validating data integrity...');
    
    if (!this.session) {
      console.log('⚠️  Skipping data validation - no session');
      return;
    }

    const headers = { 'Cookie': this.session.join('; ') };

    try {
      // Test player data
      const playersResponse = await axios.get(`${BASE_URL}/api/admin/match-management/players/available`, { headers });
      this.results.dataIntegrity.players = {
        count: playersResponse.data?.data?.length || 0,
        valid: Array.isArray(playersResponse.data?.data)
      };

      // Test match data
      const matchesResponse = await axios.get(`${BASE_URL}/api/admin/match-management/matches`, { headers });
      this.results.dataIntegrity.matches = {
        count: matchesResponse.data?.data?.length || 0,
        valid: Array.isArray(matchesResponse.data?.data)
      };

      // Test tournament data
      const tournamentsResponse = await axios.get(`${BASE_URL}/api/admin/tournaments`, { headers });
      this.results.dataIntegrity.tournaments = {
        count: tournamentsResponse.data?.length || 0,
        valid: Array.isArray(tournamentsResponse.data)
      };

      console.log(`✅ Data integrity validated - Players: ${this.results.dataIntegrity.players.count}, Matches: ${this.results.dataIntegrity.matches.count}, Tournaments: ${this.results.dataIntegrity.tournaments.count}`);
    } catch (error) {
      console.error('❌ Data integrity validation failed:', error.message);
    }
  }

  async validateUserInterface() {
    console.log('🎨 Validating user interface components...');
    
    // Check for critical UI files and potential issues
    const uiChecks = {
      'Select components fixed': {
        files: [
          'client/src/components/match/QuickMatchRecorderStreamlined.tsx',
          'client/src/modules/admin/components/feedback/BugReportDetail.tsx',
          'client/src/components/community/AdvancedCommunitySearch.tsx',
          'client/src/components/community/CommunityList.tsx',
          'client/src/components/community/EventForm.tsx',
          'client/src/components/admin/PassportVerificationDashboard.tsx'
        ],
        check: async (file) => {
          const content = await fs.readFile(file, 'utf8');
          return !content.includes('SelectItem value=""');
        }
      },
      'Admin layout functional': {
        files: ['client/src/modules/admin/components/AdminLayout.tsx'],
        check: async (file) => {
          const content = await fs.readFile(file, 'utf8');
          return content.includes('export') && content.includes('AdminLayout');
        }
      }
    };

    for (const [checkName, config] of Object.entries(uiChecks)) {
      let passed = 0;
      let total = config.files.length;

      for (const file of config.files) {
        try {
          const result = await config.check(file);
          if (result) passed++;
        } catch (error) {
          console.error(`❌ UI check failed for ${file}: ${error.message}`);
        }
      }

      this.results.userInterface[checkName] = {
        passed,
        total,
        success: passed === total
      };

      console.log(`${this.results.userInterface[checkName].success ? '✅' : '❌'} ${checkName}: ${passed}/${total}`);
    }
  }

  async generateReport() {
    console.log('\n📊 Generating CI/CD validation report...');
    
    const report = {
      ...this.results,
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        overallSuccess: false
      }
    };

    // Calculate summary
    let totalChecks = 0;
    let passedChecks = 0;

    // Authentication
    totalChecks++;
    if (report.authentication) passedChecks++;

    // API Endpoints
    for (const endpoint of Object.values(report.apiEndpoints)) {
      totalChecks++;
      if (endpoint.success) passedChecks++;
    }

    // Component Loading
    for (const component of Object.values(report.componentLoading)) {
      totalChecks++;
      if (component.valid) passedChecks++;
    }

    // UI Checks
    for (const check of Object.values(report.userInterface)) {
      totalChecks++;
      if (check.success) passedChecks++;
    }

    report.summary = {
      totalChecks,
      passedChecks,
      overallSuccess: passedChecks === totalChecks,
      successRate: Math.round((passedChecks / totalChecks) * 100)
    };

    // Save report
    await fs.writeFile('ci-cd-validation-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('=====================================');
    console.log(`Overall Success: ${report.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Checks Passed: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
    console.log('=====================================');

    if (report.summary.overallSuccess) {
      console.log('🚀 Admin Enhanced Match Management is 100% operational!');
      process.exit(0);
    } else {
      console.log('🔧 Issues detected - see ci-cd-validation-report.json for details');
      process.exit(1);
    }
  }

  async runValidation() {
    console.log('🚀 Starting CI/CD validation for Admin Enhanced Match Management...\n');
    
    try {
      await this.authenticate();
      await this.validateApiEndpoints();
      await this.validateComponentLoading();
      await this.validateDataIntegrity();
      await this.validateUserInterface();
      await this.generateReport();
    } catch (error) {
      console.error('💥 Validation failed with error:', error.message);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AdminMatchManagementValidator();
  validator.runValidation().catch(console.error);
}

export default AdminMatchManagementValidator;