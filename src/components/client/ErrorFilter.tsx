'use client';

import { useEffect } from 'react';

export default function ErrorFilter() {
  useEffect(() => {
    // Comprehensive error filtering for browser extensions
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // Filter console.error
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('chrome.runtime.sendMessage') ||
          message.includes('Cannot redefine property: ethereum') ||
          message.includes('Cannot set property ethereum') ||
          message.includes('Extension ID')
        ) {
          return; // Suppress these errors
        }
        originalError.apply(console, args);
      };

      // Filter console.warn for wallet-related warnings
      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('Multiple wallet providers detected')) {
          return; // Suppress wallet provider warnings
        }
        originalWarn.apply(console, args);
      };

      // Global error handler for uncaught extension errors
      const handleGlobalError = (event: ErrorEvent) => {
        if (
          event.message?.includes('Cannot redefine property: ethereum') ||
          event.message?.includes('chrome.runtime.sendMessage') ||
          event.filename?.includes('extension://') ||
          event.filename?.includes('evmAsk.js') ||
          event.filename?.includes('inpage.js')
        ) {
          event.preventDefault();
          return false;
        }
      };

      window.addEventListener('error', handleGlobalError);
      
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        window.removeEventListener('error', handleGlobalError);
      };
    }
  }, []);

  return null; // This component doesn't render anything
}