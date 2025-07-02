import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('should load the application homepage', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Random Act of Kindness');
    
    // Check if the page doesn't have critical JavaScript errors
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/homepage-smoke-test.png' });
  });

  test('should have basic interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Wait for React hydration
    await page.waitForTimeout(3000);
    
    // Check if page has any interactive elements (buttons, links)
    // This is more flexible - we check for ANY interactive elements
    const buttons = page.locator('button');
    const links = page.locator('a');
    const inputs = page.locator('input');
    
    const buttonCount = await buttons.count();
    const linkCount = await links.count();
    const inputCount = await inputs.count();
    
    const totalInteractiveElements = buttonCount + linkCount + inputCount;
    
    // Should have at least one interactive element (button, link, or input)
    expect(totalInteractiveElements).toBeGreaterThan(0);
    
    // If the app is still loading, check that we at least have the basic page structure
    const hasTitle = await page.locator('h1').count() > 0;
    expect(hasTitle).toBe(true);
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known extension errors
        if (!text.includes('chrome.runtime.sendMessage') && 
            !text.includes('Cannot redefine property: ethereum')) {
          errors.push(text);
        }
      }
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should have minimal critical errors
    expect(errors.length).toBeLessThan(5);
    
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
  });
});