# Test Execution Instructions

Complete instructions for running the E2E test suite for the Random Act of Kindness application.

## Prerequisites

### 1. Environment Setup

Ensure you have the following installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check Yarn version  
yarn --version

# Verify project dependencies are installed
yarn install
```

### 2. Development Server

**CRITICAL**: The development server must be running before executing E2E tests.

```bash
# Start the development server (required for E2E tests)
yarn dev

# Verify the server is running by visiting:
# http://localhost:3001
```

The server should display the Random Act of Kindness application homepage.

### 3. Playwright Setup

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Verify Playwright installation
npx playwright --version
```

## Running E2E Tests

### Quick Start

```bash
# 1. Start development server (in terminal 1)
yarn dev

# 2. Run E2E tests (in terminal 2)
yarn test:e2e
```

### Test Commands Reference

```bash
# Run all E2E tests
yarn test:e2e

# Run tests with visual UI interface
yarn test:e2e:ui

# Run tests in headed mode (visible browser)
yarn test:e2e:headed

# Debug specific tests step-by-step
yarn test:e2e:debug

# Run specific test file
yarn test:e2e user-onboarding.spec.ts

# Run specific test by name
yarn test:e2e --grep "should display wallet connection flow"

# Run on specific browser
yarn test:e2e --project=chromium
yarn test:e2e --project=firefox
yarn test:e2e --project=webkit

# Run with custom timeout
yarn test:e2e --timeout=60000

# Generate and view test report
yarn test:e2e:report
```

### Test Suites

The E2E test suite includes three main test files:

1. **User Onboarding Flow** (`user-onboarding.spec.ts`)
   - Wallet connection flow
   - Name setting and validation  
   - First-time user experience
   - Returning user recognition

2. **Main User Flows** (`main-user-flows.spec.ts`)
   - Main application interface
   - Give/Receive kindness modals
   - Responsive design testing
   - Navigation and interactions

3. **Error Handling** (`error-handling.spec.ts`)
   - Network failure scenarios
   - Browser extension conflicts
   - Transaction error recovery
   - Edge cases and resilience

4. **Basic Smoke Tests** (`basic-smoke.spec.ts`)
   - Simple application load verification
   - Basic functionality checks

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Error: listen EADDRINUSE: address already in use :::3001"

**Solution**: The development server is already running. This is expected - just run tests without starting a new server.

```bash
# Don't start another server, just run tests
yarn test:e2e
```

#### Issue: Tests timeout or elements not found

**Possible Causes & Solutions**:

1. **Development server not running**:
   ```bash
   # Start the server first
   yarn dev
   ```

2. **App not fully loaded**:
   ```bash
   # Run with longer timeout
   yarn test:e2e --timeout=60000
   ```

3. **Hydration issues**:
   ```bash
   # Run specific browser for debugging
   yarn test:e2e:headed --project=chromium
   ```

#### Issue: "localStorage access denied" errors

**Solution**: This is expected in some test scenarios. The tests include error handling for localStorage access issues.

#### Issue: Console errors about wallet extensions

**Solution**: These are filtered out as expected errors. The application handles multiple wallet extension conflicts gracefully.

### Debug Mode

For step-by-step debugging:

```bash
# Open Playwright UI for interactive debugging
yarn test:e2e:ui

# Run in headed mode to see browser interactions
yarn test:e2e:headed

# Debug specific test with breakpoints
yarn test:e2e:debug --grep "specific test name"
```

### Test Reports

After running tests, view detailed reports:

```bash
# Open HTML report
yarn test:e2e:report

# Or navigate to: http://localhost:9323
```

The reports include:
- Test results with pass/fail status
- Screenshots of failures
- Video recordings of test execution
- Detailed error traces

## Test Structure Overview

### Page Object Models

Tests use the Page Object Model pattern for maintainable code:

- `HomePage.ts`: Main application page interactions
- `UserNameInputModal.ts`: Name setting modal interactions

### Test Helpers

Common utilities in `testHelpers.ts`:

- `waitForPageLoad()`: Ensures complete page loading
- `clearAppState()`: Resets application state
- `mockWalletConnection()`: Simulates wallet connection
- `setupReturningUser()`: Creates returning user scenario
- `takeScreenshot()`: Captures test evidence

### Data-testid Attributes

The application includes test-specific attributes:

```html
<!-- Main actions -->
<button data-testid="give-kindness-button">Give Kindness</button>
<button data-testid="receive-kindness-button">Receive Kindness</button>

<!-- User flows -->
<div data-testid="wallet-connection-flow">...</div>
<div data-testid="onboarding-flow">...</div>
<div data-testid="welcome-message">...</div>

<!-- Form elements -->
<input data-testid="name-input" />
<button data-testid="submit-name-button">Submit</button>
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: yarn install
      
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
      
    - name: Build application
      run: yarn build
      
    - name: Run E2E tests
      run: yarn test:e2e
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## Test Development

### Adding New Tests

1. **Create test file** in the `e2e/` directory
2. **Import required page objects** and helpers
3. **Follow the existing patterns** for consistency
4. **Use data-testid attributes** for element selection
5. **Include error handling** and cleanup

Example test structure:

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Feature Name', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should perform expected behavior', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Stable Selectors**: Use `data-testid` over CSS classes
2. **Explicit Waits**: Wait for specific conditions, not fixed timeouts
3. **Error Handling**: Test both success and failure scenarios  
4. **Clean State**: Start each test with known state
5. **Documentation**: Include screenshots and clear descriptions

## Performance Considerations

### Execution Time

- **Full suite**: ~5-10 minutes (depending on system)
- **Single browser**: ~2-3 minutes
- **Parallel execution**: Enabled by default for faster runs

### Resource Usage

- **Memory**: Each browser instance uses ~100-200MB
- **Storage**: Test artifacts (videos, screenshots) can accumulate
- **Network**: Tests may generate significant localhost traffic

### Optimization Tips

```bash
# Run single browser for faster execution
yarn test:e2e --project=chromium

# Run specific test categories
yarn test:e2e user-onboarding.spec.ts

# Disable video recording for faster runs (in CI)
yarn test:e2e --video=retain-on-failure
```

## Maintenance

### Regular Tasks

1. **Update selectors** when UI changes
2. **Review test results** for flaky tests
3. **Update browser versions** regularly
4. **Clean up test artifacts** periodically

### Monitoring

Track these metrics for test health:

- **Execution time**: Should remain under 10 minutes
- **Flaky tests**: Target < 5% failure rate
- **Coverage**: Ensure new features have tests
- **Maintenance burden**: Minimize brittle selectors

## Support

### Getting Help

1. **Check test reports**: HTML reports provide detailed failure information
2. **Review screenshots/videos**: Visual evidence of test execution
3. **Console logs**: Check browser console for application errors
4. **Playwright documentation**: https://playwright.dev/docs/

### Common Resources

- **Playwright Test Generator**: `npx playwright codegen localhost:3001`
- **Playwright Inspector**: Built-in debugging tools
- **Visual comparison**: `yarn test:e2e --update-snapshots`

This comprehensive test suite ensures the Random Act of Kindness application works correctly across different browsers, devices, and user scenarios.