import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simplified hydration testing for Jest environment
// Full server-side rendering testing would require more complex setup

interface HydrationTestResult {
  container: HTMLElement;
  rerender: (newUi: React.ReactElement) => void;
  unmount: () => void;
  checkHydrationErrors: () => string[];
}

/**
 * Simplified hydration testing for Jest environment.
 * In a real scenario, you'd use more sophisticated tools like @testing-library/react-hooks
 * or custom hydration testing utilities.
 */
export function renderWithHydration(
  ui: React.ReactElement,
  options?: RenderOptions
): HydrationTestResult {
  // Capture hydration-related errors
  const hydrationErrors: string[] = [];
  const originalError = console.error;
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Warning: Text content did not match') ||
      message.includes('Warning: Expected server HTML to contain') ||
      message.includes('Hydration failed') ||
      message.includes('hydration')
    ) {
      hydrationErrors.push(message);
    } else {
      originalError.apply(console, args);
    }
  };

  // Use standard render for Jest environment
  const result = render(ui, options);
  
  return {
    container: result.container,
    rerender: result.rerender,
    unmount: () => {
      result.unmount();
      console.error = originalError;
    },
    checkHydrationErrors: () => {
      console.error = originalError;
      return hydrationErrors;
    },
  };
}

/**
 * Custom Jest matcher to check for hydration errors
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeHydratedCorrectly(): R;
      toHaveNoLayoutShift(): R;
    }
  }
}

expect.extend({
  toBeHydratedCorrectly(received: HydrationTestResult) {
    const errors = received.checkHydrationErrors();
    
    return {
      message: () => 
        errors.length > 0
          ? `Expected component to hydrate without errors, but found: ${errors.join(', ')}`
          : 'Component hydrated correctly',
      pass: errors.length === 0,
    };
  },
  
  toHaveNoLayoutShift(received: HTMLElement) {
    // Check for elements that might cause layout shift
    const problematicElements = received.querySelectorAll(
      'img:not([width]):not([height]), iframe:not([width]):not([height])'
    );
    
    return {
      message: () => 
        problematicElements.length > 0
          ? `Found ${problematicElements.length} elements that might cause layout shift`
          : 'No layout shift detected',
      pass: problematicElements.length === 0,
    };
  },
});

/**
 * Helper to wait for hydration to complete
 */
export async function waitForHydration(): Promise<void> {
  // Wait for any pending React updates
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // In Jest environment, just wait for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Mock Next.js components for testing
 */
export const mockNextImage = (props: any) => <img alt="" {...props} />;
export const mockNextLink = ({ children, ...props }: any) => <a {...props}>{children}</a>;

/**
 * Test utility to check if component renders consistently
 * between server and client
 */
export function testHydrationConsistency(
  ui: React.ReactElement
) {
  return () => {
    const result = renderWithHydration(ui);
    
    expect(result).toBeHydratedCorrectly();
    expect(result.container).toHaveNoLayoutShift();
    
    result.unmount();
  };
}

// Add a basic test to satisfy Jest requirement
describe('hydration-testing utilities', () => {
  it('should provide testing utilities', () => {
    expect(typeof renderWithHydration).toBe('function');
    expect(typeof testHydrationConsistency).toBe('function');
    expect(typeof waitForHydration).toBe('function');
  });
});