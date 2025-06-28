'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI } from '@/contracts/kindness-pool';
import { useContractConstants } from '@/hooks/useContractConstants';

interface GiveKindnessModalProps {
  onClose: () => void;
}

export default function GiveKindnessModal({ onClose }: GiveKindnessModalProps) {
  const { address, isConnected } = useAccount();
  const [kindnessAmount, setKindnessAmount] = useState('0.01');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get dynamic contract data
  const { data: userStats } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getUserDailyStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: remainingContribution } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getRemainingDailyContribution',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get dynamic constants from contract
  const constants = useContractConstants();
  
  const minAmount = constants.minKindnessAmount;
  const maxAmount = constants.maxKindnessAmount;
  const maxDailyAmount = constants.maxDailyContribution;
  const canContribute = userStats ? userStats[4] : true;
  const remainingLimit = remainingContribution ? parseFloat(formatEther(remainingContribution)) : maxDailyAmount;

  const handleGiveKindness = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(kindnessAmount);
    if (amount < minAmount || amount > maxAmount) {
      alert(`Amount must be between ${minAmount} and ${maxAmount} ETH`);
      return;
    }

    if (amount > remainingLimit) {
      alert(`Amount exceeds your daily limit. Remaining: ${remainingLimit} ETH`);
      return;
    }

    if (!canContribute) {
      alert('You cannot contribute more today');
      return;
    }

    try {
      const amountWei = parseEther(kindnessAmount);
      writeContract({
        address: KINDNESS_POOL_ADDRESS,
        abi: KINDNESS_POOL_ABI,
        functionName: 'giveKindness',
        args: [amountWei],
        value: amountWei,
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  // Update confirmation state based on transaction success
  if (isTransactionSuccess && !isConfirmed) {
    setIsConfirmed(true);
  }

  const isCurrentlyProcessing = isPending || isTransactionLoading;

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600">Kindness Sent!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You have successfully sent {kindnessAmount} ETH to the kindness pool.
            </p>
            
            <div className="space-y-3 pt-4">
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                onClick={() => {
                  setIsConfirmed(false);
                  setKindnessAmount('0.01');
                }}
              >
                Send More
              </button>
              
              <button
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => alert('Withdraw functionality coming soon!')}
              >
                Withdraw Amount
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🎁 Give Kindness</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Contribute ETH to today&apos;s kindness pool. Your generosity will be distributed to random receivers.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              placeholder="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={kindnessAmount}
              onChange={(e) => setKindnessAmount(e.target.value)}
              min={minAmount.toString()}
              max={Math.min(maxAmount, remainingLimit).toString()}
              step="0.001"
            />
            <p className="text-sm text-gray-500 mt-1">
              Min: {minAmount} ETH | Max: {maxAmount} ETH | Remaining today: {remainingLimit.toFixed(3)} ETH
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">How it works:</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Your contribution goes into today&apos;s pool</li>
              <li>• Pool is distributed randomly to receivers</li>
              <li>• {constants.actionCooldownHours} hour cooldown between actions</li>
              <li>• Daily limit: {maxDailyAmount} ETH per user</li>
            </ul>
          </div>

          {!isConnected && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-700">Please connect your wallet first</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded flex items-center justify-center"
              onClick={handleGiveKindness}
              disabled={!isConnected || isCurrentlyProcessing || !canContribute}
            >
              {isCurrentlyProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isPending ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                'Give Kindness'
              )}
            </button>
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