import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the User Name Input Modal
 * Handles name setting during user onboarding
 */
export class UserNameInputModal {
  readonly page: Page;
  
  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly nameForm: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly characterCounter: Locator;
  readonly infoMessage: Locator;
  
  // Success state
  readonly successModal: Locator;
  readonly successMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Modal elements
    this.modal = page.getByTestId('name-input-modal');
    this.modalTitle = page.getByTestId('modal-title');
    this.nameForm = page.getByTestId('name-form');
    this.nameInput = page.getByTestId('name-input');
    this.submitButton = page.getByTestId('submit-name-button');
    this.errorMessage = page.getByTestId('error-message');
    this.characterCounter = page.locator('text=/\\d+\\/32 characters/');
    this.infoMessage = page.locator('text=Your name will be stored on the blockchain');
    
    // Success state
    this.successModal = page.getByTestId('name-success-modal');
    this.successMessage = page.getByTestId('success-message');
    this.loadingIndicator = page.locator('.loading-dots');
  }

  /**
   * Wait for the modal to be visible
   */
  async waitForModal() {
    await expect(this.modal).toBeVisible();
    await expect(this.modalTitle).toContainText('Welcome to Kindness Pool!');
  }

  /**
   * Check if the modal is visible
   */
  async isVisible() {
    return await this.modal.isVisible();
  }

  /**
   * Enter a name in the input field
   */
  async enterName(name: string) {
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }

  /**
   * Submit the name form
   */
  async submitName() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  /**
   * Enter a name and submit the form
   */
  async setName(name: string) {
    await this.enterName(name);
    await this.submitName();
  }

  /**
   * Get the current value of the name input
   */
  async getNameInputValue(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  /**
   * Check if the submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /**
   * Check if an error message is visible
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Get the character counter text
   */
  async getCharacterCounter(): Promise<string> {
    return await this.characterCounter.textContent() || '';
  }

  /**
   * Wait for the form to be in a processing state
   */
  async waitForProcessing() {
    // Wait for submit button to show processing state
    await expect(this.submitButton).toContainText(/Setting Name|Processing|Confirm in Wallet/);
  }

  /**
   * Wait for the success modal to appear
   */
  async waitForSuccess() {
    await expect(this.successModal).toBeVisible();
    await expect(this.successMessage).toContainText('Welcome to the Community!');
  }

  /**
   * Wait for the modal to close automatically
   */
  async waitForModalToClose() {
    await expect(this.modal).not.toBeVisible();
    await expect(this.successModal).not.toBeVisible();
  }

  /**
   * Verify the modal shows the correct initial state
   */
  async verifyInitialState() {
    await expect(this.modal).toBeVisible();
    await expect(this.modalTitle).toContainText('Welcome to Kindness Pool!');
    await expect(this.nameInput).toBeVisible();
    await expect(this.nameInput).toHaveValue('');
    await expect(this.submitButton).toBeDisabled();
    await expect(this.infoMessage).toBeVisible();
    await expect(this.characterCounter).toContainText('0/32 characters');
  }

  /**
   * Test name validation with various inputs
   */
  async testNameValidation() {
    // Test empty name
    await this.enterName('');
    await expect(this.submitButton).toBeDisabled();
    
    // Test valid name
    await this.enterName('John Doe');
    await expect(this.submitButton).toBeEnabled();
    await expect(this.characterCounter).toContainText('8/32 characters');
    
    // Test name at character limit
    const longName = 'A'.repeat(32);
    await this.enterName(longName);
    await expect(this.submitButton).toBeEnabled();
    await expect(this.characterCounter).toContainText('32/32 characters');
    
    // Test name over character limit (should be truncated by maxLength)
    const tooLongName = 'A'.repeat(35);
    await this.enterName(tooLongName);
    const actualValue = await this.getNameInputValue();
    expect(actualValue.length).toBeLessThanOrEqual(32);
  }

  /**
   * Simulate a successful name setting flow
   */
  async completeNameSetting(name: string) {
    await this.waitForModal();
    await this.setName(name);
    await this.waitForProcessing();
    await this.waitForSuccess();
    await this.waitForModalToClose();
  }

  /**
   * Simulate a name setting with validation error
   */
  async testValidationError() {
    await this.waitForModal();
    
    // Try to submit without entering a name
    await this.enterName('');
    await expect(this.submitButton).toBeDisabled();
    
    // Enter a name and clear it to trigger validation
    await this.enterName('Test');
    await this.enterName('');
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Check if the modal is in a loading/processing state
   */
  async isProcessing(): Promise<boolean> {
    const buttonText = await this.submitButton.textContent() || '';
    return buttonText.includes('Setting Name') || 
           buttonText.includes('Processing') || 
           buttonText.includes('Confirm in Wallet');
  }

  /**
   * Close the modal by clicking outside (if supported)
   */
  async clickOutside() {
    // Click on the backdrop (outside the modal content)
    await this.page.locator('.fixed.inset-0.bg-black.bg-opacity-50').click({
      position: { x: 10, y: 10 } // Click near the top-left corner
    });
  }
}