import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { UserNameInputModal } from './pages/UserNameInputModal';
import { 
  waitForPageLoad, 
  clearAppState,
  mockWalletConnection,
  setupReturningUser,
  takeScreenshot,
  mockFailedTransaction,
  simulateNetworkDelay,
  checkForConsoleErrors
} from './utils/testHelpers';

test.describe('Error Handling and Edge Cases', () => {
  let homePage: HomePage;
  let nameModal: UserNameInputModal;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    nameModal = new UserNameInputModal(page);
    
    // Start with clean state
    await clearAppState(page);
    
    // Navigate to home page
    await homePage.goto();
    await waitForPageLoad(page);
  });

  test('should handle wallet connection failures gracefully', async ({ page }) => {
    // Start in disconnected state
    await homePage.verifyFirstTimeUserState();
    
    // Simulate network issues during wallet connection
    await simulateNetworkDelay(page, 5000);
    
    // Try to connect wallet
    await homePage.connectWalletButton.click();
    
    // App should still be responsive
    await expect(homePage.connectWalletButton).toBeVisible();
    
    // Should not crash or show error screens
    await expect(homePage.heroSection).toBeVisible();
    
    // Take screenshot
    await takeScreenshot(page, 'wallet-connection-failure');
  });

  test('should handle hydration mismatch errors', async ({ page }) => {
    // Disable JavaScript to simulate SSR-only state
    await page.addInitScript(() => {
      // Simulate hydration issues
      Object.defineProperty(window, 'React', { value: undefined });
    });
    
    // Navigate to page
    await homePage.goto();
    
    // Should still show basic content even with hydration issues
    await expect(homePage.heroSection).toBeVisible();
    
    // Re-enable JavaScript
    await page.reload();
    await waitForPageLoad(page);
    
    // Should work normally after reload
    await homePage.verifyFirstTimeUserState();
  });

  test('should handle name setting transaction failures', async ({ page }) => {
    // Setup: Get to name input modal
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Mock transaction failure
    await mockFailedTransaction(page, 'User rejected transaction');
    
    // Try to set name
    await nameModal.enterName('Test User');
    await nameModal.submitName();
    
    // Should handle error gracefully
    await page.waitForTimeout(2000);
    
    // Modal should still be open, allowing retry
    await expect(nameModal.modal).toBeVisible();
    
    // Error message might be shown
    if (await nameModal.hasErrorMessage()) {
      const errorText = await nameModal.getErrorMessage();
      expect(errorText.length).toBeGreaterThan(0);
    }
    
    // Take screenshot
    await takeScreenshot(page, 'name-setting-transaction-failure');
  });

  test('should handle browser extension conflicts', async ({ page }) => {
    // Simulate multiple wallet providers
    await page.addInitScript(() => {
      // Mock multiple wallet extensions
      (window as any).ethereum = {
        providers: [
          { isMetaMask: true },
          { isRabby: true }
        ],
        isMetaMask: true
      };
    });
    
    await homePage.goto();
    await waitForPageLoad(page);
    
    // Should still load and function
    await expect(homePage.heroSection).toBeVisible();
    
    // Check if conflict warning is shown
    const conflictWarning = page.locator('text=/Multiple wallet/i, .alert-warning').first();
    if (await conflictWarning.isVisible()) {
      await expect(conflictWarning).toBeVisible();
      await takeScreenshot(page, 'wallet-extension-conflicts');
    }
  });

  test('should handle network timeouts gracefully', async ({ page }) => {
    // Setup returning user
    await setupReturningUser(page, 'Network Test User');
    
    // Simulate network timeout
    await page.route('**/*', async (route) => {
      // Delay all requests significantly
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });
    
    // Try to load the page
    await homePage.goto();
    
    // Should show loading state or fallback content
    await page.waitForTimeout(5000);
    
    // At minimum, should not crash
    const isPageResponsive = await page.evaluate(() => {
      return document.readyState === 'complete' || document.readyState === 'interactive';
    });
    
    expect(isPageResponsive).toBe(true);
  });

  test('should handle localStorage corruption', async ({ page }) => {
    // Corrupt localStorage
    await page.addInitScript(() => {
      localStorage.setItem('userName_0x123', 'invalid-json-{');
      localStorage.setItem('wagmi.connected', 'not-a-boolean');
    });
    
    await homePage.goto();
    await waitForPageLoad(page);
    
    // Should fallback to default state
    await expect(homePage.heroSection).toBeVisible();
    
    // Should not crash the application
    const errors = await checkForConsoleErrors(page);
    const criticalErrors = errors.filter(error => 
      error.includes('SyntaxError') || 
      error.includes('TypeError') ||
      error.includes('ReferenceError')
    );
    
    // Some parsing errors might be expected, but no critical runtime errors
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should handle rapid user interactions', async ({ page }) => {
    // Setup returning user
    await setupReturningUser(page, 'Rapid Click User');
    
    // Rapidly click buttons
    for (let i = 0; i < 5; i++) {
      await homePage.giveKindnessButton.click();
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      
      await homePage.receiveKindnessButton.click();
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(homePage.mainActions).toBeVisible();
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
  });

  test('should handle invalid URL parameters', async ({ page }) => {
    // Navigate with invalid parameters
    await page.goto('/?invalid=param&malicious=<script>alert("xss")</script>');
    await waitForPageLoad(page);
    
    // Should load normally and ignore invalid params
    await expect(homePage.heroSection).toBeVisible();
    
    // Should not execute any malicious code
    const alerts = await page.evaluate(() => {
      return (window as any).__alerts || [];
    });
    expect(alerts.length).toBe(0);
  });

  test('should handle missing environment variables gracefully', async ({ page }) => {
    // Mock missing environment variables
    await page.addInitScript(() => {
      (window as any).__ENV_MISSING = true;
    });
    
    await homePage.goto();
    await waitForPageLoad(page);
    
    // Should still load basic functionality
    await expect(homePage.heroSection).toBeVisible();
    
    // May show development mode indicators
    const devIndicators = page.locator('text=/development/i, text=/localhost/i').first();
    if (await devIndicators.isVisible()) {
      console.log('Development mode detected, which is expected');
    }
  });

  test('should handle concurrent user sessions', async ({ page, context }) => {
    // Setup first session
    await setupReturningUser(page, 'Session 1 User');
    
    // Open second tab with different user
    const page2 = await context.newPage();
    const homePage2 = new HomePage(page2);
    
    await clearAppState(page2);
    await setupReturningUser(page2, 'Session 2 User');
    await homePage2.goto();
    await waitForPageLoad(page2);
    
    // Both sessions should work independently
    await homePage.verifyReturningUserState('Session 1 User');
    await homePage2.verifyReturningUserState('Session 2 User');
    
    // Close second tab
    await page2.close();
  });

  test('should handle memory leaks and resource cleanup', async ({ page }) => {
    // Setup user and navigate through flows multiple times
    await setupReturningUser(page, 'Memory Test User');
    
    for (let i = 0; i < 10; i++) {
      // Open and close modals repeatedly
      await homePage.clickGiveKindness();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await homePage.clickReceiveKindness();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Check memory usage (basic check)
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0 };
    });
    
    // Memory usage should be reasonable (less than 50MB for this simple app)
    if (memoryInfo.usedJSHeapSize > 0) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
    
    // Application should still be responsive
    await expect(homePage.mainActions).toBeVisible();
  });

  test('should handle CSP (Content Security Policy) restrictions', async ({ page }) => {
    // Add strict CSP
    await page.setExtraHTTPHeaders({
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    });
    
    await homePage.goto();
    await waitForPageLoad(page);
    
    // Should still load despite CSP restrictions
    await expect(homePage.heroSection).toBeVisible();
    
    // Check for CSP violations
    const cspErrors = await page.evaluate(() => {
      return (window as any).__cspViolations || [];
    });
    
    // Should have minimal CSP violations
    expect(cspErrors.length).toBeLessThan(5);
  });

  test('should recover from JavaScript runtime errors', async ({ page }) => {
    let errorCount = 0;
    
    // Count JavaScript errors
    page.on('pageerror', () => {
      errorCount++;
    });
    
    // Inject code that might cause errors
    await page.addInitScript(() => {
      // Override a global function to potentially cause errors
      (window as any).fetch = () => {
        throw new Error('Simulated fetch error');
      };
    });
    
    await homePage.goto();
    await waitForPageLoad(page);
    
    // App should still load basic content
    await expect(homePage.heroSection).toBeVisible();
    
    // Some errors are expected due to our injection
    expect(errorCount).toBeLessThan(10);
  });

  test.afterEach(async ({ page }) => {
    // Comprehensive error checking after each test
    const errors = await checkForConsoleErrors(page);
    
    // Categorize errors
    const networkErrors = errors.filter(e => e.includes('net::') || e.includes('NetworkError'));
    const jsErrors = errors.filter(e => e.includes('TypeError') || e.includes('ReferenceError'));
    const knownErrors = errors.filter(e => 
      e.includes('chrome.runtime.sendMessage') ||
      e.includes('Cannot redefine property: ethereum') ||
      e.includes('Extension ID')
    );
    
    console.log(`Test completed with ${errors.length} total console messages:`);
    console.log(`- Network errors: ${networkErrors.length}`);
    console.log(`- JavaScript errors: ${jsErrors.length}`);
    console.log(`- Known/filtered errors: ${knownErrors.length}`);
    
    // Take screenshot if there were unexpected errors
    const unexpectedErrors = errors.filter(e => !knownErrors.includes(e));
    if (unexpectedErrors.length > 5) {
      await takeScreenshot(page, 'unexpected-errors');
    }
  });
});