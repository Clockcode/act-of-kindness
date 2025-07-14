import { useEffect, useLayoutEffect } from 'react';

/**
 * A hook that uses useLayoutEffect on the client and useEffect on the server.
 * This prevents hydration mismatches when dealing with layout effects.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;