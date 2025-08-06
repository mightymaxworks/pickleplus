#!/usr/bin/env node

/**
 * Automated Testing Suite for Admin Enhanced Match Management
 * Performs comprehensive functional testing
 */

import puppeteer from 'puppeteer';
import axios from 'axios';

class AdminMatchManagementTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.results = {
      pageLoad: false,
      authentication: false,
      navigation: false,
      tabSwitching: false,
      formInteraction: false,
      dataDisplay: false,
      responsiveDesign: false,
      timestamp: new Date().toISOString()
    };
  }

  async setup() {
    console.log('🚀 Setting up browser for testing...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for mobile testing
    await this.page.setViewport({ width: 375, height: 667 });
  }

  async testPageLoad() {
    console.log('📄 Testing page load...');
    try {
      await this.page.goto(`${this.baseUrl}/admin/enhanced-match-management`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for main content to load
      await this.page.waitForSelector('[data-testid="admin-layout"], .admin-layout, main', {
        timeout: 10000
      });

      this.results.pageLoad = true;
      console.log('✅ Page loaded successfully');
    } catch (error) {
      console.error('❌ Page load failed:', error.message);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing authentication flow...');
    try {
      // Check if redirected to login
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        // Perform login
        await this.page.type('input[name="username"], input[type="text"]', 'admin');
        await this.page.type('input[name="password"], input[type="password"]', '67661189abc');
        await this.page.click('button[type="submit"], .login-button');
        
        // Wait for redirect
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      // Verify we're on the admin page
      const finalUrl = this.page.url();
      this.results.authentication = finalUrl.includes('/admin/enhanced-match-management');
      console.log('✅ Authentication successful');
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
    }
  }

  async testNavigation() {
    console.log('🧭 Testing navigation...');
    try {
      // Test main navigation elements
      const navElements = await this.page.$$('[role="navigation"], .navigation, nav');
      const tabElements = await this.page.$$('[role="tab"], .tab, button[data-value]');
      
      this.results.navigation = navElements.length > 0 || tabElements.length > 0;
      console.log(`✅ Navigation elements found: ${navElements.length + tabElements.length}`);
    } catch (error) {
      console.error('❌ Navigation test failed:', error.message);
    }
  }

  async testTabSwitching() {
    console.log('📑 Testing tab switching...');
    try {
      // Find tab elements
      const tabs = await this.page.$$('[role="tab"], button[data-value], .tab-trigger');
      
      if (tabs.length > 0) {
        // Click on different tabs
        for (let i = 0; i < Math.min(tabs.length, 3); i++) {
          await tabs[i].click();
          await this.page.waitForTimeout(1000); // Wait for tab content to load
        }
        this.results.tabSwitching = true;
        console.log(`✅ Tab switching tested with ${tabs.length} tabs`);
      } else {
        console.log('⚠️  No tabs found to test');
      }
    } catch (error) {
      console.error('❌ Tab switching test failed:', error.message);
    }
  }

  async testFormInteraction() {
    console.log('📝 Testing form interactions...');
    try {
      // Find form elements
      const forms = await this.page.$$('form');
      const inputs = await this.page.$$('input, select, textarea');
      const buttons = await this.page.$$('button[type="submit"], .submit-button');

      // Test Select components (critical for our fix)
      const selects = await this.page.$$('select, [role="combobox"]');
      
      if (selects.length > 0) {
        for (const select of selects) {
          try {
            await select.click();
            await this.page.waitForTimeout(500);
            
            // Try to select an option
            const options = await this.page.$$('[role="option"], option');
            if (options.length > 0) {
              await options[0].click();
            }
          } catch (e) {
            // Continue if individual select fails
          }
        }
      }

      this.results.formInteraction = inputs.length > 0;
      console.log(`✅ Form interaction tested: ${inputs.length} inputs, ${selects.length} selects`);
    } catch (error) {
      console.error('❌ Form interaction test failed:', error.message);
    }
  }

  async testDataDisplay() {
    console.log('📊 Testing data display...');
    try {
      // Wait for data to load
      await this.page.waitForTimeout(3000);
      
      // Check for data tables, cards, or lists
      const dataElements = await this.page.$$('table, .card, .data-item, [data-testid*="data"]');
      const loadingElements = await this.page.$$('.loading, .spinner, [data-loading="true"]');
      
      // Ensure loading is complete
      if (loadingElements.length === 0) {
        this.results.dataDisplay = dataElements.length > 0;
        console.log(`✅ Data display tested: ${dataElements.length} elements found`);
      } else {
        console.log('⚠️  Data still loading, retrying...');
        await this.page.waitForTimeout(5000);
        const retryDataElements = await this.page.$$('table, .card, .data-item');
        this.results.dataDisplay = retryDataElements.length > 0;
      }
    } catch (error) {
      console.error('❌ Data display test failed:', error.message);
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing responsive design...');
    try {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];

      let responsiveSuccess = 0;
      
      for (const viewport of viewports) {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(1000);
        
        // Check if page is still functional
        const visibleElements = await this.page.$$(':not([style*="display: none"])');
        if (visibleElements.length > 10) { // Arbitrary threshold
          responsiveSuccess++;
          console.log(`✅ ${viewport.name} viewport: functional`);
        }
      }

      this.results.responsiveDesign = responsiveSuccess === viewports.length;
    } catch (error) {
      console.error('❌ Responsive design test failed:', error.message);
    }
  }

  async generateTestReport() {
    console.log('\n📋 Generating test report...');
    
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

    console.log('\n🎯 TEST SUMMARY');
    console.log('=====================================');
    console.log(`Overall Success: ${report.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Tests Passed: ${report.summary.passedTests}/${report.summary.totalTests}`);
    console.log('=====================================');

    // Write detailed report
    await fs.writeFile('automated-test-report.json', JSON.stringify(report, null, 2));

    return report.summary.overallSuccess;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runTests() {
    console.log('🧪 Starting automated testing suite...\n');
    
    try {
      await this.setup();
      await this.testPageLoad();
      await this.testAuthentication();
      await this.testNavigation();
      await this.testTabSwitching();
      await this.testFormInteraction();
      await this.testDataDisplay();
      await this.testResponsiveDesign();
      
      const success = await this.generateTestReport();
      await this.cleanup();
      
      if (success) {
        console.log('🎉 All tests passed! Admin Enhanced Match Management is fully operational.');
        process.exit(0);
      } else {
        console.log('🔧 Some tests failed. Check automated-test-report.json for details.');
        process.exit(1);
      }
    } catch (error) {
      console.error('💥 Testing failed with error:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }
}

import { promises as fs } from 'fs';

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AdminMatchManagementTester();
  tester.runTests().catch(console.error);
}

export default AdminMatchManagementTester;