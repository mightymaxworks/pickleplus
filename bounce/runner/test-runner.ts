/**
 * PKL-278651-BOUNCE-0010-CICD - Bounce Test Runner
 * 
 * Core implementation of the test runner that executes automated tests
 * for CI/CD workflows.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import fs from 'fs';
import path from 'path';
import { bounceIdentity } from '../core/bounce-identity';
import { nonDestructiveTester } from '../core/non-destructive-tester';
import { BounceTestRunStatus, BounceFindingSeverity } from '../../shared/schema/bounce';
import { Browser, Page, chromium, firefox, webkit } from 'playwright';

/**
 * Configuration for the test runner
 */
export interface RunnerConfig {
  /**
   * Test suite name to run
   */
  suite: string;
  
  /**
   * Browsers to test with
   */
  browsers: string[];
  
  /**
   * Environment to test against
   */
  environment: string;
  
  /**
   * Run browsers in headless mode
   */
  headless: boolean;
  
  /**
   * Enable verbose logging
   */
  verbose: boolean;
  
  /**
   * Test run ID for recording findings
   */
  testRunId: number;
}

/**
 * Test results structure
 */
export interface TestResults {
  /**
   * Whether the overall test run succeeded
   */
  success: boolean;
  
  /**
   * Total number of tests executed
   */
  total: number;
  
  /**
   * Number of passing tests
   */
  passed: number;
  
  /**
   * Number of failing tests
   */
  failed: number;
  
  /**
   * Number of skipped tests
   */
  skipped: number;
  
  /**
   * Coverage percentage (0-100)
   */
  coverage: number;
  
  /**
   * Array of findings (issues)
   */
  findings: {
    id: number;
    description: string;
    severity: BounceFindingSeverity;
    area: string;
    browser: string;
  }[];
}

/**
 * Test step types
 */
export type TestStep = {
  /**
   * Action to perform (navigate, click, type, etc.)
   */
  action: string;
  
  /**
   * Target element or URL
   */
  target: string;
  
  /**
   * Optional value to use with the action
   */
  value?: string;
};

/**
 * Test case structure
 */
export interface Test {
  /**
   * Test name
   */
  name: string;
  
  /**
   * Test description
   */
  description: string;
  
  /**
   * Paths to test
   */
  paths: string[];
  
  /**
   * Test steps to execute
   */
  steps: TestStep[];
}

/**
 * Test suite structure
 */
export interface TestSuite {
  /**
   * Suite name
   */
  name: string;
  
  /**
   * Array of tests in this suite
   */
  tests: Test[];
}

/**
 * Run tests according to the provided configuration
 * @param config Test runner configuration
 * @returns Test results
 */
export async function runTests(config: RunnerConfig): Promise<TestResults> {
  // Default results structure
  const results: TestResults = {
    success: true,
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    coverage: 0,
    findings: []
  };
  
  // Load test suites
  const suites = await loadTestSuites(config.suite);
  if (!suites.length) {
    console.error(`No test suites found for "${config.suite}"`);
    return { ...results, success: false };
  }
  
  // Track findings to be reported
  const findings: {
    id: number;
    description: string;
    severity: BounceFindingSeverity;
    area: string;
    browser: string;
  }[] = [];
  
  // Calculate total tests
  const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
  results.total = totalTests;
  
  // Run tests for each browser
  for (const browserName of config.browsers) {
    console.log(`\nRunning tests with browser: ${browserName}`);
    
    let browser: Browser | null = null;
    
    try {
      // Launch browser
      browser = await launchBrowser(browserName, config.headless);
      
      // Execute test suites
      for (const suite of suites) {
        console.log(`\nExecuting test suite: ${suite.name}`);
        
        // Execute each test in the suite
        for (const test of suite.tests) {
          const testSucceeded = await executeTest(browser, test, config, findings);
          
          if (testSucceeded) {
            results.passed++;
          } else {
            results.failed++;
            if (config.verbose) {
              console.log(`  ❌ Test failed: ${test.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error running tests with ${browserName}: ${(error as Error).message}`);
      results.failed++;
      results.success = false;
    } finally {
      // Close browser
      if (browser) {
        await browser.close();
      }
    }
  }
  
  // Update results with findings
  results.findings = findings;
  results.coverage = calculateCoverage(suites, results.passed, results.total);
  results.success = results.failed === 0;
  
  return results;
}

/**
 * Load test suites from the file system
 * @param suiteName Suite name to load, or "all" for all suites
 * @returns Array of test suites
 */
async function loadTestSuites(suiteName: string): Promise<TestSuite[]> {
  const suitesDir = path.join(process.cwd(), 'bounce', 'tests');
  
  // Ensure the directory exists
  if (!fs.existsSync(suitesDir)) {
    console.warn(`Tests directory not found: ${suitesDir}`);
    return [];
  }
  
  // Get all JSON files in the directory
  const files = fs.readdirSync(suitesDir)
    .filter(file => file.endsWith('.json'));
  
  const suites: TestSuite[] = [];
  
  // Load each suite
  for (const file of files) {
    const filePath = path.join(suitesDir, file);
    try {
      const suiteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // If a specific suite was requested, only load that one
      if (suiteName !== 'all' && suiteData.name !== suiteName) {
        continue;
      }
      
      suites.push(suiteData);
    } catch (error) {
      console.error(`Error loading test suite from ${filePath}: ${(error as Error).message}`);
    }
  }
  
  return suites;
}

/**
 * Launch a browser instance
 * @param browserName Browser name (chrome, firefox, webkit)
 * @param headless Whether to run in headless mode
 * @returns Browser instance
 */
async function launchBrowser(browserName: string, headless: boolean): Promise<Browser> {
  const options = { headless };
  
  switch (browserName.toLowerCase()) {
    case 'firefox':
      return await firefox.launch(options);
    case 'webkit':
    case 'safari':
      return await webkit.launch(options);
    case 'chrome':
    case 'chromium':
    default:
      return await chromium.launch(options);
  }
}

/**
 * Execute a single test
 * @param browser Browser instance
 * @param test Test to execute
 * @param config Runner configuration
 * @param findings Array to collect findings
 * @returns Whether the test succeeded
 */
async function executeTest(
  browser: Browser,
  test: Test,
  config: RunnerConfig,
  findings: any[]
): Promise<boolean> {
  console.log(`  🧪 Running test: ${test.name}`);
  
  let success = true;
  const page = await browser.newPage();
  
  try {
    // Execute each step in the test
    for (const step of test.steps) {
      const stepSuccess = await executeTestStep(page, step, config);
      if (!stepSuccess) {
        success = false;
        
        // Report finding
        const findingId = await reportFinding(
          `Failed step: ${step.action} ${step.target}${step.value ? ` with value "${step.value}"` : ''}`,
          BounceFindingSeverity.HIGH,
          page,
          test.name,
          config,
          browser.browserType().name()
        );
        
        if (findingId) {
          findings.push({
            id: findingId,
            description: `Test '${test.name}' failed on step: ${step.action}`,
            severity: BounceFindingSeverity.HIGH,
            area: test.name,
            browser: browser.browserType().name()
          });
        }
        
        break;
      }
    }
    
    if (success && config.verbose) {
      console.log(`  ✅ Test passed: ${test.name}`);
    }
  } catch (error) {
    console.error(`  ❌ Error executing test ${test.name}: ${(error as Error).message}`);
    success = false;
    
    // Report finding for exception
    const findingId = await reportFinding(
      `Exception during test: ${(error as Error).message}`,
      BounceFindingSeverity.CRITICAL,
      page,
      test.name,
      config,
      browser.browserType().name()
    );
    
    if (findingId) {
      findings.push({
        id: findingId,
        description: `Exception in test '${test.name}': ${(error as Error).message}`,
        severity: BounceFindingSeverity.CRITICAL,
        area: test.name,
        browser: browser.browserType().name()
      });
    }
  } finally {
    await page.close();
  }
  
  return success;
}

/**
 * Execute a single test step
 * @param page Browser page
 * @param step Test step to execute
 * @param config Runner configuration
 * @returns Whether the step succeeded
 */
async function executeTestStep(
  page: Page,
  step: TestStep,
  config: RunnerConfig
): Promise<boolean> {
  try {
    switch (step.action) {
      case 'navigate':
        await page.goto(step.target.startsWith('http') ? step.target : `http://localhost:3000${step.target}`);
        await page.waitForLoadState('networkidle');
        return true;
      
      case 'click':
        await page.click(step.target);
        return true;
      
      case 'type':
        if (step.value) {
          await page.fill(step.target, step.value);
          return true;
        }
        return false;
      
      case 'assertElementExists':
        return await page.$(step.target) !== null;
      
      case 'assertElementCount':
        if (step.value) {
          const elements = await page.$$(step.target);
          return elements.length === parseInt(step.value);
        }
        return false;
        
      case 'assertText':
        if (step.value) {
          const textContent = await page.textContent(step.target);
          return textContent?.includes(step.value) || false;
        }
        return false;
      
      case 'wait':
        await page.waitForTimeout(step.value ? parseInt(step.value) : 1000);
        return true;
      
      default:
        console.warn(`Unknown test step action: ${step.action}`);
        return false;
    }
  } catch (error) {
    console.error(`Error executing step ${step.action}: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Report a finding through the non-destructive tester
 * @param description Finding description
 * @param severity Finding severity
 * @param page Browser page
 * @param area Test area
 * @param config Runner configuration
 * @param browser Browser name
 * @returns Finding ID
 */
async function reportFinding(
  description: string,
  severity: BounceFindingSeverity,
  page: Page,
  area: string,
  config: RunnerConfig,
  browser: string
): Promise<number> {
  try {
    // Take a screenshot for evidence
    const screenshot = await page.screenshot();
    
    // Capture console logs (if available)
    const consoleLogs = await page.evaluate(() => {
      return JSON.stringify(
        (window as any).consoleLogs || 
        ["No console logs captured"]
      );
    });
    
    // Report the finding with evidence
    return await nonDestructiveTester.reportFinding(
      description,
      severity,
      {
        area,
        browser,
        path: page.url(),
        isModifying: false
      },
      [
        {
          type: "SCREENSHOT",
          data: screenshot,
          description: "Screenshot at time of failure"
        },
        {
          type: "CONSOLE",
          data: consoleLogs,
          description: "Console logs"
        }
      ]
    );
  } catch (error) {
    console.error(`Error reporting finding: ${(error as Error).message}`);
    return 0;
  }
}

/**
 * Calculate test coverage percentage
 * @param suites Test suites
 * @param passed Number of passing tests
 * @param total Total number of tests
 * @returns Coverage percentage (0-100)
 */
function calculateCoverage(suites: TestSuite[], passed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  
  // Basic coverage calculation based on passed tests
  return Math.round((passed / total) * 100);
}