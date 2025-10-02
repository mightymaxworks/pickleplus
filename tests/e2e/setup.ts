/**
 * E2E Test Setup
 * Puppeteer configuration and test utilities
 */
import puppeteer, { Browser, Page } from 'puppeteer';

export interface TestUser {
  username: string;
  password: string;
  email: string;
  displayName: string;
}

export const TEST_USERS = {
  player1: {
    username: 'e2e_player1',
    password: 'TestPass123!',
    email: 'player1@e2etest.com',
    displayName: 'E2E Player 1'
  },
  player2: {
    username: 'e2e_player2',
    password: 'TestPass123!',
    email: 'player2@e2etest.com',
    displayName: 'E2E Player 2'
  }
};

export const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
export const TIMEOUT = 30000;

export async function setupBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
  
  // Wait for redirect to dashboard
  await page.waitForNavigation({ timeout: TIMEOUT });
}

export async function register(page: Page, user: TestUser): Promise<void> {
  await page.goto(`${BASE_URL}/register`);
  await page.waitForSelector('[data-testid="input-username"]', { timeout: TIMEOUT });
  
  await page.type('[data-testid="input-username"]', user.username);
  await page.type('[data-testid="input-email"]', user.email);
  await page.type('[data-testid="input-displayName"]', user.displayName);
  await page.type('[data-testid="input-password"]', user.password);
  await page.type('[data-testid="input-confirmPassword"]', user.password);
  
  await page.click('[data-testid="button-register"]');
  
  // Wait for redirect
  await page.waitForNavigation({ timeout: TIMEOUT });
}

export async function logout(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/logout`);
  await page.waitForNavigation({ timeout: TIMEOUT });
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

export async function cleanupTestUsers(): Promise<void> {
  // TODO: Add API call to clean up test users
  // This should be implemented in the backend
}
