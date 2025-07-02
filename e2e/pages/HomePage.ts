import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the main application home page
 * Handles wallet connection, onboarding, and main action flows
 */
export class HomePage {
  readonly page: Page;
  
  // Main sections
  readonly heroSection: Locator;
  readonly walletConnectionFlow: Locator;
  readonly onboardingFlow: Locator;
  readonly welcomeMessage: Locator;
  readonly mainActions: Locator;
  
  // Wallet connection elements
  readonly connectWalletTitle: Locator;
  readonly connectWalletButton: Locator;
  readonly walletConnected: Locator;
  readonly connectedAddress: Locator;
  readonly disconnectButton: Locator;
  
  // Onboarding elements
  readonly onboardingTitle: Locator;
  readonly setNameButton: Locator;
  
  // Welcome message
  readonly welcomeText: Locator;
  
  // Main action buttons
  readonly giveKindnessButton: Locator;
  readonly receiveKindnessButton: Locator;
  
  // Pool dashboard
  readonly poolDashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main sections
    this.heroSection = page.locator('h1').filter({ hasText: 'Random Act of Kindness' });
    this.walletConnectionFlow = page.getByTestId('wallet-connection-flow');
    this.onboardingFlow = page.getByTestId('onboarding-flow');
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.mainActions = page.getByTestId('main-actions');
    
    // Wallet connection elements
    this.connectWalletTitle = page.getByTestId('connect-wallet-title');
    this.connectWalletButton = page.getByTestId('connect-wallet-button');
    this.walletConnected = page.getByTestId('wallet-connected');
    this.connectedAddress = page.getByTestId('connected-address');
    this.disconnectButton = page.getByTestId('disconnect-button');
    
    // Onboarding elements
    this.onboardingTitle = page.getByTestId('onboarding-title');
    this.setNameButton = page.getByTestId('set-name-button');
    
    // Welcome message
    this.welcomeText = page.getByTestId('welcome-text');
    
    // Main action buttons
    this.giveKindnessButton = page.getByTestId('give-kindness-button');
    this.receiveKindnessButton = page.getByTestId('receive-kindness-button');
    
    // Pool dashboard
    this.poolDashboard = page.locator('[data-testid*="pool"], [data-testid*="dashboard"]').first();
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the page to be fully loaded and hydrated
   */
  async waitForHydration() {
    // Wait for the hero section to be visible (indicates hydration is complete)
    await expect(this.heroSection).toBeVisible();
    
    // Wait a bit longer to ensure all client-side state is settled
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if the wallet connection flow is visible
   */
  async isWalletConnectionFlowVisible() {
    return await this.walletConnectionFlow.isVisible();
  }

  /**
   * Check if the onboarding flow is visible
   */
  async isOnboardingFlowVisible() {
    return await this.onboardingFlow.isVisible();
  }

  /**
   * Check if the main actions are visible (wallet connected + name set)
   */
  async areMainActionsVisible() {
    return await this.mainActions.isVisible();
  }

  /**
   * Check if welcome message is visible for returning users
   */
  async isWelcomeMessageVisible() {
    return await this.welcomeMessage.isVisible();
  }

  /**
   * Simulate wallet connection (for development/mock mode)
   * In a real E2E test, this would interact with the actual wallet extension
   */
  async connectWallet() {
    // Check if we're in the wallet connection flow
    await expect(this.walletConnectionFlow).toBeVisible();
    
    // Click the connect wallet button
    await this.connectWalletButton.click();
    
    // In development mode, this should immediately simulate a connection
    // In a real test, we'd need to handle the wallet extension popup
    
    // Wait for either onboarding flow or main actions to appear
    await this.page.waitForFunction(() => {
      const onboarding = document.querySelector('[data-testid="onboarding-flow"]');
      const mainActions = document.querySelector('[data-testid="main-actions"]');
      const welcomeMessage = document.querySelector('[data-testid="welcome-message"]');
      return onboarding || mainActions || welcomeMessage;
    }, { timeout: 10000 });
  }

  /**
   * Get the current user state based on visible elements
   */
  async getCurrentUserState(): Promise<'disconnected' | 'connected-no-name' | 'connected-with-name'> {
    if (await this.isWalletConnectionFlowVisible()) {
      return 'disconnected';
    } else if (await this.isOnboardingFlowVisible()) {
      return 'connected-no-name';
    } else if (await this.areMainActionsVisible() || await this.isWelcomeMessageVisible()) {
      return 'connected-with-name';
    }
    
    throw new Error('Unable to determine user state');
  }

  /**
   * Click the "Set Your Name" button to start onboarding
   */
  async clickSetName() {
    await expect(this.setNameButton).toBeVisible();
    await this.setNameButton.click();
  }

  /**
   * Click the "Give Kindness" button
   */
  async clickGiveKindness() {
    await expect(this.giveKindnessButton).toBeVisible();
    await this.giveKindnessButton.click();
  }

  /**
   * Click the "Receive Kindness" button
   */
  async clickReceiveKindness() {
    await expect(this.receiveKindnessButton).toBeVisible();
    await this.receiveKindnessButton.click();
  }

  /**
   * Get the welcome message text for a returning user
   */
  async getWelcomeText(): Promise<string> {
    await expect(this.welcomeText).toBeVisible();
    return await this.welcomeText.textContent() || '';
  }

  /**
   * Verify the page shows the correct state for a first-time user
   */
  async verifyFirstTimeUserState() {
    await expect(this.walletConnectionFlow).toBeVisible();
    await expect(this.connectWalletTitle).toContainText('Connect Your Wallet to Get Started');
    await expect(this.connectWalletButton).toBeVisible();
    await expect(this.onboardingFlow).not.toBeVisible();
    await expect(this.mainActions).not.toBeVisible();
  }

  /**
   * Verify the page shows the correct state after wallet connection
   */
  async verifyConnectedNoNameState() {
    await expect(this.onboardingFlow).toBeVisible();
    await expect(this.onboardingTitle).toContainText('Welcome to the Kindness Community!');
    await expect(this.setNameButton).toBeVisible();
    await expect(this.walletConnectionFlow).not.toBeVisible();
    await expect(this.mainActions).not.toBeVisible();
  }

  /**
   * Verify the page shows the correct state for a returning user
   */
  async verifyReturningUserState(expectedUserName: string) {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeText).toContainText(`Welcome back, ${expectedUserName}!`);
    await expect(this.mainActions).toBeVisible();
    await expect(this.giveKindnessButton).toBeVisible();
    await expect(this.receiveKindnessButton).toBeVisible();
    await expect(this.walletConnectionFlow).not.toBeVisible();
    await expect(this.onboardingFlow).not.toBeVisible();
  }

  /**
   * Simulate disconnecting the wallet
   */
  async disconnectWallet() {
    if (await this.walletConnected.isVisible()) {
      await this.disconnectButton.click();
      
      // Wait for the wallet connection flow to reappear
      await expect(this.walletConnectionFlow).toBeVisible();
    }
  }

  /**
   * Wait for any loading states to complete
   */
  async waitForLoadingToComplete() {
    // Wait for any loading spinners to disappear
    await this.page.waitForFunction(() => {
      const spinners = document.querySelectorAll('.loading, .animate-spin');
      return spinners.length === 0;
    }, { timeout: 10000 });
  }
}