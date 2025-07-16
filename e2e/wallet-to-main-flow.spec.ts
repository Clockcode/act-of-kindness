import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { UserNameInputModal } from './pages/UserNameInputModal';
import { 
  waitForPageLoad, 
  clearAppState, 
  mockWalletConnection,
  takeScreenshot,
  checkForConsoleErrors,
  getCurrentAppState
} from './utils/testHelpers';

/**
 * Comprehensive E2E tests for the complete Wallet → Name Setup → Main App flow
 * This test suite ensures the critical user onboarding path works perfectly
 */
test.describe('Wallet to Main App Flow - Complete Journey', () => {
  let homePage: HomePage;
  let nameModal: UserNameInputModal;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    nameModal = new UserNameInputModal(page);
    
    // Start with completely clean state
    await clearAppState(page);
  });

  test('should complete the full wallet connection → name setup → main app flow', async ({ page }) => {
    const testUserName = 'Alice Cooper';
    
    // Step 1: Initial state - should show wallet connection flow
    await homePage.goto();
    await homePage.waitForHydration();
    
    let currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('wallet-connection');
    expect(currentState.walletConnected).toBe(false);
    expect(currentState.userName).toBe(null);
    
    await homePage.verifyFirstTimeUserState();
    await takeScreenshot(page, 'step1-wallet-connection');
    
    // Step 2: Connect wallet
    await mockWalletConnection(page);
    
    // Verify transition to onboarding flow
    currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('onboarding');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe(null);
    
    await homePage.verifyConnectedNoNameState();
    await takeScreenshot(page, 'step2-onboarding-flow');
    
    // Step 3: Click "Set Your Name" to open name input modal
    await homePage.clickSetName();
    
    // Step 4: Verify name input modal appears
    await nameModal.waitForModal();
    await nameModal.verifyInitialState();
    await takeScreenshot(page, 'step3-name-modal');
    
    // Step 5: Enter name and submit
    await nameModal.setName(testUserName);
    
    // Step 6: Wait for processing
    await nameModal.waitForProcessing();
    await takeScreenshot(page, 'step4-processing');
    
    // Step 7: Wait for success state
    await nameModal.waitForSuccess();
    await takeScreenshot(page, 'step5-success');
    
    // Step 8: Modal should close automatically
    await nameModal.waitForModalToClose();
    
    // Step 9: Verify final state - main app with welcome message
    currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('main-app');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe(testUserName);
    
    await homePage.verifyReturningUserState(testUserName);
    
    // Verify all main app elements are present
    await expect(homePage.welcomeMessage).toBeVisible();
    await expect(homePage.mainActions).toBeVisible();
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
    
    // Verify welcome message contains correct name
    const welcomeText = await homePage.getWelcomeText();
    expect(welcomeText).toContain(`Welcome back, ${testUserName}!`);
    
    // Verify onboarding elements are hidden
    await expect(homePage.walletConnectionFlow).not.toBeVisible();
    await expect(homePage.onboardingFlow).not.toBeVisible();
    
    await takeScreenshot(page, 'step6-main-app-complete');
  });

  test('should handle interruptions and recover gracefully', async ({ page }) => {
    const testUserName = 'Bob Johnson';
    
    // Step 1: Get to name input modal
    await homePage.goto();
    await homePage.waitForHydration();
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Step 2: Enter name but don't submit yet
    await nameModal.enterName(testUserName);
    await expect(nameModal.submitButton).toBeEnabled();
    
    // Step 3: Refresh page during name entry
    await page.reload();
    await waitForPageLoad(page);
    
    // Step 4: Should return to onboarding flow (name wasn't saved yet)
    const currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('onboarding');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe(null);
    
    // Step 5: Complete the flow normally
    await homePage.clickSetName();
    await nameModal.waitForModal();
    await nameModal.completeNameSetting(testUserName);
    
    // Step 6: Verify successful completion
    await homePage.verifyReturningUserState(testUserName);
  });

  test('should maintain state persistence after page refresh', async ({ page }) => {
    const testUserName = 'Carol Davis';
    
    // Complete the full onboarding flow
    await homePage.goto();
    await homePage.waitForHydration();
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    await nameModal.completeNameSetting(testUserName);
    await homePage.verifyReturningUserState(testUserName);
    
    // Refresh the page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should maintain returning user state
    const currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('main-app');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe(testUserName);
    
    await homePage.verifyReturningUserState(testUserName);
  });

  test('should handle different user names correctly', async ({ page }) => {
    const testCases = [
      'A', // Single character
      'John Doe', // Standard name
      'Very Long User Name Here', // Long name
      'User123', // Name with numbers
      'A'.repeat(32), // Max length name
    ];
    
    for (const userName of testCases) {
      // Clear state and start fresh
      await clearAppState(page);
      await homePage.goto();
      await homePage.waitForHydration();
      
      // Complete flow with this name
      await mockWalletConnection(page);
      await homePage.clickSetName();
      await nameModal.waitForModal();
      await nameModal.completeNameSetting(userName);
      
      // Verify correct welcome message
      const currentState = await getCurrentAppState(page);
      expect(currentState.userName).toBe(userName);
      
      const welcomeText = await homePage.getWelcomeText();
      expect(welcomeText).toContain(`Welcome back, ${userName}!`);
    }
  });

  test('should validate name input thoroughly', async ({ page }) => {
    await homePage.goto();
    await homePage.waitForHydration();
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Test empty name (should be disabled)
    await nameModal.enterName('');
    await expect(nameModal.submitButton).toBeDisabled();
    
    // Test whitespace only (should be disabled) 
    await nameModal.enterName('   ');
    await expect(nameModal.submitButton).toBeDisabled();
    
    // Test valid name (should be enabled)
    await nameModal.enterName('Valid Name');
    await expect(nameModal.submitButton).toBeEnabled();
    
    // Test character counter
    let counter = await nameModal.getCharacterCounter();
    expect(counter).toContain('10/32 characters');
    
    // Test max length
    const maxLengthName = 'A'.repeat(32);
    await nameModal.enterName(maxLengthName);
    await expect(nameModal.submitButton).toBeEnabled();
    
    counter = await nameModal.getCharacterCounter();
    expect(counter).toContain('32/32 characters');
    
    // Verify the name was truncated correctly if needed
    const inputValue = await nameModal.getNameInputValue();
    expect(inputValue.length).toBeLessThanOrEqual(32);
  });

  test('should handle loading states properly', async ({ page }) => {
    await homePage.goto();
    await homePage.waitForHydration();
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Enter name and submit
    await nameModal.enterName('Loading Test User');
    await nameModal.submitName();
    
    // Should show processing state
    await nameModal.waitForProcessing();
    const isProcessing = await nameModal.isProcessing();
    expect(isProcessing).toBe(true);
    
    // Wait for completion
    await nameModal.waitForSuccess();
    await nameModal.waitForModalToClose();
    
    // Should end up in main app
    await homePage.verifyReturningUserState('Loading Test User');
  });

  test('should maintain accessibility throughout the flow', async ({ page }) => {
    await homePage.goto();
    await homePage.waitForHydration();
    
    // Test keyboard navigation in wallet connection
    await homePage.connectWalletButton.focus();
    await expect(homePage.connectWalletButton).toBeFocused();
    
    // Connect wallet
    await mockWalletConnection(page);
    
    // Test keyboard navigation in onboarding
    await homePage.setNameButton.focus();
    await expect(homePage.setNameButton).toBeFocused();
    
    // Activate with Enter key
    await page.keyboard.press('Enter');
    await nameModal.waitForModal();
    
    // Test modal accessibility
    await expect(nameModal.nameInput).toBeFocused(); // Should auto-focus
    
    // Complete flow
    await nameModal.setName('Accessibility Test User');
    await nameModal.waitForProcessing();
    await nameModal.waitForSuccess();
    await nameModal.waitForModalToClose();
    
    // Test main app accessibility
    await homePage.giveKindnessButton.focus();
    await expect(homePage.giveKindnessButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(homePage.receiveKindnessButton).toBeFocused();
  });

  test('should handle rapid user interactions without breaking', async ({ page }) => {
    await homePage.goto();
    await homePage.waitForHydration();
    await mockWalletConnection(page);
    
    // Rapidly click the set name button multiple times
    await Promise.all([
      homePage.setNameButton.click(),
      homePage.setNameButton.click(),
      homePage.setNameButton.click(),
    ]);
    
    // Should only open one modal
    await nameModal.waitForModal();
    
    // Complete the flow normally
    await nameModal.completeNameSetting('Rapid Click User');
    await homePage.verifyReturningUserState('Rapid Click User');
  });

  test('should track flow progression accurately', async ({ page }) => {
    await homePage.goto();
    await homePage.waitForHydration();
    
    // Track each state transition
    const states: any[] = [];
    
    // Initial state
    let currentState = await getCurrentAppState(page);
    states.push({ step: 'initial', ...currentState });
    expect(currentState.currentFlow).toBe('wallet-connection');
    
    // After wallet connection
    await mockWalletConnection(page);
    currentState = await getCurrentAppState(page);
    states.push({ step: 'wallet-connected', ...currentState });
    expect(currentState.currentFlow).toBe('onboarding');
    expect(currentState.walletConnected).toBe(true);
    
    // During name setup
    await homePage.clickSetName();
    await nameModal.waitForModal();
    await nameModal.setName('Flow Tracker');
    await nameModal.waitForProcessing();
    await nameModal.waitForSuccess();
    await nameModal.waitForModalToClose();
    
    // Final state
    currentState = await getCurrentAppState(page);
    states.push({ step: 'complete', ...currentState });
    expect(currentState.currentFlow).toBe('main-app');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe('Flow Tracker');
    
    // Verify progression was linear and correct
    expect(states).toHaveLength(3);
    expect(states[0].walletConnected).toBe(false);
    expect(states[1].walletConnected).toBe(true);
    expect(states[1].userName).toBe(null);
    expect(states[2].userName).toBe('Flow Tracker');
  });

  test.afterEach(async ({ page }) => {
    // Check for unexpected console errors
    const errors = await checkForConsoleErrors(page);
    
    const unexpectedErrors = errors.filter(error => 
      !error.includes('chrome.runtime.sendMessage') &&
      !error.includes('Cannot redefine property: ethereum') &&
      !error.includes('Extension ID') &&
      !error.includes('Download the React DevTools')
    );
    
    if (unexpectedErrors.length > 0) {
      console.warn('Unexpected console errors in wallet-to-main flow:', unexpectedErrors);
      await takeScreenshot(page, 'console-errors');
    }
    
    expect(unexpectedErrors).toHaveLength(0);
  });
});