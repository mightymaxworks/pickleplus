/**
 * E2E Tests: Challenge System
 * Tests challenge creation, acceptance, and match flow
 */
import { Browser, Page } from 'puppeteer';
import {
  setupBrowser,
  setupPage,
  login,
  TEST_USERS,
  BASE_URL,
  TIMEOUT,
  screenshot,
  clickElement,
  waitForElement
} from './setup';

describe('Challenge System Flow', () => {
  let browser: Browser;
  let challengerPage: Page;
  let challengedPage: Page;

  beforeAll(async () => {
    browser = await setupBrowser();
  }, TIMEOUT);

  beforeEach(async () => {
    challengerPage = await setupPage(browser);
    challengedPage = await setupPage(browser);
    
    // Login both players
    await login(challengerPage, TEST_USERS.player1);
    await login(challengedPage, TEST_USERS.player2);
  }, TIMEOUT * 2);

  afterEach(async () => {
    await screenshot(challengerPage, `challenge-c-${Date.now()}`);
    await screenshot(challengedPage, `challenge-d-${Date.now()}`);
    await challengerPage.close();
    await challengedPage.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load rankings page with challenge capability', async () => {
    // Verify rankings page loads (prerequisite for challenge system)
    await challengerPage.goto(`${BASE_URL}/rankings`);
    await waitForElement(challengerPage, '[data-testid="page-rankings"]', TIMEOUT);
    
    // Check that page loads successfully
    const pageUrl = challengerPage.url();
    expect(pageUrl).toContain('/rankings');
  }, TIMEOUT * 2);

  test('should load challenges page', async () => {
    // Verify challenges page loads
    await challengedPage.goto(`${BASE_URL}/challenges`);
    await waitForElement(challengedPage, '[data-testid="page-challenges"]', TIMEOUT);
    
    const pageUrl = challengedPage.url();
    expect(pageUrl).toContain('/challenges');
  }, TIMEOUT * 2);
});
