'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI, USER_REGISTRY_ABI, USER_REGISTRY_ADDRESS } from '@/contracts/kindness-pool';
import { useContractConstants } from '@/hooks/useContractConstants';

export default function PoolDashboard() {
  const { address, isConnected } = useAccount();
  
  // Get dynamic constants from contract
  const constants = useContractConstants();

  // Pool statistics
  const { data: dailyPool } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'dailyPool',
  });

  const { data: receiverCount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getReceiverCount',
  });

  const { data: unclaimedFunds } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getUnclaimedFunds',
  });

  // User-specific data (only when connected)
  const { data: userStats } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getUserDailyStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: isInReceiverPool } = useReadContract({
    address: USER_REGISTRY_ADDRESS,
    abi: USER_REGISTRY_ABI,
    functionName: 'isInReceiverPool',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userTotalStats } = useReadContract({
    address: USER_REGISTRY_ADDRESS,
    abi: USER_REGISTRY_ABI,
    functionName: 'getUserStats',
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

  const { data: withdrawableAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'getWithdrawableAmount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="pool-dashboard">
      {/* Pool Statistics */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">🌟 Daily Pool Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Today&apos;s Pool</div>
              <div className="stat-value text-primary">
                {dailyPool ? `${parseFloat(formatEther(dailyPool)).toFixed(3)} ETH` : '0 ETH'}
              </div>
              <div className="stat-desc">Total contributions today</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Receivers</div>
              <div className="stat-value text-secondary">
                {receiverCount !== undefined ? receiverCount.toString() : '0'}
              </div>
              <div className="stat-desc">
                Max: {constants.maxReceivers}
              </div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Unclaimed Funds</div>
              <div className="stat-value text-accent">
                {unclaimedFunds ? `${parseFloat(formatEther(unclaimedFunds)).toFixed(3)} ETH` : '0 ETH'}
              </div>
              <div className="stat-desc">From failed transfers</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics (only when connected) */}
      {isConnected && address && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">📊 Your Statistics</h2>
            
            {/* Daily Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Today&apos;s Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-base-content/70">Contributed Today</div>
                  <div className="text-lg font-bold text-primary">
                    {userStats?.[0] ? `${formatEther(userStats[0])} ETH` : '0 ETH'}
                  </div>
                </div>
                
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-base-content/70">Remaining Limit</div>
                  <div className="text-lg font-bold text-secondary">
                    {remainingContribution ? `${formatEther(remainingContribution)} ETH` : `${constants.maxDailyContribution} ETH`}
                  </div>
                </div>
                
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-base-content/70">Withdrawable</div>
                  <div className="text-lg font-bold text-accent">
                    {withdrawableAmount ? `${formatEther(withdrawableAmount)} ETH` : '0 ETH'}
                  </div>
                </div>
                
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-base-content/70">Receiver Status</div>
                  <div className="text-lg font-bold">
                    {isInReceiverPool ? (
                      <span className="text-success">✓ In Pool</span>
                    ) : (
                      <span className="text-base-content">Not in Pool</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* All-Time Stats */}
            {userTotalStats && (
              <div>
                <h3 className="text-lg font-semibold mb-3">All-Time Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="text-sm text-base-content/70">Total Given</div>
                    <div className="text-xl font-bold text-primary">
                      {userTotalStats?.totalGiven ? formatEther(userTotalStats.totalGiven) : '0'} ETH
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 rounded-lg border border-secondary/20">
                    <div className="text-sm text-base-content/70">Total Received</div>
                    <div className="text-xl font-bold text-secondary">
                      {userTotalStats?.totalReceived ? formatEther(userTotalStats.totalReceived) : '0'} ETH
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-4 rounded-lg border border-accent/20">
                    <div className="text-sm text-base-content/70">Net Balance</div>
                    <div className={`text-xl font-bold ${userTotalStats && (userTotalStats.totalReceived >= userTotalStats.totalGiven) ? 'text-success' : 'text-error'}`}>
                      {userTotalStats ? 
                        `${userTotalStats.totalReceived >= userTotalStats.totalGiven ? '+' : ''}${formatEther(userTotalStats.totalReceived - userTotalStats.totalGiven)} ETH` : 
                        '0 ETH'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions for non-connected users */}
      {!isConnected && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <h2 className="card-title justify-center mb-4">💼 Connect Your Wallet</h2>
            <p className="text-base-content/70 mb-4">
              Connect your wallet to see your personal statistics and participate in the kindness pool.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🎁 Give Kindness</h4>
                <ul className="text-base-content/70 space-y-1">
                  <li>• Contribute {constants.minKindnessAmount} - {constants.maxKindnessAmount} ETH per transaction</li>
                  <li>• Max {constants.maxDailyContribution} ETH per day</li>
                  <li>• {constants.actionCooldownHours} hour cooldown between actions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤲 Receive Kindness</h4>
                <ul className="text-base-content/70 space-y-1">
                  <li>• Enter the receiver pool</li>
                  <li>• Cannot contribute same day</li>
                  <li>• Random distribution at day&apos;s end</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}