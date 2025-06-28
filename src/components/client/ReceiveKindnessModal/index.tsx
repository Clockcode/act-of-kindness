'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI, USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI } from '@/contracts/kindness-pool';
import { useContractConstants } from '@/hooks/useContractConstants';

// Development mode - set to true for local development without deployed contracts
const DEVELOPMENT_MODE = true;

interface ReceiveKindnessModalProps {
  onClose: () => void;
}

export default function ReceiveKindnessModal({ onClose }: ReceiveKindnessModalProps) {
  const { address, isConnected } = useAccount();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Mock data for development mode
  const mockDailyPool = parseEther('2.5'); // 2.5 ETH
  const mockReceiverCount = 15;
  const mockIsInReceiverPool = false;
  const mockUserStats = [
    0n, // contributionAmount
    0n, // receiverEntries  
    0n, // receiverExits
    0n, // lastResetDay
    true, // canContribute
    true, // canEnterReceiverPool
    false, // canLeaveReceiverPool
  ];

  // Get dynamic contract data with automatic refetching (only in production)
  const { data: dailyPool, isLoading: isDailyPoolLoading } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'dailyPool',
    query: {
      enabled: !DEVELOPMENT_MODE,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  const { data: receiverCount, isLoading: isReceiverCountLoading } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getReceiverCount',
    query: {
      enabled: !DEVELOPMENT_MODE,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  const { data: isInReceiverPool, isLoading: isReceiverPoolStatusLoading } = useReadContract({
    address: USER_REGISTRY_ADDRESS,
    abi: USER_REGISTRY_ABI,
    functionName: 'isInReceiverPool',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && !DEVELOPMENT_MODE,
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  const { data: userStats, isLoading: isUserStatsLoading } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getUserDailyStats',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && !DEVELOPMENT_MODE,
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  // Use mock data in development mode
  const finalDailyPool = DEVELOPMENT_MODE ? mockDailyPool : dailyPool;
  const finalReceiverCount = DEVELOPMENT_MODE ? mockReceiverCount : receiverCount;
  const finalIsInReceiverPool = DEVELOPMENT_MODE ? mockIsInReceiverPool : isInReceiverPool;
  const finalUserStats = DEVELOPMENT_MODE ? mockUserStats : userStats;
  const finalIsDailyPoolLoading = DEVELOPMENT_MODE ? false : isDailyPoolLoading;
  const finalIsReceiverCountLoading = DEVELOPMENT_MODE ? false : isReceiverCountLoading;
  const finalIsReceiverPoolStatusLoading = DEVELOPMENT_MODE ? false : isReceiverPoolStatusLoading;
  const finalIsUserStatsLoading = DEVELOPMENT_MODE ? false : isUserStatsLoading;

  const { writeContract: writeEnter, data: enterHash, isPending: isEnterPending } = useWriteContract();
  const { writeContract: writeLeave, data: leaveHash, isPending: isLeavePending } = useWriteContract();
  
  const { isLoading: isEnterLoading, isSuccess: isEnterSuccess } = useWaitForTransactionReceipt({
    hash: enterHash,
  });
  
  const { isLoading: isLeaveLoading, isSuccess: isLeaveSuccess } = useWaitForTransactionReceipt({
    hash: leaveHash,
  });

  // Get dynamic constants from contract
  const constants = useContractConstants();
  
  const maxReceivers = constants.maxReceivers;
  const canEnterPool = finalUserStats ? finalUserStats[5] : false; // canEnterReceiverPool from getUserDailyStats
  const canLeavePool = finalUserStats ? finalUserStats[6] : false; // canLeaveReceiverPool from getUserDailyStats
  const isCurrentlyInPool = finalIsInReceiverPool || false;
  
  const isProcessing = isEnterPending || isLeavePending || isEnterLoading || isLeaveLoading;

  const handleEnterPool = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!canEnterPool) {
      alert('You cannot enter the receiver pool today. You may have already contributed or reached daily limits.');
      return;
    }

    try {
      writeEnter({
        address: KINDNESS_POOL_ADDRESS,
        abi: KINDNESS_POOL_ABI,
        functionName: 'enterReceiverPool',
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  const handleLeavePool = async () => {
    if (!canLeavePool) {
      alert('You cannot leave the receiver pool at this time.');
      return;
    }

    try {
      writeLeave({
        address: KINDNESS_POOL_ADDRESS,
        abi: KINDNESS_POOL_ABI,
        functionName: 'leaveReceiverPool',
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  // Update confirmation state based on transaction success
  if ((isEnterSuccess || isLeaveSuccess) && !isConfirmed) {
    setIsConfirmed(true);
  }

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600">
              {isEnterSuccess ? 'Entered Receiver Pool!' : 'Left Receiver Pool!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {isEnterSuccess 
                ? 'You are now in the receiver pool and eligible to receive kindness from today&apos;s contributions.'
                : 'You have successfully left the receiver pool.'
              }
            </p>
            
            <div className="space-y-3 pt-4">
              {isEnterSuccess && (
                <button
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  onClick={() => {
                    setIsConfirmed(false);
                    handleLeavePool();
                  }}
                >
                  Leave Pool
                </button>
              )}
              
              <button
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => alert('Withdraw functionality coming soon!')}
              >
                Withdraw
              </button>
              
              <button
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🤲 Receive Kindness</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Enter the receiver pool to have a chance of receiving kindness from today&apos;s contributions.
          </p>

          <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 p-4">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              You can only receive if you haven&apos;t contributed today. One entry per day.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-blue-500">🎯</span>
              Live Pool Status
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Today&apos;s Pool:</span>
                <div className="font-medium text-gray-800 dark:text-white">
                  {finalIsDailyPoolLoading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : finalDailyPool ? (
                    `${parseFloat(formatEther(finalDailyPool)).toFixed(3)} ETH`
                  ) : (
                    '0 ETH'
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Receivers:</span>
                <div className="font-medium text-gray-800 dark:text-white">
                  {finalIsReceiverCountLoading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    `${finalReceiverCount !== undefined ? finalReceiverCount.toString() : '0'}/${maxReceivers}`
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 dark:text-gray-400">Your Status:</span>
                <div className="font-medium text-gray-800 dark:text-white">
                  {finalIsReceiverPoolStatusLoading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : isCurrentlyInPool ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      In Receiver Pool
                    </span>
                  ) : (
                    <span className="text-gray-500">Not in Pool</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">📜</span>
              Requirements & Rules
            </h4>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-500 text-xs">•</span>
                <span>Cannot have contributed today to enter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">•</span>
                <span>Maximum {maxReceivers} receivers in the pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 text-xs">•</span>
                <span>{constants.receiverPoolCooldownMinutes} minutes cooldown between pool changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 text-xs">•</span>
                <span>Pool is distributed randomly at day&apos;s end</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 text-xs">•</span>
                <span>Can leave the pool anytime before distribution</span>
              </li>
            </ul>
          </div>

          {!isConnected && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Please connect your wallet first</p>
            </div>
          )}

          {isConnected && finalIsUserStatsLoading && (
            <div className="bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Loading your account status...</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {!isCurrentlyInPool ? (
              <button
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded flex items-center justify-center"
                onClick={handleEnterPool}
                disabled={!isConnected || isProcessing || !canEnterPool}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEnterPending || isEnterLoading ? 'Entering...' : 'Processing...'}
                  </>
                ) : (
                  'Enter Pool'
                )}
              </button>
            ) : (
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 px-4 rounded flex items-center justify-center"
                onClick={handleLeavePool}
                disabled={!isConnected || isProcessing || !canLeavePool}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLeavePending || isLeaveLoading ? 'Leaving...' : 'Processing...'}
                  </>
                ) : (
                  'Leave Pool'
                )}
              </button>
            )}
            <button 
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}