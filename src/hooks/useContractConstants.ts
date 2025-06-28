import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI, CONTRACT_CONSTANTS } from '@/contracts/kindness-pool';

/**
 * Custom hook to fetch dynamic contract constants
 * Falls back to static constants if contract calls fail
 */
export function useContractConstants() {
  // Fetch dynamic constants from contract
  const { data: minKindnessAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MIN_KINDNESS_AMOUNT',
  });

  const { data: maxKindnessAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_KINDNESS_AMOUNT',
  });

  const { data: maxDailyContribution } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_DAILY_CONTRIBUTION',
  });

  const { data: maxReceivers } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MAX_RECEIVERS',
  });

  const { data: actionCooldown } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'ACTION_COOLDOWN',
  });

  const { data: receiverPoolCooldown } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'RECEIVER_POOL_COOLDOWN',
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

    // Raw values for contract interactions
    raw: {
      minKindnessAmount,
      maxKindnessAmount,
      maxDailyContribution,
      maxReceivers,
      actionCooldown,
      receiverPoolCooldown,
    }
  };
}