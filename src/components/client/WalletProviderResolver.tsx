'use client';

import { useEffect, useState } from 'react';

export default function WalletProviderResolver() {
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    // Detect wallet extension conflicts
    const checkWalletConflicts = () => {
      if (typeof window !== 'undefined') {
        const ethereum = window.ethereum;
        
        // Check if multiple providers exist
        if (ethereum?.providers && ethereum.providers.length > 1) {
          console.warn('Multiple wallet providers detected:', ethereum.providers.length);
          setHasConflict(true);
        }
        
        // Listen for provider conflicts
        const handleProviderError = (error: any) => {
          if (error.message?.includes('Cannot redefine property: ethereum') || 
              error.message?.includes('Cannot set property ethereum')) {
            setHasConflict(true);
          }
        };

        window.addEventListener('error', handleProviderError);
        return () => window.removeEventListener('error', handleProviderError);
      }
    };

    checkWalletConflicts();
  }, []);

  if (hasConflict) {
    return (
      <div className="alert alert-warning mb-4">
        <span>⚠️ Multiple wallet extensions detected. Please disable conflicting wallet extensions for best experience.</span>
      </div>
    );
  }

  return null;
}