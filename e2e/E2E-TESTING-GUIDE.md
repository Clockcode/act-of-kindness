# End-to-End Testing Guide

This guide covers the comprehensive E2E testing suite for the Random Act of Kindness application using Playwright.

## Overview

The E2E test suite covers the complete user journey from first visit to main application usage, including:

- **User Onboarding Flow**: Wallet connection → Name setting → Main app access
- **Main Application Features**: Give/Receive kindness actions, pool dashboard
- **Error Handling**: Network issues, wallet conflicts, validation errors
- **Cross-browser Compatibility**: Chromium, Firefox, WebKit
- **Responsive Design**: Desktop, tablet, mobile viewports

## Test Structure

### Directory Layout

```
e2e/
├── pages/                    # Page Object Models
│   ├── HomePage.ts          # Main application page
│   └── UserNameInputModal.ts # Name setting modal
├── utils/                   # Test utilities and helpers
│   └── testHelpers.ts       # Common test functions
├── fixtures/                # Test data and fixtures
├── user-onboarding.spec.ts  # User onboarding flow tests
├── main-user-flows.spec.ts  # Main application feature tests
└── error-handling.spec.ts   # Error scenarios and edge cases
```

### Page Object Pattern

The tests use the Page Object Model pattern for maintainable and reusable test code:

```typescript
// Example: HomePage class
export class HomePage {
  readonly page: Page;
  readonly giveKindnessButton: Locator;
  readonly receiveKindnessButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.giveKindnessButton = page.getByTestId('give-kindness-button');
    this.receiveKindnessButton = page.getByTestId('receive-kindness-button');
  }
  
  async clickGiveKindness() {
    await this.giveKindnessButton.click();
  }
}
```

## Test Categories

### 1. User Onboarding Flow Tests (`user-onboarding.spec.ts`)

Tests the complete first-time user experience:

- **Wallet Connection Flow**: Display and interaction with wallet connection UI
- **Name Setting Process**: Modal interactions, validation, transaction simulation
- **State Transitions**: Proper progression through onboarding steps
- **Error Handling**: Transaction failures, validation errors, network issues
- **State Persistence**: Maintaining state across page refreshes

**Key Test Cases:**
- `should display wallet connection flow for new users`
- `should complete full first-time user onboarding flow`
- `should handle name validation correctly`
- `should show returning user state correctly`

### 2. Main User Flows Tests (`main-user-flows.spec.ts`)

Tests the primary application functionality for authenticated users:

- **Main Interface**: Welcome message, action buttons, dashboard
- **Modal Interactions**: Opening/closing Give/Receive kindness modals
- **Responsive Design**: Testing across different screen sizes
- **Navigation**: Button interactions, keyboard navigation
- **State Management**: Proper state display and updates

**Key Test Cases:**
- `should display main application interface correctly`
- `should open Give Kindness modal when clicked`
- `should open Receive Kindness modal when clicked`
- `should maintain responsive design on different screen sizes`

### 3. Error Handling Tests (`error-handling.spec.ts`)

Tests application resilience and error recovery:

- **Network Issues**: Timeouts, failed requests, connection problems
- **Wallet Conflicts**: Multiple extension detection and handling
- **Transaction Failures**: User rejection, insufficient funds, network errors
- **Browser Compatibility**: Extension conflicts, localStorage access
- **Performance**: Memory leaks, rapid interactions, resource cleanup

**Key Test Cases:**
- `should handle wallet connection failures gracefully`
- `should handle browser extension conflicts`
- `should handle rapid user interactions`
- `should recover from JavaScript runtime errors`

## Test Data & Mocking

### Development Mode Testing

The application runs in development mode during testing, which provides:

- **Mock Blockchain Interactions**: Simulated transactions without real ETH
- **localStorage Persistence**: User state stored locally for testing
- **Predictable Behavior**: Consistent responses for automated testing
- **Fast Execution**: No blockchain wait times

### Test Data Setup

```typescript
// Example: Setting up a returning user
await setupReturningUser(page, 'Test User');

// Example: Mocking wallet connection
await mockWalletConnection(page);

// Example: Clearing all state
await clearAppState(page);
```

### Data-testid Attributes

The application uses `data-testid` attributes for reliable element selection:

```html
<!-- Main action buttons -->
<button data-testid="give-kindness-button">Give Kindness</button>
<button data-testid="receive-kindness-button">Receive Kindness</button>

<!-- User states -->
<div data-testid="wallet-connection-flow">...</div>
<div data-testid="onboarding-flow">...</div>
<div data-testid="welcome-message">...</div>

<!-- Modals -->
<div data-testid="name-input-modal">...</div>
<input data-testid="name-input" />
<button data-testid="submit-name-button">...</button>
```

## Running the Tests

### Prerequisites

1. **Development Server**: Ensure the app is running on `http://localhost:3001`
   ```bash
   yarn dev
   ```

2. **Playwright Installation**: Install browsers if not already done
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all E2E tests
yarn test:e2e

# Run tests with UI (visual test runner)
yarn test:e2e:ui

# Run tests in headed mode (visible browser)
yarn test:e2e:headed

# Debug specific tests
yarn test:e2e:debug

# Run specific test file
yarn test:e2e user-onboarding.spec.ts

# Run specific browser
yarn test:e2e --project=chromium

# Generate and view test report
yarn test:e2e:report
```

### Parallel Execution

Tests run in parallel by default for faster execution:

```typescript
// Configuration in playwright.config.ts
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

## Test Configuration

### Browser Coverage

Tests run on multiple browsers for compatibility:

- **Chromium**: Primary testing browser
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility
- **Mobile Chrome**: Mobile viewport testing
- **Mobile Safari**: iOS compatibility

### Timeouts and Retries

```typescript
// Global timeouts
actionTimeout: 30000,        // 30 seconds for actions
navigationTimeout: 30000,    // 30 seconds for navigation

// Retry configuration
retries: process.env.CI ? 2 : 0,  // Retry failed tests in CI
```

### Test Artifacts

When tests fail, Playwright automatically captures:

- **Screenshots**: Visual state at failure point
- **Videos**: Recording of test execution
- **Traces**: Detailed execution timeline
- **HTML Reports**: Comprehensive test results

## Writing New Tests

### Best Practices

1. **Use Page Objects**: Encapsulate page interactions in classes
2. **Stable Selectors**: Prefer `data-testid` over CSS classes
3. **Wait Strategies**: Use appropriate waits for dynamic content
4. **Error Handling**: Test both happy path and error scenarios
5. **Clean State**: Start each test with known state

### Example Test Structure

```typescript
test.describe('Feature Name', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await clearAppState(page);
    await homePage.goto();
    await waitForPageLoad(page);
  });

  test('should perform expected behavior', async ({ page }) => {
    // Arrange: Set up test conditions
    await setupReturningUser(page, 'Test User');
    
    // Act: Perform the action being tested
    await homePage.clickGiveKindness();
    
    // Assert: Verify expected outcomes
    await expect(page.getByTestId('give-kindness-modal')).toBeVisible();
    
    // Cleanup: Take screenshot for documentation
    await takeScreenshot(page, 'give-kindness-modal-open');
  });
});
```

### Common Patterns

```typescript
// Waiting for modal to appear
await waitForModal(page, 'modal-testid');

// Handling loading states
await waitForLoadingToComplete(page);

// Error checking
const errors = await checkForConsoleErrors(page);
expect(errors.filter(e => !e.includes('known-error'))).toHaveLength(0);

// State verification
const state = await getCurrentAppState(page);
expect(state.currentFlow).toBe('main-app');
```

## Debugging Tests

### Visual Debugging

```bash
# Run with UI for interactive debugging
yarn test:e2e:ui

# Run in headed mode to see browser
yarn test:e2e:headed

# Debug specific test
yarn test:e2e:debug --grep "test name"
```

### Debug Information

Tests capture extensive debug information:

- **Console Logs**: Application and test console output
- **Network Activity**: Request/response monitoring
- **Performance Metrics**: Timing and resource usage
- **Error Screenshots**: Automatic capture on failures

### Common Issues

1. **localStorage Access Errors**: 
   - Cause: Browser security restrictions
   - Solution: Wrapped localStorage access in try-catch blocks

2. **Element Not Found**:
   - Cause: Dynamic content loading, incorrect selectors
   - Solution: Use appropriate wait strategies, verify selectors

3. **Test Flakiness**:
   - Cause: Race conditions, timing issues
   - Solution: Explicit waits, retry mechanisms

4. **Modal Interactions**:
   - Cause: Animation timing, event propagation
   - Solution: Wait for animations, use appropriate selectors

## Continuous Integration

### CI Configuration

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    yarn install
    yarn build
    yarn test:e2e --project=chromium
  
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Reports

Playwright generates comprehensive HTML reports with:

- **Test Results**: Pass/fail status with timing
- **Screenshots**: Visual evidence of test execution
- **Videos**: Full test recordings for failed tests
- **Traces**: Detailed execution timeline with DOM snapshots

## Maintenance

### Regular Tasks

1. **Update Selectors**: Keep data-testid attributes current
2. **Review Test Coverage**: Ensure new features have tests
3. **Performance Monitoring**: Check test execution times
4. **Browser Updates**: Test with latest browser versions

### Test Health Metrics

Monitor these metrics for test suite health:

- **Execution Time**: Target < 5 minutes for full suite
- **Flakiness Rate**: Target < 5% test failures
- **Coverage**: Aim for 80%+ of user journeys covered
- **Maintenance Burden**: Minimize brittle selectors

## Troubleshooting

### Common Solutions

1. **Server Not Running**: Ensure `yarn dev` is active on port 3001
2. **Test Timeouts**: Check for slow network responses, increase timeouts
3. **Element Not Found**: Verify selectors, check for dynamic content
4. **Flaky Tests**: Add explicit waits, check for race conditions

### Getting Help

- **Playwright Documentation**: https://playwright.dev/docs/
- **Test Reports**: Check generated HTML reports for details
- **Console Logs**: Review browser console for application errors
- **Screenshots/Videos**: Use captured artifacts for debugging

This comprehensive E2E testing suite ensures the Random Act of Kindness application works correctly across different browsers, devices, and user scenarios, providing confidence in the application's reliability and user experience.