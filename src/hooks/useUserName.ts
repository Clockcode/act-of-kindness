import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI } from '@/contracts/kindness-pool';
import { useState, useEffect } from 'react';

// Development mode - set to true for local development without deployed contracts
const DEVELOPMENT_MODE = true;

export function useUserName() {
  const { address, isConnected } = useAccount();
  const [localName, setLocalName] = useState<string>('');
  const [isSettingName, setIsSettingName] = useState(false);
  
  // Use localStorage to persist dev name across sessions/refreshes
  const getStoredName = () => {
    if (typeof window !== 'undefined' && address) {
      return localStorage.getItem(`userName_${address}`) || '';
    }
    return '';
  };
  
  const [devUserName, setDevUserName] = useState<string>(getStoredName);

  // Get user stats which includes the name (only in production mode)
  const { data: userStats, refetch: refetchUserStats } = useReadContract({
    address: USER_REGISTRY_ADDRESS,
    abi: USER_REGISTRY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !DEVELOPMENT_MODE },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Update dev name from localStorage when address changes
  useEffect(() => {
    if (DEVELOPMENT_MODE && address) {
      const storedName = getStoredName();
      setDevUserName(storedName);
    }
  }, [address]);

  // Extract name from user stats struct or use dev name
  const userName = DEVELOPMENT_MODE ? devUserName : (userStats ? userStats.name : '');
  const hasName = userName && userName.length > 0;

  // Set name in contract or locally in dev mode
  const setUserName = async (name: string) => {
    if (!isConnected || !address || !name.trim()) {
      return;
    }

    try {
      setIsSettingName(true);
      
      if (DEVELOPMENT_MODE) {
        // Simulate transaction in development mode
        setTimeout(() => {
          const trimmedName = name.trim();
          setDevUserName(trimmedName);
          // Store in localStorage for persistence
          if (typeof window !== 'undefined' && address) {
            localStorage.setItem(`userName_${address}`, trimmedName);
          }
          setIsSettingName(false);
        }, 2000);
        return;
      }

      // Production mode - actual contract call
      writeContract({
        address: USER_REGISTRY_ADDRESS,
        abi: USER_REGISTRY_ABI,
        functionName: 'setName',
        args: [name.trim()],
      });
    } catch (error) {
      console.error('Failed to set user name:', error);
      setIsSettingName(false);
    }
  };

  // Handle transaction success (only in production mode)
  useEffect(() => {
    if (!DEVELOPMENT_MODE && isTransactionSuccess) {
      setIsSettingName(false);
      // Give a small delay before refetching to ensure blockchain state is updated
      setTimeout(() => {
        refetchUserStats();
      }, 1000);
    }
  }, [isTransactionSuccess, refetchUserStats]);

  return {
    userName,
    hasName,
    localName,
    setLocalName,
    setUserName,
    isSettingName: isSettingName || (!DEVELOPMENT_MODE && (isPending || isTransactionLoading)),
    isFirstTime: isConnected && !hasName,
    isTransactionSuccess: DEVELOPMENT_MODE ? hasName : isTransactionSuccess,
    isTransactionPending: DEVELOPMENT_MODE ? false : isPending,
    isTransactionLoading: DEVELOPMENT_MODE ? false : isTransactionLoading,
    error: DEVELOPMENT_MODE ? null : (writeError || receiptError),
  };
}