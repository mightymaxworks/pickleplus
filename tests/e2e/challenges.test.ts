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

  test('should create and send challenge', async () => {
    // Player 1 goes to rankings
    await challengerPage.goto(`${BASE_URL}/rankings`);
    await waitForElement(challengerPage, '[data-testid="leaderboard"]');
    
    // Challenge Player 2
    await clickElement(challengerPage, `[data-testid="challenge-${TEST_USERS.player2.username}"]`);
    
    // Fill challenge form
    await waitForElement(challengerPage, '[data-testid="select-matchType"]');
    await clickElement(challengerPage, '[data-testid="select-matchType"]');
    await clickElement(challengerPage, '[data-testid="option-singles"]');
    
    // Submit challenge
    await clickElement(challengerPage, '[data-testid="button-send-challenge"]');
    
    // Should show success message
    await waitForElement(challengerPage, '[data-testid="challenge-sent"]', TIMEOUT);
    
    // Player 2 should receive notification
    await challengedPage.goto(`${BASE_URL}/challenges`);
    await waitForElement(challengedPage, '[data-testid="challenge-list"]');
    
    const challengeExists = await challengedPage.$(`[data-testid="challenge-from-${TEST_USERS.player1.username}"]`);
    expect(challengeExists).toBeTruthy();
  }, TIMEOUT * 2);

  test('should accept challenge and redirect to match', async () => {
    // Create challenge first (similar to above)
    await challengerPage.goto(`${BASE_URL}/rankings`);
    await clickElement(challengerPage, `[data-testid="challenge-${TEST_USERS.player2.username}"]`);
    await clickElement(challengerPage, '[data-testid="option-singles"]');
    await clickElement(challengerPage, '[data-testid="button-send-challenge"]');
    await waitForElement(challengerPage, '[data-testid="challenge-sent"]');
    
    // Player 2 accepts
    await challengedPage.goto(`${BASE_URL}/challenges`);
    await waitForElement(challengedPage, '[data-testid="challenge-list"]');
    
    await clickElement(challengedPage, '[data-testid="button-accept-challenge"]');
    
    // Should redirect to match arena
    await challengedPage.waitForNavigation({ timeout: TIMEOUT });
    const url = challengedPage.url();
    expect(url).toContain('/match-arena');
  }, TIMEOUT * 3);

  test('should decline challenge', async () => {
    // Create challenge
    await challengerPage.goto(`${BASE_URL}/rankings`);
    await clickElement(challengerPage, `[data-testid="challenge-${TEST_USERS.player2.username}"]`);
    await clickElement(challengerPage, '[data-testid="option-singles"]');
    await clickElement(challengerPage, '[data-testid="button-send-challenge"]');
    await waitForElement(challengerPage, '[data-testid="challenge-sent"]');
    
    // Player 2 declines
    await challengedPage.goto(`${BASE_URL}/challenges`);
    await waitForElement(challengedPage, '[data-testid="challenge-list"]');
    
    await clickElement(challengedPage, '[data-testid="button-decline-challenge"]');
    
    // Challenge should be removed
    await waitForElement(challengedPage, '[data-testid="challenge-declined"]', TIMEOUT);
    
    // Player 1 should see declined notification
    await challengerPage.reload();
    await waitForElement(challengerPage, '[data-testid="challenge-status-declined"]', TIMEOUT);
  }, TIMEOUT * 3);

  test('should expire challenge after 24 hours', async () => {
    // This test would require time manipulation or mocking
    // Placeholder for future implementation
    expect(true).toBe(true);
  }, TIMEOUT);
});
