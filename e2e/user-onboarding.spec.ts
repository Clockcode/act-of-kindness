import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { UserNameInputModal } from './pages/UserNameInputModal';
import { 
  waitForPageLoad, 
  clearAppState, 
  mockWalletConnection, 
  setupReturningUser,
  checkForConsoleErrors,
  takeScreenshot,
  getCurrentAppState
} from './utils/testHelpers';

test.describe('User Onboarding Flow', () => {
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

  test('should display wallet connection flow for new users', async ({ page }) => {
    // Verify initial state shows wallet connection flow
    await homePage.verifyFirstTimeUserState();
    
    // Check that hero section is visible
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroSection).toContainText('Random Act of Kindness');
    
    // Verify main actions are not visible yet
    await expect(homePage.mainActions).not.toBeVisible();
    await expect(homePage.welcomeMessage).not.toBeVisible();
    
    // Take screenshot for documentation
    await takeScreenshot(page, 'wallet-connection-flow');
  });

  test('should progress to onboarding after wallet connection', async ({ page }) => {
    // Start in wallet connection state
    await homePage.verifyFirstTimeUserState();
    
    // Simulate wallet connection (development mode)
    await mockWalletConnection(page);
    
    // Should now show onboarding flow
    await homePage.verifyConnectedNoNameState();
    
    // Verify the onboarding message
    await expect(homePage.onboardingTitle).toContainText('Welcome to the Kindness Community!');
    
    // Take screenshot
    await takeScreenshot(page, 'onboarding-flow');
  });

  test('should complete full first-time user onboarding flow', async ({ page }) => {
    const testUserName = 'Alice Cooper';
    
    // Step 1: Start with wallet connection
    await homePage.verifyFirstTimeUserState();
    
    // Step 2: Connect wallet
    await mockWalletConnection(page);
    await homePage.verifyConnectedNoNameState();
    
    // Step 3: Click "Set Your Name"
    await homePage.clickSetName();
    
    // Step 4: Name input modal should appear
    await nameModal.waitForModal();
    await nameModal.verifyInitialState();
    
    // Step 5: Enter name and submit
    await nameModal.setName(testUserName);
    
    // Step 6: Wait for processing and success
    await nameModal.waitForProcessing();
    await nameModal.waitForSuccess();
    
    // Step 7: Modal should close automatically
    await nameModal.waitForModalToClose();
    
    // Step 8: Should now see main app with welcome message
    await homePage.verifyReturningUserState(testUserName);
    
    // Verify both action buttons are visible
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
    
    // Take final screenshot
    await takeScreenshot(page, 'onboarding-complete');
  });

  test('should handle name validation correctly', async ({ page }) => {
    // Setup: Get to name input modal
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Test name validation
    await nameModal.testNameValidation();
    
    // Test empty submission (button should be disabled)
    await nameModal.enterName('');
    await expect(nameModal.submitButton).toBeDisabled();
    
    // Test valid name enables button
    await nameModal.enterName('Valid Name');
    await expect(nameModal.submitButton).toBeEnabled();
    await expect(nameModal.characterCounter).toContainText('10/32 characters');
    
    // Test character limit
    const longName = 'A'.repeat(32);
    await nameModal.enterName(longName);
    await expect(nameModal.submitButton).toBeEnabled();
    await expect(nameModal.characterCounter).toContainText('32/32 characters');
  });

  test('should show returning user state correctly', async ({ page }) => {
    const testUserName = 'Jane Smith';
    
    // Setup returning user
    await setupReturningUser(page, testUserName);
    
    // Should immediately show main app state
    await homePage.verifyReturningUserState(testUserName);
    
    // Verify welcome message contains correct name
    const welcomeText = await homePage.getWelcomeText();
    expect(welcomeText).toContain(`Welcome back, ${testUserName}!`);
    
    // Verify main actions are available
    await expect(homePage.giveKindnessButton).toBeVisible();
    await expect(homePage.receiveKindnessButton).toBeVisible();
    
    // Verify onboarding elements are not visible
    await expect(homePage.walletConnectionFlow).not.toBeVisible();
    await expect(homePage.onboardingFlow).not.toBeVisible();
  });

  test('should handle wallet disconnection during session', async ({ page }) => {
    const testUserName = 'Bob Johnson';
    
    // Start with returning user state
    await setupReturningUser(page, testUserName);
    await homePage.verifyReturningUserState(testUserName);
    
    // Disconnect wallet
    await homePage.disconnectWallet();
    
    // Should return to wallet connection flow
    await homePage.verifyFirstTimeUserState();
    
    // Verify main app elements are hidden
    await expect(homePage.welcomeMessage).not.toBeVisible();
    await expect(homePage.mainActions).not.toBeVisible();
  });

  test('should maintain state consistency across page refreshes', async ({ page }) => {
    const testUserName = 'Carol Davis';
    
    // Complete onboarding
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    await nameModal.completeNameSetting(testUserName);
    
    // Verify main app state
    await homePage.verifyReturningUserState(testUserName);
    
    // Refresh page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should still show returning user state
    await homePage.verifyReturningUserState(testUserName);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Setup: Get to name input modal
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Simulate network failure during name setting
    await page.route('**/*', route => route.abort());
    
    // Try to set name
    await nameModal.enterName('Test User');
    await nameModal.submitName();
    
    // Should handle error gracefully (in development mode, this might still succeed due to mocking)
    // The important thing is that the app doesn't crash
    const errors = await checkForConsoleErrors(page);
    
    // Filter out expected network errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('net::ERR_FAILED') && 
      !error.includes('NetworkError')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('should display correct loading states', async ({ page }) => {
    // Setup: Get to name input modal
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Enter name
    await nameModal.enterName('Loading Test');
    
    // Submit and check for loading state
    await nameModal.submitName();
    
    // Should show processing state
    const isProcessing = await nameModal.isProcessing();
    expect(isProcessing).toBe(true);
    
    // Wait for completion
    await nameModal.waitForSuccess();
    await nameModal.waitForModalToClose();
  });

  test('should validate user input thoroughly', async ({ page }) => {
    // Setup: Get to name input modal
    await mockWalletConnection(page);
    await homePage.clickSetName();
    await nameModal.waitForModal();
    
    // Test various input scenarios
    const testCases = [
      { input: '', shouldBeValid: false, description: 'empty name' },
      { input: '   ', shouldBeValid: false, description: 'whitespace only' },
      { input: 'A', shouldBeValid: true, description: 'single character' },
      { input: 'John Doe', shouldBeValid: true, description: 'normal name' },
      { input: 'A'.repeat(32), shouldBeValid: true, description: 'max length' },
      { input: 'Valid Name 123', shouldBeValid: true, description: 'name with numbers' },
    ];
    
    for (const testCase of testCases) {
      await nameModal.enterName(testCase.input);
      
      const isEnabled = await nameModal.isSubmitButtonEnabled();
      expect(isEnabled).toBe(testCase.shouldBeValid);
      
      if (testCase.input.length > 0) {
        const counter = await nameModal.getCharacterCounter();
        expect(counter).toContain(`${Math.min(testCase.input.trim().length, 32)}/32 characters`);
      }
    }
  });

  test('should track user flow progression correctly', async ({ page }) => {
    // Track state changes throughout onboarding
    let currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('wallet-connection');
    expect(currentState.walletConnected).toBe(false);
    expect(currentState.userName).toBe(null);
    
    // Connect wallet
    await mockWalletConnection(page);
    currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('onboarding');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe(null);
    
    // Complete name setting
    await homePage.clickSetName();
    await nameModal.waitForModal();
    await nameModal.completeNameSetting('Flow Test User');
    
    currentState = await getCurrentAppState(page);
    expect(currentState.currentFlow).toBe('main-app');
    expect(currentState.walletConnected).toBe(true);
    expect(currentState.userName).toBe('Flow Test User');
  });

  test.afterEach(async ({ page }) => {
    // Check for console errors after each test
    const errors = await checkForConsoleErrors(page);
    
    // Filter out known/expected errors
    const unexpectedErrors = errors.filter(error => 
      !error.includes('chrome.runtime.sendMessage') &&
      !error.includes('Cannot redefine property: ethereum') &&
      !error.includes('Extension ID') &&
      !error.includes('Download the React DevTools') // Development warning
    );
    
    if (unexpectedErrors.length > 0) {
      console.warn('Unexpected console errors:', unexpectedErrors);
      // Take screenshot on error for debugging
      await takeScreenshot(page, 'console-errors');
    }
  });
});