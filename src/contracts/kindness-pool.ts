// Kindness Pool Contract Configuration
export const KINDNESS_POOL_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const;
export const USER_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
export const TIME_BASED_DISTRIBUTOR_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as const;

// Complete Pool Contract ABI
export const KINDNESS_POOL_ABI = [
  // Write functions
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'giveKindness',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'enterReceiverPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'leaveReceiverPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdrawContribution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Read functions
  {
    inputs: [],
    name: 'dailyPool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReceiverCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUnclaimedFunds',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isWithinDistributionWindow',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hasDistributedToday',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserDailyStats',
    outputs: [
      { name: 'contributionAmount', type: 'uint256' },
      { name: 'receiverEntries', type: 'uint256' },
      { name: 'receiverExits', type: 'uint256' },
      { name: 'lastResetDay', type: 'uint256' },
      { name: 'canContribute', type: 'bool' },
      { name: 'canEnterReceiverPool', type: 'bool' },
      { name: 'canLeaveReceiverPool', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getRemainingDailyContribution',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getWithdrawableAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Contract Constants - Read-only functions to get dynamic values
  {
    inputs: [],
    name: 'MIN_KINDNESS_AMOUNT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_KINDNESS_AMOUNT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_DAILY_CONTRIBUTION',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_RECEIVERS',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ACTION_COOLDOWN',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'RECEIVER_POOL_COOLDOWN',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'giver', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'KindnessGiven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'receiver', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'KindnessReceived',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'totalAmount', type: 'uint256' },
      { indexed: false, name: 'receiverCount', type: 'uint256' },
    ],
    name: 'PoolDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'receiver', type: 'address' }],
    name: 'EnteredReceiverPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'receiver', type: 'address' }],
    name: 'LeftReceiverPool',
    type: 'event',
  },
] as const;

// UserRegistry ABI (for reading user stats)
export const USER_REGISTRY_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserStats',
    outputs: [
      {
        components: [
          { name: 'totalGiven', type: 'uint256' },
          { name: 'totalReceived', type: 'uint256' },
          { name: 'timesReceived', type: 'uint256' },
          { name: 'lastActionTime', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'isInReceiverPool', type: 'bool' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'isInReceiverPool',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'name', type: 'string' }],
    name: 'setName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Contract constants - these should match the contract's constants
export const CONTRACT_CONSTANTS = {
  MIN_KINDNESS_AMOUNT: '0.001', // ETH
  MAX_KINDNESS_AMOUNT: '1', // ETH
  MAX_DAILY_CONTRIBUTION: '5', // ETH
  MAX_RECEIVERS: '100',
  ACTION_COOLDOWN: '3600', // 1 hour in seconds
  RECEIVER_POOL_COOLDOWN: '1800', // 30 minutes in seconds
  MIN_POOL_BALANCE: '0.01', // ETH
  MAX_TRANSACTIONS_PER_DAY: '10',
  MAX_DAILY_RECEIVER_ENTRIES: '1',
  MAX_DAILY_RECEIVER_EXITS: '1',
  WITHDRAWAL_COOLDOWN: '7200', // 2 hours in seconds
  MAX_DAILY_WITHDRAWALS: '3',
  MIN_WITHDRAWAL_AMOUNT: '0.001', // ETH
} as const;

// Helper functions to get dynamic values from contract if needed
export const getContractConstants = () => CONTRACT_CONSTANTS;

// Type for better TypeScript support
export type ContractConstants = typeof CONTRACT_CONSTANTS;