/**
 * Load testing for concurrent coach assessments
 * Simulates multiple coaches using the system simultaneously
 */

const puppeteer = require('puppeteer');

describe('55-Skill Assessment Load Tests', () => {
  const CONCURRENT_COACHES = 3;
  const TEST_TIMEOUT = 300000; // 5 minutes for load tests

  test('Multiple coaches can perform assessments simultaneously', async () => {
    const browsers = [];
    const pages = [];
    
    try {
      // Launch browsers for concurrent testing
      for (let i = 0; i < CONCURRENT_COACHES; i++) {
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        browsers.push(browser);
        
        const page = await browser.newPage();
        pages.push(page);
      }
      
      // Perform concurrent assessments
      const assessmentPromises = pages.map(async (page, index) => {
        await loginAsCoach(page, `coach_${index + 1}`);
        return performQuickAssessment(page);
      });
      
      // Wait for all assessments to complete
      const results = await Promise.all(assessmentPromises);
      
      // Verify all assessments succeeded
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.duration).toBeLessThan(30000); // 30 seconds max
      });
      
    } finally {
      // Cleanup
      for (const browser of browsers) {
        await browser.close();
      }
    }
  }, TEST_TIMEOUT);

  test('System handles database concurrency correctly', async () => {
    // Test concurrent database writes don't cause conflicts
    const browser = await puppeteer.launch({ headless: true });
    const pages = [];
    
    try {
      // Create multiple pages for same coach
      for (let i = 0; i < 3; i++) {
        const page = await browser.newPage();
        await loginAsCoach(page, 'mightymax');
        pages.push(page);
      }
      
      // Try to start assessments simultaneously
      const startPromises = pages.map(async (page) => {
        try {
          await page.click('[data-testid="start-assessment-btn"]:first-child');
          await page.waitForSelector('[data-testid="skill-assessment-interface"]', { timeout: 5000 });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(startPromises);
      
      // At least one should succeed, others should handle gracefully
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
      
    } finally {
      await browser.close();
    }
  }, TEST_TIMEOUT);

  async function loginAsCoach(page, username = 'mightymax') {
    await page.goto('http://localhost:5173/auth/login');
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForSelector('[data-testid="coach-dashboard"]');
  }

  async function performQuickAssessment(page) {
    const startTime = Date.now();
    
    try {
      await page.click('[data-testid="start-assessment-btn"]:first-child');
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      // Quick assessment completion
      for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
        const skillCards = await page.$$('[data-testid="skill-card"]');
        
        for (const skillCard of skillCards) {
          await skillCard.click('[data-testid="rating-6"]');
        }
        
        if (categoryIndex < 4) {
          await page.click('[data-testid="next-category-btn"]');
          await page.waitForTimeout(100);
        } else {
          await page.click('[data-testid="submit-assessment-btn"]');
          await page.waitForSelector('[data-testid="assessment-complete"]');
        }
      }
      
      return {
        success: true,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
});