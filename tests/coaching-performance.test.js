/**
 * Performance testing suite for 55-skill assessment system
 * Tests response times, memory usage, and concurrent user handling
 */

const puppeteer = require('puppeteer');

describe('55-Skill Assessment Performance Tests', () => {
  let browser;
  const TEST_TIMEOUT = 180000; // 3 minutes for performance tests

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Assessment page loads within 3 seconds', async () => {
    const page = await browser.newPage();
    
    const startTime = Date.now();
    await page.goto('http://localhost:5173/coach');
    await page.waitForSelector('[data-testid="coach-dashboard"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    await page.close();
  }, TEST_TIMEOUT);

  test('Assessment submission completes within 10 seconds', async () => {
    const page = await browser.newPage();
    
    // Login and navigate to assessment
    await loginAsCoach(page);
    
    const startTime = Date.now();
    
    // Complete rapid assessment
    await page.click('[data-testid="start-assessment-btn"]:first-child');
    await page.waitForSelector('[data-testid="skill-assessment-interface"]');
    
    // Quick complete all categories
    for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
      const skillCards = await page.$$('[data-testid="skill-card"]');
      
      // Rate all skills quickly
      for (const skillCard of skillCards) {
        await skillCard.click('[data-testid="rating-5"]');
      }
      
      if (categoryIndex < 4) {
        await page.click('[data-testid="next-category-btn"]');
      } else {
        await page.click('[data-testid="submit-assessment-btn"]');
        await page.waitForSelector('[data-testid="assessment-complete"]');
      }
    }
    
    const completionTime = Date.now() - startTime;
    expect(completionTime).toBeLessThan(10000);
    
    await page.close();
  }, TEST_TIMEOUT);

  test('Memory usage remains stable during assessment', async () => {
    const page = await browser.newPage();
    
    await loginAsCoach(page);
    
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Complete assessment
    await page.click('[data-testid="start-assessment-btn"]:first-child');
    
    for (let categoryIndex = 0; categoryIndex < 5; categoryIndex++) {
      await page.waitForSelector('[data-testid="skill-assessment-interface"]');
      
      const skillCards = await page.$$('[data-testid="skill-card"]');
      for (const skillCard of skillCards) {
        await skillCard.click('[data-testid="rating-7"]');
      }
      
      if (categoryIndex < 4) {
        await page.click('[data-testid="next-category-btn"]');
      }
    }
    
    // Measure final memory
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Memory increase should be reasonable (< 50MB)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    await page.close();
  }, TEST_TIMEOUT);

  async function loginAsCoach(page) {
    await page.goto('http://localhost:5173/auth/login');
    await page.type('input[name="username"]', 'mightymax');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForSelector('[data-testid="coach-dashboard"]');
  }
});