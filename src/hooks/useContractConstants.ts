import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI, CONTRACT_CONSTANTS } from '@/contracts/kindness-pool';

// Development mode - set to true for local development without deployed contracts
const DEVELOPMENT_MODE = true;

/**
 * Custom hook to fetch dynamic contract constants
 * Falls back to static constants if contract calls fail
 */
export function useContractConstants() {
  // Fetch dynamic constants from contract (only in production mode)
  const { data: minKindnessAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MIN_KINDNESS_AMOUNT',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  const { data: maxKindnessAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_KINDNESS_AMOUNT',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  const { data: maxDailyContribution } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_DAILY_CONTRIBUTION',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  const { data: maxReceivers } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_RECEIVERS',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  const { data: actionCooldown } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'ACTION_COOLDOWN',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  const { data: receiverPoolCooldown } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'RECEIVER_POOL_COOLDOWN',
    query: { enabled: !DEVELOPMENT_MODE },
  });

  return {
    // Convert to user-friendly formats with fallbacks
    minKindnessAmount: minKindnessAmount 
      ? parseFloat(formatEther(minKindnessAmount))
      : parseFloat(CONTRACT_CONSTANTS.MIN_KINDNESS_AMOUNT),
    
    maxKindnessAmount: maxKindnessAmount 
      ? parseFloat(formatEther(maxKindnessAmount))
      : parseFloat(CONTRACT_CONSTANTS.MAX_KINDNESS_AMOUNT),
    
    maxDailyContribution: maxDailyContribution 
      ? parseFloat(formatEther(maxDailyContribution))
      : parseFloat(CONTRACT_CONSTANTS.MAX_DAILY_CONTRIBUTION),
    
    maxReceivers: maxReceivers 
      ? parseInt(maxReceivers.toString())
      : parseInt(CONTRACT_CONSTANTS.MAX_RECEIVERS),
    
    actionCooldownHours: actionCooldown 
      ? parseInt(actionCooldown.toString()) / 3600
      : parseInt(CONTRACT_CONSTANTS.ACTION_COOLDOWN) / 3600,
    
    receiverPoolCooldownMinutes: receiverPoolCooldown 
      ? parseInt(receiverPoolCooldown.toString()) / 60
      : parseInt(CONTRACT_CONSTANTS.RECEIVER_POOL_COOLDOWN) / 60,

    // Raw values for contract interactions with fallbacks
    raw: {
      minKindnessAmount: minKindnessAmount ?? BigInt(parseFloat(CONTRACT_CONSTANTS.MIN_KINDNESS_AMOUNT) * 1e18),
      maxKindnessAmount: maxKindnessAmount ?? BigInt(parseFloat(CONTRACT_CONSTANTS.MAX_KINDNESS_AMOUNT) * 1e18),
      maxDailyContribution: maxDailyContribution ?? BigInt(parseFloat(CONTRACT_CONSTANTS.MAX_DAILY_CONTRIBUTION) * 1e18),
      maxReceivers: maxReceivers ?? BigInt(CONTRACT_CONSTANTS.MAX_RECEIVERS),
      actionCooldown: actionCooldown ?? BigInt(CONTRACT_CONSTANTS.ACTION_COOLDOWN),
      receiverPoolCooldown: receiverPoolCooldown ?? BigInt(CONTRACT_CONSTANTS.RECEIVER_POOL_COOLDOWN),
    }
  };
}