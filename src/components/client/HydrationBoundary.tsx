'use client';

import { useEffect, useState } from 'react';

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /**
   * If true, suppresses hydration warnings for this boundary.
   * Use sparingly and only when you're certain the content will match after hydration.
   */
  suppressHydrationWarning?: boolean;
}

/**
 * A boundary component that prevents hydration mismatches by ensuring
 * client-only content is only rendered after hydration is complete.
 */
export function HydrationBoundary({ 
  children, 
  fallback = null,
  suppressHydrationWarning = false
}: HydrationBoundaryProps) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  );
}

/**
 * A hook that returns whether the component has mounted on the client.
 * Useful for conditional rendering of client-only content.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}