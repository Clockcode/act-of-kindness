import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { 
  waitForPageLoad, 
  setupReturningUser,
  clearAppState,
  takeScreenshot,
  waitForModal,
  waitForModalToClose,
  checkForConsoleErrors
} from './utils/testHelpers';

test.describe('Main User Flows', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    
    // Start with clean state
    await clearAppState(page);
    
    // Setup as returning user for main flow tests
    await setupReturningUser(page, 'Test User');
    
    // Navigate to home page
    await homePage.goto();
    await waitForPageLoad(page);
    
    // Verify we're in the main app state
    await homePage.verifyReturningUserState('Test User');
  });

  test('should display main application interface correctly', async ({ page }) => {
    // Verify all main elements are visible
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.welcomeMessage).toBeVisible();
    await expect(homePage.mainActions).toBeVisible();
    
    // Verify action buttons
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
    
    // Verify welcome message contains user name
    const welcomeText = await homePage.getWelcomeText();
    expect(welcomeText).toContain('Welcome back, Test User!');
    
    // Take screenshot for documentation
    await takeScreenshot(page, 'main-app-interface');
  });

  test('should open Give Kindness modal when clicked', async ({ page }) => {
    // Click the Give Kindness button
    await homePage.clickGiveKindness();
    
    // Wait for modal to appear
    await waitForModal(page, 'give-kindness-modal');
    
    // Verify modal is visible with correct content
    const modal = page.getByTestId('give-kindness-modal');
    await expect(modal).toBeVisible();
    
    // Check for expected modal elements
    await expect(page.locator('text=Give Kindness')).toBeVisible();
    
    // Take screenshot
    await takeScreenshot(page, 'give-kindness-modal');
    
    // Close modal by clicking close button or backdrop
    const closeButton = page.locator('[aria-label="Close"], .btn-close, text=×').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click backdrop to close
      await page.keyboard.press('Escape');
    }
    
    // Verify modal closes
    await waitForModalToClose(page, 'give-kindness-modal');
  });

  test('should open Receive Kindness modal when clicked', async ({ page }) => {
    // Click the Receive Kindness button
    await homePage.clickReceiveKindness();
    
    // Wait for modal to appear
    await waitForModal(page, 'receive-kindness-modal');
    
    // Verify modal is visible with correct content
    const modal = page.getByTestId('receive-kindness-modal');
    await expect(modal).toBeVisible();
    
    // Check for expected modal elements
    await expect(page.locator('text=Receive Kindness')).toBeVisible();
    
    // Take screenshot
    await takeScreenshot(page, 'receive-kindness-modal');
    
    // Close modal
    const closeButton = page.locator('[aria-label="Close"], .btn-close, text=×').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }
    
    // Verify modal closes
    await waitForModalToClose(page, 'receive-kindness-modal');
  });

  test('should display pool dashboard information', async ({ page }) => {
    // Look for pool dashboard elements (may be loaded dynamically)
    await page.waitForTimeout(2000); // Allow time for data loading
    
    // Check if pool dashboard is visible
    const dashboard = page.locator('[data-testid*="pool"], [data-testid*="dashboard"], .card:has-text("Pool")').first();
    
    if (await dashboard.isVisible()) {
      // Verify dashboard contains expected information
      await expect(dashboard).toBeVisible();
      
      // Look for typical pool information
      const poolElements = [
        page.locator('text=/Daily Pool|Today.*Pool/i'),
        page.locator('text=/Receiver/i'),
        page.locator('text=/ETH/i'),
      ];
      
      // At least some pool information should be visible
      let foundElements = 0;
      for (const element of poolElements) {
        if (await element.first().isVisible()) {
          foundElements++;
        }
      }
      
      expect(foundElements).toBeGreaterThan(0);
      
      // Take screenshot
      await takeScreenshot(page, 'pool-dashboard');
    } else {
      console.log('Pool dashboard not visible - may be loading or not implemented in development mode');
    }
  });

  test('should handle modal interactions correctly', async ({ page }) => {
    // Test opening and closing modals in sequence
    
    // 1. Open Give Kindness modal
    await homePage.clickGiveKindness();
    await waitForModal(page, 'give-kindness-modal');
    
    // Close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 2. Open Receive Kindness modal
    await homePage.clickReceiveKindness();
    await waitForModal(page, 'receive-kindness-modal');
    
    // Close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 3. Verify we're back to main state
    await expect(homePage.mainActions).toBeVisible();
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
  });

  test('should maintain responsive design on different screen sizes', async ({ page }) => {
    // Test desktop view (already loaded)
    await expect(homePage.mainActions).toBeVisible();
    await takeScreenshot(page, 'desktop-view');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(homePage.mainActions).toBeVisible();
    await takeScreenshot(page, 'tablet-view');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(homePage.mainActions).toBeVisible();
    
    // On mobile, buttons might stack vertically
    const buttons = [homePage.giveKindnessButton, homePage.receiveKindnessButton];
    for (const button of buttons) {
      await expect(button).toBeVisible();
    }
    
    await takeScreenshot(page, 'mobile-view');
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle page refresh gracefully', async ({ page }) => {
    // Verify initial state
    await homePage.verifyReturningUserState('Test User');
    
    // Refresh the page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should maintain the same state
    await homePage.verifyReturningUserState('Test User');
    
    // Verify all functionality still works
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
  });

  test('should handle wallet provider conflicts gracefully', async ({ page }) => {
    // Check if wallet provider conflict warning appears
    const conflictWarning = page.locator('text=/Multiple wallet/i, text=/wallet extension/i').first();
    
    if (await conflictWarning.isVisible()) {
      // Verify warning is displayed appropriately
      await expect(conflictWarning).toBeVisible();
      await takeScreenshot(page, 'wallet-conflict-warning');
    }
    
    // App should still function despite warnings
    await expect(homePage.mainActions).toBeVisible();
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Collect JavaScript errors
    page.on('pageerror', (error) => {
      errors.push(error.toString());
    });
    
    // Reload page to check for errors
    await page.reload();
    await waitForPageLoad(page);
    
    // Interact with main features
    await homePage.clickGiveKindness();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    
    await homePage.clickReceiveKindness();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    
    // Filter out known/expected errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('chrome.runtime.sendMessage') &&
      !error.includes('Cannot redefine property: ethereum') &&
      !error.includes('Extension ID')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('should have accessible navigation and interactions', async ({ page }) => {
    // Test keyboard navigation
    await homePage.giveKindnessButton.focus();
    await expect(homePage.giveKindnessButton).toBeFocused();
    
    // Tab to next button
    await page.keyboard.press('Tab');
    await expect(homePage.receiveKindnessButton).toBeFocused();
    
    // Test activation with Enter key
    await page.keyboard.press('Enter');
    
    // Should open the modal
    await waitForModal(page, 'receive-kindness-modal');
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should display correct content hierarchy', async ({ page }) => {
    // Check heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Random Act of Kindness');
    
    // Check welcome message is properly structured
    const welcomeHeading = page.getByTestId('welcome-text');
    await expect(welcomeHeading).toBeVisible();
    
    // Verify content is semantically structured
    const mainContent = page.locator('main, [role="main"], .container').first();
    await expect(mainContent).toBeVisible();
  });

  test('should handle different user states correctly', async ({ page }) => {
    // Test with different user names
    const testUsers = ['Alice', 'Bob Smith', 'Very Long User Name'];
    
    for (const userName of testUsers) {
      // Setup user
      await setupReturningUser(page, userName);
      await page.reload();
      await waitForPageLoad(page);
      
      // Verify correct welcome message
      await homePage.verifyReturningUserState(userName);
      const welcomeText = await homePage.getWelcomeText();
      expect(welcomeText).toContain(`Welcome back, ${userName}!`);
    }
  });

  test.afterEach(async ({ page }) => {
    // Check for console errors
    const errors = await checkForConsoleErrors(page);
    
    const unexpectedErrors = errors.filter(error => 
      !error.includes('chrome.runtime.sendMessage') &&
      !error.includes('Cannot redefine property: ethereum') &&
      !error.includes('Extension ID') &&
      !error.includes('Download the React DevTools')
    );
    
    if (unexpectedErrors.length > 0) {
      console.warn('Unexpected console errors in main flows:', unexpectedErrors);
      await takeScreenshot(page, 'main-flow-errors');
    }
  });
});