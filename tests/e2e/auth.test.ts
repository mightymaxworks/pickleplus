/**
 * E2E Tests: Authentication Flow
 * Tests registration, login, and logout workflows
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { Browser, Page } from 'puppeteer';
import {
  setupBrowser,
  setupPage,
  register,
  login,
  logout,
  TEST_USERS,
  BASE_URL,
  TIMEOUT,
  screenshot
} from './setup';

describe('Authentication Flow', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await setupBrowser();
  }, TIMEOUT);

  beforeEach(async () => {
    page = await setupPage(browser);
  }, TIMEOUT);

  afterEach(async () => {
    await screenshot(page, `auth-${Date.now()}`);
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load login page', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('[data-testid="input-username"]', { timeout: TIMEOUT });
    
    const title = await page.title();
    expect(title).toBeTruthy();
  }, TIMEOUT);

  test('should register new user successfully', async () => {
    const testUser = {
      ...TEST_USERS.player1,
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@e2etest.com`
    };

    await register(page, testUser);
    
    // Should redirect after successful registration
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: TIMEOUT }).catch(() => {});
    
    const url = page.url();
    // Should not be on register page anymore
    expect(url).not.toContain('/register');
  }, TIMEOUT);

  test('should login with existing credentials', async () => {
    await login(page, TEST_USERS.player1);
    
    // Should be redirected after login (could be dashboard or another page)
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: TIMEOUT }).catch(() => {});
    
    const url = page.url();
    // Should not be on login page anymore
    expect(url).not.toContain('/login');
  }, TIMEOUT);

  test('should reject invalid credentials', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('[data-testid="input-username"]', { timeout: TIMEOUT });
    
    await page.type('[data-testid="input-username"]', 'invaliduser');
    await page.type('[data-testid="input-password"]', 'wrongpassword');
    await page.click('[data-testid="button-login"]');
    
    // Wait for error - either via toast or error message
    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief wait for error to appear
    
    // Should still be on login page (not redirected)
    const url = page.url();
    expect(url).toContain('/login');
  }, TIMEOUT);

  test('should logout successfully', async () => {
    await login(page, TEST_USERS.player1);
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: TIMEOUT });
    
    await logout(page);
    
    // Should redirect to login page
    const url = page.url();
    expect(url).toContain('/login');
  }, TIMEOUT);
});
