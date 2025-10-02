/**
 * E2E Test Setup
 * Puppeteer configuration and test utilities
 */
import puppeteer, { Browser, Page } from 'puppeteer';

export interface TestUser {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  yearOfBirth: number;
  gender: 'male' | 'female';
  displayName?: string;
}

export const TEST_USERS = {
  player1: {
    username: 'e2e_player1',
    password: 'TestPass123!',
    email: 'player1@e2etest.com',
    firstName: 'Test',
    lastName: 'Player1',
    yearOfBirth: 1990,
    gender: 'male' as const,
    displayName: 'E2E Player 1'
  },
  player2: {
    username: 'e2e_player2',
    password: 'TestPass123!',
    email: 'player2@e2etest.com',
    firstName: 'Test',
    lastName: 'Player2',
    yearOfBirth: 1992,
    gender: 'female' as const,
    displayName: 'E2E Player 2'
  }
};

export const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
export const TIMEOUT = 30000;

export async function setupBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,720',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--single-process'
    ],
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
  });
}

export async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  // Listen for console logs (helpful for debugging)
  page.on('console', msg => {
    if (process.env.DEBUG_CONSOLE === 'true') {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  return page;
}

export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('[data-testid="input-username"]', { timeout: TIMEOUT });
  
  await page.type('[data-testid="input-username"]', user.username);
  await page.type('[data-testid="input-password"]', user.password);
  await page.click('[data-testid="button-login"]');
  
  // Wait for URL to change (React Router SPA navigation)
  await page.waitForFunction(
    (loginUrl) => !window.location.href.includes(loginUrl),
    { timeout: TIMEOUT },
    '/login'
  );
}

export async function register(page: Page, user: TestUser): Promise<void> {
  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('[data-testid="input-firstName"]', { timeout: TIMEOUT });
  
  // Fill in all required fields
  await page.type('[data-testid="input-firstName"]', user.firstName);
  await page.type('[data-testid="input-lastName"]', user.lastName);
  await page.type('[data-testid="input-email"]', user.email);
  await page.type('[data-testid="input-password"]', user.password);
  await page.type('[data-testid="input-confirmPassword"]', user.password);
  await page.type('[data-testid="input-yearOfBirth"]', user.yearOfBirth.toString());
  
  // Select gender
  await page.click('[data-testid="select-gender"]');
  await page.click(`[data-testid="select-gender-${user.gender}"]`);
  
  // Agree to terms
  await page.click('[data-testid="checkbox-agreeToTerms"]');
  
  await page.click('[data-testid="button-register"]');
  
  // Wait for URL to change (React Router SPA navigation)
  await page.waitForFunction(
    (registerUrl) => !window.location.href.includes(registerUrl),
    { timeout: TIMEOUT },
    '/register'
  );
}

export async function logout(page: Page): Promise<void> {
  const currentUrl = page.url();
  await page.goto(`${BASE_URL}/logout`);
  
  // Wait for URL to change to login page (React Router SPA navigation)
  await page.waitForFunction(
    (prevUrl) => window.location.href !== prevUrl && window.location.href.includes('/login'),
    { timeout: TIMEOUT },
    currentUrl
  );
}

export async function waitForElement(
  page: Page, 
  selector: string, 
  timeout: number = TIMEOUT
): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

export async function clickElement(
  page: Page, 
  selector: string
): Promise<void> {
  await page.waitForSelector(selector, { timeout: TIMEOUT });
  await page.click(selector);
}

export async function typeInElement(
  page: Page, 
  selector: string, 
  text: string
): Promise<void> {
  await page.waitForSelector(selector, { timeout: TIMEOUT });
  await page.type(selector, text);
}

export async function screenshot(
  page: Page, 
  name: string
): Promise<void> {
  if (process.env.SCREENSHOTS === 'true') {
    await page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true
    });
  }
}

export async function createTestUser(user: TestUser): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      password: user.password,
      gender: user.gender,
      dateOfBirth: `${user.yearOfBirth}-01-01`
    })
  });
  
  if (!response.ok && response.status !== 409) { // 409 = already exists
    throw new Error(`Failed to create test user: ${await response.text()}`);
  }
}

export async function cleanupTestUsers(): Promise<void> {
  // Test users will be cleaned up manually or via database truncate
  // In production tests, implement DELETE /api/test/users/:username endpoint
  console.log('Test users should be cleaned up via database truncate');
}

export async function setupTestData(): Promise<void> {
  // Create test users before running tests
  try {
    await createTestUser(TEST_USERS.player1);
    await createTestUser(TEST_USERS.player2);
  } catch (error) {
    console.log('Test users may already exist:', error);
  }
}
