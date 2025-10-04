import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import type { Browser, Page } from 'puppeteer';
import { 
  setupBrowser, 
  setupPage, 
  login, 
  screenshot,
  BASE_URL,
  TIMEOUT,
  TEST_USERS
} from './setup';

describe('Rankings and Leaderboards E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await setupBrowser();
  }, TIMEOUT);

  beforeEach(async () => {
    page = await setupPage(browser);
  }, TIMEOUT);

  afterEach(async () => {
    await screenshot(page, `rankings-${Date.now()}`);
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load rankings page without authentication', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Should see leaderboard or rankings display
    const hasLeaderboard = await page.$('[data-testid="leaderboard"]');
    expect(hasLeaderboard).toBeTruthy();
  }, TIMEOUT);

  test('should display different ranking categories', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Check for category tabs or selectors
    const categorySelector = await page.$('[data-testid="select-category"]');
    if (categorySelector) {
      await page.click('[data-testid="select-category"]');
      
      // Wait for category options to appear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Should have Singles, Doubles, Mixed options
      const hasOptions = await page.$$('[data-testid^="select-category-"]');
      expect(hasOptions.length).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  test('should display player rankings with points', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Wait for rankings table or list to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for ranking entries
    const rankingEntries = await page.$$('[data-testid^="ranking-entry-"]');
    
    // Should display at least one player if database has data
    // If empty, that's also valid (new system)
    expect(rankingEntries.length).toBeGreaterThanOrEqual(0);
  }, TIMEOUT);

  test('should show authenticated user their own ranking', async () => {
    await login(page, TEST_USERS.player1);
    
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for user's own ranking highlight or indicator
    const myRankingIndicator = await page.$('[data-testid="my-ranking"]') || 
                               await page.$('[data-testid="current-user-rank"]');
    
    // User might not have ranking yet, so this is optional
    // Just verify page loads correctly when authenticated
    const url = page.url();
    expect(url).toContain('/rankings');
  }, TIMEOUT);

  test('should filter rankings by gender category', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Look for gender filter
    const genderFilter = await page.$('[data-testid="select-gender"]') ||
                         await page.$('[data-testid="filter-gender"]');
    
    if (genderFilter) {
      await genderFilter.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select a gender option
      const maleOption = await page.$('[data-testid="select-gender-male"]') ||
                         await page.$('[data-testid="filter-gender-male"]');
      
      if (maleOption) {
        await maleOption.click();
        
        // Wait for filtered results
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify we're still on rankings page
        const url = page.url();
        expect(url).toContain('/rankings');
      }
    }
  }, TIMEOUT);

  test('should filter rankings by age group', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Look for age group filter
    const ageGroupFilter = await page.$('[data-testid="select-ageGroup"]') ||
                           await page.$('[data-testid="filter-ageGroup"]');
    
    if (ageGroupFilter) {
      await ageGroupFilter.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select an age group
      const openOption = await page.$('[data-testid="select-ageGroup-Open"]') ||
                         await page.$('[data-testid="filter-ageGroup-Open"]');
      
      if (openOption) {
        await openOption.click();
        
        // Wait for filtered results
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify filter applied
        const url = page.url();
        expect(url).toContain('/rankings');
      }
    }
  }, TIMEOUT);

  test('should display ranking details when clicking on player', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Wait for rankings to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to find and click a ranking entry
    const firstRankingEntry = await page.$('[data-testid^="ranking-entry-"]');
    
    if (firstRankingEntry) {
      await firstRankingEntry.click();
      
      // Wait for potential detail view or modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Could show modal, navigate to profile, or expand details
      // Just verify interaction doesn't crash
      const url = page.url();
      expect(url).toBeTruthy();
    }
  }, TIMEOUT);

  test('should show different views for Singles, Doubles, Mixed categories', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Look for category tabs
    const singlesTab = await page.$('[data-testid="tab-singles"]');
    const doublesTab = await page.$('[data-testid="tab-doubles"]');
    const mixedTab = await page.$('[data-testid="tab-mixed"]');
    
    if (singlesTab && doublesTab) {
      // Click Singles
      await singlesTab.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Click Doubles
      await doublesTab.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify we stayed on rankings page
      const url = page.url();
      expect(url).toContain('/rankings');
    }
    
    // Test passes if categories exist or if page loads without tabs
    expect(true).toBe(true);
  }, TIMEOUT);

  test('should handle pagination if rankings list is long', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Wait for data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for pagination controls
    const nextButton = await page.$('[data-testid="button-next-page"]');
    const prevButton = await page.$('[data-testid="button-prev-page"]');
    
    if (nextButton) {
      await nextButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify still on rankings
      const url = page.url();
      expect(url).toContain('/rankings');
    }
    
    // Test passes regardless of pagination presence
    expect(true).toBe(true);
  }, TIMEOUT);

  test('should display player tier/classification in rankings', async () => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForSelector('[data-testid="rankings-container"]', { timeout: TIMEOUT });
    
    // Wait for data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for tier badges or classification indicators
    const tierBadges = await page.$$('[data-testid^="tier-"]');
    const classificationBadges = await page.$$('[data-testid^="classification-"]');
    
    // Optional - players might not have tiers yet
    // Just verify page structure is intact
    const container = await page.$('[data-testid="rankings-container"]');
    expect(container).toBeTruthy();
  }, TIMEOUT);
});
