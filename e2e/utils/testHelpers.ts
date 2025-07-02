import { expect, type Page } from '@playwright/test';

/**
 * Test helper utilities for common E2E testing scenarios
 */

/**
 * Wait for the page to be fully loaded and hydrated
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  
  // Wait for hydration to complete (React app fully loaded)
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid]') !== null;
  }, { timeout: 10000 });
  
  // Additional wait for any client-side state settling
  await page.waitForTimeout(500);
}

/**
 * Simulate wallet connection in development mode
 * In real E2E tests, this would interact with actual wallet extensions
 */
export async function mockWalletConnection(page: Page) {
  try {
    // In development mode, the app uses localStorage to simulate wallet connection
    await page.evaluate(() => {
      try {
        // Simulate wagmi wallet connection
        localStorage.setItem('wagmi.wallet', 'injected');
        localStorage.setItem('wagmi.account', '0x742d35Cc60aA0bC2d5C4e6F2b60d8F2b2e8d8aF6');
        localStorage.setItem('wagmi.connected', 'true');
      } catch (error) {
        // localStorage might not be available
        console.log('localStorage not available for wallet mock:', error);
      }
    });
  } catch (error) {
    console.log('Could not mock wallet connection, continuing test...');
  }
  
  await page.reload();
  await waitForPageLoad(page);
}

/**
 * Mock wallet disconnection
 */
export async function mockWalletDisconnection(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.account');
    localStorage.removeItem('wagmi.connected');
  });
  
  await page.reload();
  await waitForPageLoad(page);
}

/**
 * Set up a user with a name already set (returning user scenario)
 */
export async function setupReturningUser(page: Page, userName: string = 'John Doe') {
  try {
    await page.evaluate((name) => {
      try {
        // Mock wallet connection
        localStorage.setItem('wagmi.wallet', 'injected');
        localStorage.setItem('wagmi.account', '0x742d35Cc60aA0bC2d5C4e6F2b60d8F2b2e8d8aF6');
        localStorage.setItem('wagmi.connected', 'true');
        
        // Mock user name (development mode uses localStorage)
        localStorage.setItem('userName_0x742d35Cc60aA0bC2d5C4e6F2b60d8F2b2e8d8aF6', name);
      } catch (error) {
        console.log('localStorage not available for returning user setup:', error);
      }
    }, userName);
  } catch (error) {
    console.log('Could not setup returning user, continuing test...');
  }
  
  await page.reload();
  await waitForPageLoad(page);
}

/**
 * Clear all app state (fresh start)
 */
export async function clearAppState(page: Page) {
  try {
    await page.evaluate(() => {
      try {
        // Clear all localStorage related to the app
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('wagmi.') || key.startsWith('userName_') || key.startsWith('kindness_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        // localStorage might not be available
        console.log('localStorage not available:', error);
      }
    });
  } catch (error) {
    // Ignore localStorage errors - continue with test
    console.log('Could not clear localStorage, continuing test...');
  }
  
  await page.reload();
  await waitForPageLoad(page);
}

/**
 * Wait for any loading states to complete
 */
export async function waitForLoadingToComplete(page: Page) {
  // Wait for loading spinners to disappear
  await page.waitForFunction(() => {
    const spinners = document.querySelectorAll('.loading, .animate-spin, [class*="loading"]');
    return Array.from(spinners).every(spinner => {
      const style = window.getComputedStyle(spinner);
      return style.display === 'none' || style.visibility === 'hidden';
    });
  }, { timeout: 15000 });
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true
  });
}

/**
 * Assert that an element contains specific text
 */
export async function assertElementContainsText(page: Page, selector: string, expectedText: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toContainText(expectedText);
}

/**
 * Wait for a modal to appear and be fully rendered
 */
export async function waitForModal(page: Page, modalTestId: string) {
  const modal = page.getByTestId(modalTestId);
  await expect(modal).toBeVisible();
  
  // Wait for modal animation to complete
  await page.waitForTimeout(300);
  
  // Ensure modal is interactive
  await expect(modal).toBeEnabled();
}

/**
 * Wait for a modal to disappear
 */
export async function waitForModalToClose(page: Page, modalTestId: string) {
  const modal = page.getByTestId(modalTestId);
  await expect(modal).not.toBeVisible();
}

/**
 * Simulate network delay (useful for testing loading states)
 */
export async function simulateNetworkDelay(page: Page, delayMs: number = 1000) {
  await page.route('**/*', async (route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await route.continue();
  });
}

/**
 * Check console for errors
 */
export async function checkForConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // Filter out known wallet extension errors that we've suppressed
      const text = msg.text();
      if (!text.includes('chrome.runtime.sendMessage') && 
          !text.includes('Cannot redefine property: ethereum') &&
          !text.includes('Extension ID')) {
        errors.push(text);
      }
    }
  });
  
  return errors;
}

/**
 * Mock successful transaction in development mode
 */
export async function mockSuccessfulTransaction(page: Page) {
  await page.evaluate(() => {
    // Override any transaction simulation to be successful
    window.__test_transaction_success = true;
  });
}

/**
 * Mock failed transaction in development mode
 */
export async function mockFailedTransaction(page: Page, errorMessage: string = 'Transaction failed') {
  await page.evaluate((error) => {
    window.__test_transaction_error = error;
  }, errorMessage);
}

/**
 * Get the current app state based on visible elements
 */
export async function getCurrentAppState(page: Page): Promise<{
  walletConnected: boolean;
  userName: string | null;
  currentFlow: 'wallet-connection' | 'onboarding' | 'main-app';
}> {
  const walletConnectionFlow = page.getByTestId('wallet-connection-flow');
  const onboardingFlow = page.getByTestId('onboarding-flow');
  const mainActions = page.getByTestId('main-actions');
  const welcomeMessage = page.getByTestId('welcome-message');
  
  const isWalletConnectionVisible = await walletConnectionFlow.isVisible();
  const isOnboardingVisible = await onboardingFlow.isVisible();
  const isMainActionsVisible = await mainActions.isVisible();
  const isWelcomeVisible = await welcomeMessage.isVisible();
  
  let currentFlow: 'wallet-connection' | 'onboarding' | 'main-app';
  let walletConnected = false;
  let userName: string | null = null;
  
  if (isWalletConnectionVisible) {
    currentFlow = 'wallet-connection';
  } else if (isOnboardingVisible) {
    currentFlow = 'onboarding';
    walletConnected = true;
  } else if (isMainActionsVisible || isWelcomeVisible) {
    currentFlow = 'main-app';
    walletConnected = true;
    
    if (isWelcomeVisible) {
      const welcomeText = await page.getByTestId('welcome-text').textContent();
      const nameMatch = welcomeText?.match(/Welcome back, (.+)!/);
      userName = nameMatch ? nameMatch[1] : null;
    }
  } else {
    throw new Error('Unable to determine current app state');
  }
  
  return { walletConnected, userName, currentFlow };
}

/**
 * Retry an action until it succeeds or times out
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000 } = options;
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

/**
 * Assert page URL contains expected path
 */
export async function assertUrlContains(page: Page, expectedPath: string) {
  expect(page.url()).toContain(expectedPath);
}

/**
 * Wait for element to contain specific text
 */
export async function waitForElementText(page: Page, selector: string, expectedText: string) {
  await page.waitForFunction(
    ({ selector, text }) => {
      const element = document.querySelector(selector);
      return element && element.textContent?.includes(text);
    },
    { selector, text: expectedText },
    { timeout: 10000 }
  );
}