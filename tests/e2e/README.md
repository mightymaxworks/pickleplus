# E2E Test Suite - Pickle+ Next-Gen Platform

Comprehensive end-to-end testing using Puppeteer for critical user flows.

## Test Coverage

### 1. Authentication Flow (`auth.test.ts`)
- User registration
- User login
- Invalid credentials handling
- Logout functionality

### 2. Match Certification (`match-certification.test.ts`)
- Match recording
- Multi-player certification workflow
- Points awarding after full certification
- Pending status handling

### 3. Challenge System (`challenges.test.ts`)
- Challenge creation and sending
- Challenge acceptance
- Challenge decline
- Real-time notifications

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Puppeteer (already installed)

### Required package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "jest --config tests/e2e/jest.config.js",
    "test:e2e:watch": "jest --config tests/e2e/jest.config.js --watch",
    "test:e2e:debug": "HEADLESS=false SLOW_MO=100 DEBUG_CONSOLE=true jest --config tests/e2e/jest.config.js"
  }
}
```

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:e2e:watch

# Run tests with visible browser (debugging)
npm run test:e2e:debug

# Run specific test file
jest --config tests/e2e/jest.config.js auth.test.ts
```

### Environment Variables

- `TEST_URL` - Base URL for testing (default: http://localhost:5000)
- `HEADLESS` - Run browser in headless mode (default: true)
- `SLOW_MO` - Slow down Puppeteer operations (ms)
- `DEBUG_CONSOLE` - Show browser console logs
- `SCREENSHOTS` - Save screenshots on test completion

Example:
```bash
TEST_URL=http://localhost:3000 HEADLESS=false npm run test:e2e
```

## GitHub Actions CI/CD

The test suite automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

See `.github/workflows/e2e-tests.yml` for configuration.

### CI Features
- PostgreSQL service container
- Automated database setup
- Screenshot upload on failure
- Test results artifacts

## Test Data

Test users are defined in `setup.ts`:
- `e2e_player1` - First test player
- `e2e_player2` - Second test player

**Note:** Test users should be cleaned up after test runs.

## Debugging

### Local Debugging

Run tests with visible browser:
```bash
npm run test:e2e:debug
```

### Screenshot Artifacts

Screenshots are saved to `tests/screenshots/` when:
- Tests fail
- `SCREENSHOTS=true` environment variable is set

### Browser Console Logs

Enable console logging:
```bash
DEBUG_CONSOLE=true npm run test:e2e
```

## Writing New Tests

### Test Structure

```typescript
import { Browser, Page } from 'puppeteer';
import { setupBrowser, setupPage, login, TEST_USERS } from './setup';

describe('Feature Name', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await setupBrowser();
  });

  beforeEach(async () => {
    page = await setupPage(browser);
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should do something', async () => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use data-testid attributes**: All interactive elements should have `data-testid` for reliable selection
2. **Wait for elements**: Always use `waitForSelector` before interacting
3. **Clean up**: Close pages and browser in teardown
4. **Screenshots**: Take screenshots for debugging failed tests
5. **Timeouts**: Set appropriate timeouts for async operations

### Helper Functions

Available in `setup.ts`:
- `setupBrowser()` - Initialize Puppeteer browser
- `setupPage()` - Create new page with viewport
- `login(page, user)` - Login with test user
- `register(page, user)` - Register new user
- `logout(page)` - Logout current user
- `waitForElement(page, selector)` - Wait for element
- `clickElement(page, selector)` - Click element
- `screenshot(page, name)` - Save screenshot

## Maintenance

### Adding New Test Users

Edit `setup.ts` and add to `TEST_USERS` object:

```typescript
export const TEST_USERS = {
  player1: { ... },
  newPlayer: {
    username: 'e2e_newplayer',
    password: 'TestPass123!',
    email: 'newplayer@e2etest.com',
    displayName: 'New Player'
  }
};
```

### Cleaning Up Test Data

Implement cleanup in `setup.ts`:

```typescript
export async function cleanupTestUsers(): Promise<void> {
  // Call API endpoint to remove test users
  // DELETE /api/test/cleanup
}
```

## Troubleshooting

### Common Issues

**Tests fail with "Element not found"**
- Check that `data-testid` attributes are correctly set
- Increase timeout values
- Run with `HEADLESS=false` to visually debug

**Database connection errors**
- Verify `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running
- Run `npm run db:push` to sync schema

**Timeout errors**
- Increase `TIMEOUT` in setup.ts
- Check server is running on correct port
- Verify network connectivity

**Screenshots not saving**
- Ensure `tests/screenshots/` directory exists
- Set `SCREENSHOTS=true` environment variable

## Performance

### Test Execution Time
- Full suite: ~5-10 minutes
- Individual test: ~30-60 seconds

### Optimization Tips
- Run tests in parallel (Jest workers)
- Use headless mode for faster execution
- Reuse browser instances when possible
- Mock external API calls

## Future Improvements

- [ ] Add visual regression testing
- [ ] Implement test data factories
- [ ] Add API-level test cleanup
- [ ] Mobile viewport testing
- [ ] Accessibility testing (axe-core)
- [ ] Performance metrics collection
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Parallel test execution
